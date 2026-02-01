const { Stock, StockLog } = require('../models');
const { sequelize } = require('../config/database');
const externalApi = require('../utils/external.api');
const { Op } = require('sequelize');

class InventoryService {
  /**
   * Cập nhật kho (IN/OUT)
   */
  async updateStock({ order_id, type, items, performed_by = 'SYSTEM' }) {
    const transaction = await sequelize.transaction();
    try {
      for (const item of items) {
        if (type === 'IN') {
          // Nhập kho: Thêm mới hoặc cộng dồn vào batch/location
          const batch_number = item.batch_number || `BATCH-${new Date().toISOString().slice(0, 10)}`;
          const location_code = item.location_code || 'DEFAULT-ZONE';

          // Cập nhật giá vốn bình quân (Weighted Average Cost)
          // 1. Lấy thông tin sản phẩm hiện tại để biết giá cũ và tồn cũ (nếu có trường average_cost bên product-service thì tốt, hoặc query ở đây)
          // Tuy nhiên, Stock table ở Inventory service lưu số lượng. Product table ở Product service lưu giá.
          // Để chính xác:
          //    - Lấy tổng tồn hiện tại (CurrentQty) từ Inventory DB
          //    - Lấy giá bình quân hiện tại (CurrentCost) từ Product Service (API call)
          //    - Tính NewAvg = ((CurrentQty * CurrentCost) + (InQty * InCost)) / (CurrentQty + InQty)
          //    - Gọi API cập nhật giá mới sang Product Service

          try {
            const currentTotalStock = await Stock.sum('quantity', { where: { product_id: item.product_id } }) || 0;
            const productInfo = await externalApi.getProduct(item.product_id);

            if (productInfo) {
              const currentAvgCost = Number(productInfo.average_cost) || Number(productInfo.price) || 0; // Fallback to price if avg not set
              const inboundQty = Number(item.quantity) || 0;
              const inboundCost = Number(item.price) || 0; // This IS the effective_unit_cost passed from Inbound Controller

              const totalOldValue = Number(currentTotalStock) * currentAvgCost;
              const totalInboundValue = inboundQty * inboundCost;
              const newTotalQty = Number(currentTotalStock) + inboundQty;

              if (newTotalQty > 0) {
                const newAvgCost = (totalOldValue + totalInboundValue) / newTotalQty;
                // Update Product Service
                await externalApi.updateProductCost(item.product_id, newAvgCost);
                console.log(`Updated Avg Cost for ${item.product_id}: was ${currentAvgCost}, in ${inboundCost}, now ${newAvgCost}`);
              }
            }
          } catch (costErr) {
            console.error(`Failed to calculate average cost for product ${item.product_id}:`, costErr);
            // Swallow error to allow stock update to proceed
          }

          await Stock.create({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            batch_number,
            location_code,
            warehouse_id: 1
          }, { transaction });

        } else if (type === 'OUT') {
          // Xuất kho: Trừ theo FIFO (hoặc theo vị trí chỉ định)
          let remainToExport = Number(item.quantity);

          const whereClause = { product_id: item.product_id, quantity: { [Op.gt]: 0 } };
          if (item.location_code) {
            whereClause.location_code = item.location_code;
          }

          const batches = await Stock.findAll({
            where: whereClause,
            order: [['created_at', 'ASC']], // FIFO
            transaction
          });

          for (const batch of batches) {
            if (remainToExport <= 0) break;
            const exportQty = Math.min(batch.quantity, remainToExport);
            batch.quantity -= exportQty;
            remainToExport -= exportQty;
            await batch.save({ transaction });

            // Log log cho từng lô
            await StockLog.create({
              product_id: item.product_id,
              order_id,
              type: 'OUT',
              quantity: exportQty,
              batch_number: batch.batch_number,
              location_code: batch.location_code,
              performed_by
            }, { transaction });
          }

          if (remainToExport > 0) {
            throw new Error(`Sản phẩm ID ${item.product_id} không đủ tồn kho thực tế để xuất hết`);
          }
        }

        if (type === 'IN') {
          await StockLog.create({
            product_id: item.product_id,
            order_id,
            type: 'IN',
            quantity: item.quantity,
            batch_number: item.batch_number || 'DEFAULT',
            location_code: item.location_code || 'DEFAULT',
            performed_by
          }, { transaction });
        }
      }
      await transaction.commit();
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Gợi ý xuất kho theo FIFO
   */
  async suggestFIFO(product_id, quantity) {
    const batches = await Stock.findAll({
      where: { product_id, quantity: { [Op.gt]: 0 } },
      order: [['created_at', 'ASC']]
    });

    let remain = quantity;
    const suggestions = [];
    for (const batch of batches) {
      if (remain <= 0) break;
      const pick = Math.min(batch.quantity, remain);
      suggestions.push({
        batch_number: batch.batch_number,
        location_code: batch.location_code,
        quantity: pick
      });
      remain -= pick;
    }
    return { product_id, available: remain === 0, suggestions };
  }

  /**
   * Kiểm tra tồn kho tổng quát
   */
  async checkStock(items) {
    const results = [];
    let allAvailable = true;
    const messages = [];

    for (const item of items) {
      const totalStock = await Stock.sum('quantity', { where: { product_id: item.product_id } }) || 0;
      const isAvail = totalStock >= item.quantity;
      if (!isAvail) {
        allAvailable = false;
        messages.push(`Sản phẩm ${item.product_id} chỉ còn ${totalStock}, yêu cầu ${item.quantity}`);
      }
    }
    return { available: allAvailable, messages };
  }

  /**
   * Kiểm tra dung lượng vị trí kho
   */
  async checkLocationCapacity(location_code, additional_quantity = 0) {
    try {
      // 1. Lấy thông tin location từ product-service
      const locationInfo = await externalApi.getLocationByCode(location_code);
      if (!locationInfo) {
        return {
          error: `Vị trí ${location_code} không tồn tại`,
          can_fit: false
        };
      }

      const capacity = Number(locationInfo.capacity) || 1000;

      // 2. Tính tổng tồn kho hiện tại tại location_code
      const currentStock = await Stock.sum('quantity', {
        where: { location_code }
      }) || 0;

      const available = capacity - currentStock;
      const can_fit = available >= additional_quantity;

      return {
        location_code,
        capacity,
        current_stock: currentStock,
        available,
        can_fit,
        warning: available < capacity * 0.2 ? 'Vị trí sắp đầy' : null
      };
    } catch (error) {
      console.error('Check Location Capacity Error:', error);
      return { error: error.message, can_fit: false };
    }
  }

  /**
   * Điều chuyển kho nội bộ (Internal Transfer)
   */
  async transferStock({ product_id, from_location, to_location, batch_number, quantity, performed_by }) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Kiểm tra nguồn
      const source = await Stock.findOne({
        where: { product_id, location_code: from_location, batch_number, quantity: { [Op.gte]: quantity } },
        transaction
      });

      if (!source) throw new Error('Không tìm thấy lô hàng hoặc số lượng không đủ để điều chuyển');

      // 2. Trừ nguồn
      source.quantity = Number(source.quantity) - Number(quantity);
      await source.save({ transaction });

      // 3. Cộng đích
      const [dest, created] = await Stock.findOrCreate({
        where: { product_id, location_code: to_location, batch_number },
        defaults: { quantity, warehouse_id: 1 },
        transaction
      });

      if (!created) {
        dest.quantity = Number(dest.quantity) + Number(quantity);
        await dest.save({ transaction });
      }

      // 4. Log
      await StockLog.create({
        product_id,
        type: 'OUT',
        quantity,
        batch_number,
        location_code: from_location,
        performed_by: `${performed_by} (TRANSFER FROM)`
      }, { transaction });

      await StockLog.create({
        product_id,
        type: 'IN',
        quantity,
        batch_number,
        location_code: to_location,
        performed_by: `${performed_by} (TRANSFER TO)`
      }, { transaction });

      await transaction.commit();
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Lấy tồn kho chi tiết theo vị trí
   */
  async getStockByLocation(product_id) {
    const stocks = await Stock.findAll({
      where: product_id ? { product_id } : {},
      order: [['location_code', 'ASC']]
    });
    return stocks;
  }

  /**
   * Báo cáo Nhập-Xuất-Tồn (Aggregator)
   */
  async getReport(filters = {}) {
    try {
      const products = await externalApi.getAllProducts();

      const stockWhere = {};
      const logWhere = {};

      if (filters.location_code) {
        stockWhere.location_code = { [Op.like]: `${filters.location_code}%` };
        logWhere.location_code = { [Op.like]: `${filters.location_code}%` };
      }

      const stocks = await Stock.findAll({
        attributes: [
          'product_id',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'total_stock']
        ],
        where: stockWhere,
        group: ['product_id']
      });

      const stockLogs = await StockLog.findAll({
        attributes: [
          'product_id',
          'type',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'total_qty']
        ],
        where: logWhere,
        group: ['product_id', 'type']
      });

      console.log(`DEBUG: Found ${products.length} products`);
      console.log(`DEBUG: Found ${stocks.length} stock records`);
      if (stocks.length > 0) console.log('DEBUG: Sample stock:', stocks[0].toJSON());

      const report = products.map(p => {
        const s = stocks.find(st => st.product_id == p.id); // Loose equality
        const ins = stockLogs.find(l => l.product_id == p.id && l.type === 'IN');
        const outs = stockLogs.find(l => l.product_id == p.id && l.type === 'OUT');
        const currentStock = s ? Number(s.getDataValue('total_stock')) : 0;

        // Console log specific product for debugging
        if (s) console.log(`DEBUG: Product Match ${p.id} - Stock: ${currentStock}`);

        return {
          product_id: p.id,
          sku: p.sku,
          name: p.name,
          uom: p.unit || p.don_vi_tinh,
          total_in: ins ? Number(ins.getDataValue('total_qty')) : 0,
          total_out: outs ? Number(outs.getDataValue('total_qty')) : 0,
          current_stock: currentStock,
          min_stock: p.min_stock || 0,
          status: currentStock <= (p.min_stock || 0) ? 'LOW_STOCK' : 'NORMAL'
        };
      });

      return report;
    } catch (error) {
      console.error('Aggregator Report Error:', error);
      throw error;
    }
  }

  /**
   * Báo cáo sức chứa kho
   */
  async getLocationCapacityReport() {
    try {
      // 1. Get all locations from product-service
      const locations = await externalApi.getAllLocations();

      // 2. Get current stock aggregated by location
      const stocks = await Stock.findAll({
        attributes: [
          'location_code',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'current_stock']
        ],
        group: ['location_code'],
        where: { location_code: { [Op.ne]: null } }
      });

      // 3. Map stock to locations
      // Create a map for faster lookup
      const stockMap = {};
      stocks.forEach(s => {
        stockMap[s.location_code] = Number(s.getDataValue('current_stock'));
      });

      const report = locations.map(loc => {
        const used = stockMap[loc.location_code] || 0;
        const capacity = Number(loc.capacity) || 0;
        return {
          id: loc.id,
          location_code: loc.location_code,
          warehouse_id: loc.warehouse || loc.warehouse_id,
          capacity: capacity,
          used: used,
          available: capacity - used,
          usage_percent: capacity > 0 ? ((used / capacity) * 100).toFixed(1) : 0
        };
      });

      return report;
    } catch (error) {
      console.error('Location Capacity Report Error:', error);
      throw error;
    }
  }
}

module.exports = new InventoryService();
