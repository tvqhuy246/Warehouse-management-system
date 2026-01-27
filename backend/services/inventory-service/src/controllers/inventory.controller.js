const inventoryService = require('../services/inventory.service');

class InventoryController {
  /**
   * Cập nhật kho (Dùng cho cả IN và OUT)
   */
  async update(req, res, next) {
    try {
      const result = await inventoryService.updateStock(req.body);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Kiểm tra tồn kho trước khi xuất
   */
  async check(req, res, next) {
    try {
      const result = await inventoryService.checkStock(req.body.items);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gợi ý xuất kho theo FIFO (Hàm giúp FE/Service gợi ý lô hàng)
   */
  async suggestFIFO(req, res, next) {
    try {
      const { product_id, quantity } = req.query;
      if (!product_id || !quantity) return res.status(400).json({ error: 'Missing product_id or quantity' });
      const result = await inventoryService.suggestFIFO(product_id, Number(quantity));
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Báo cáo Nhập-Xuất-Tồn (Aggregator)
   */
  async report(req, res, next) {
    try {
      const data = await inventoryService.getReport(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async transfer(req, res, next) {
    try {
      const result = await inventoryService.transferStock(req.body);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getByLocation(req, res, next) {
    try {
      const { product_id } = req.query;
      const data = await inventoryService.getStockByLocation(product_id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // Tạm giữ hàm cũ để tránh break các route chưa refactor (nếu có)
  async listInventory(req, res, next) {
    try {
      const data = await inventoryService.getReport(); // Re-use report logic for listing
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async checkCapacity(req, res, next) {
    try {
      const { location_code } = req.query;
      if (!location_code) throw new Error('Location code is required');
      const result = await inventoryService.checkLocationCapacity(location_code);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();
