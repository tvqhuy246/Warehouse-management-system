const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { Order, OrderDetail, Partner, Product } = require('../models');
const inventoryApi = require('../services/inventory.api');
const productApi = require('../services/product.api');
const ExcelJS = require('exceljs');

class XuatKhoController {
    /**
     * Xuất danh sách phiếu xuất ra Excel
     */
    async exportPhieuXuat(req, res) {
        try {
            // 1. Lấy danh sách phiếu xuất từ DB
            const { from, to } = req.query;
            const whereClause = { type: 'OUT' };

            if (from || to) {
                whereClause.created_at = {};
                if (from) whereClause.created_at[Op.gte] = new Date(from);
                if (to) whereClause.created_at[Op.lte] = new Date(new Date(to).setHours(23, 59, 59, 999));
            }

            const orders = await Order.findAll({
                where: whereClause,
                include: [
                    { model: Partner, as: 'partner' },
                    { model: OrderDetail, as: 'details' }
                ],
                order: [['created_at', 'DESC']]
            });

            // 2. Lấy danh sách tất cả sản phẩm
            const products = await productApi.getAllProducts();
            const productMap = {};
            products.forEach(p => {
                productMap[p.id] = p;
            });

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Danh sách Phiếu Xuất');

            worksheet.columns = [
                { header: 'Mã Phiếu', key: 'order_code', width: 20 },
                { header: 'Khách Hàng', key: 'partner_name', width: 30 },
                { header: 'Ngày Xuất', key: 'created_at', width: 25 },
                { header: 'Người Tạo', key: 'created_by', width: 20 },
                { header: 'Tổng Tiền', key: 'total_amount', width: 20 },
                { header: 'Trạng Thái', key: 'status', width: 15 },
                { header: 'Sản Phẩm', key: 'products', width: 40 },
                { header: 'Vị Trí', key: 'locations', width: 30 }
            ];

            orders.forEach(order => {
                const productList = [];
                const locationList = [];

                order.details.forEach(d => {
                    const product = productMap[d.product_id];
                    const sku = product ? product.sku : 'N/A';
                    const name = product ? (product.name || product.ten_san_pham) : d.product_id;
                    productList.push(`${sku} - ${name} (${d.quantity})`);

                    if (d.location_code) {
                        locationList.push(`${d.location_code} (${d.quantity})`);
                    }
                });

                worksheet.addRow({
                    order_code: order.order_code,
                    partner_name: order.partner?.name,
                    created_at: new Date(order.createdAt || order.created_at).toLocaleString('vi-VN'),
                    created_by: order.created_by,
                    total_amount: order.total_amount,
                    status: order.status,
                    products: productList.join(',\n'),
                    locations: locationList.join(',\n')
                });

                worksheet.lastRow.getCell('products').alignment = { wrapText: true };
                worksheet.lastRow.getCell('locations').alignment = { wrapText: true };
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=PhieuXuat.xlsx');

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error('Export Error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Tạo phiếu xuất kho mới (PX)
     */
    async taoPhieuXuat(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { partner_id, warehouse_id, note, details, created_by } = req.body;

            if (!partner_id || !details || details.length === 0) {
                if (transaction) await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Thiếu thông tin partner_id hoặc chi tiết hàng' });
            }

            // Kiểm tra partner
            const partner = await Partner.findByPk(partner_id);
            if (!partner || partner.type !== 2) {
                if (transaction) await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Khách hàng không hợp lệ' });
            }

            // 1. Kiểm tra tồn kho trước khi cho phép tạo phiếu (Theo yêu cầu)
            try {
                const stockCheck = await inventoryApi.checkStock(details);
                if (!stockCheck.available) {
                    if (transaction) await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Không đủ tồn kho để xuất hàng',
                        details: stockCheck.messages
                    });
                }
            } catch (invError) {
                if (transaction) await transaction.rollback();
                return res.status(503).json({ success: false, message: 'Dịch vụ kho không phản hồi' });
            }

            const order_code = await this.taoMaPhieu('PX');

            const order = await Order.create({
                order_code,
                type: 'OUT',
                status: 'PENDING',
                partner_id,
                warehouse_id: warehouse_id || 1,
                note,
                created_by
            }, { transaction });

            let total_amount = 0;
            const orderDetails = details.map(item => {
                total_amount += Number(item.quantity) * Number(item.price);
                return {
                    order_id: order.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    actual_quantity: item.quantity,
                    location_code: item.location_code || null
                };
            });

            await OrderDetail.bulkCreate(orderDetails, { transaction });
            await order.update({ total_amount }, { transaction });

            // Chuyển sang COMPLETED và cập nhật kho
            await order.update({ status: 'COMPLETED' }, { transaction });

            await transaction.commit();

            // Cập nhật tồn kho thực tế
            try {
                await inventoryApi.updateStock({
                    order_id: order.id,
                    type: 'OUT',
                    items: details,
                    performed_by: order.created_by
                });
            } catch (invError) {
                console.error('Inventory Sync Error:', invError.message);
            }

            const result = await Order.findByPk(order.id, {
                include: [
                    { model: Partner, as: 'partner' },
                    { model: OrderDetail, as: 'details' }
                ]
            });

            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('DEBUG: taoPhieuXuat Error:', error);
            if (transaction && !transaction.finished) await transaction.rollback();
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async layDanhSachPhieuXuat(req, res) {
        try {
            const { from, to } = req.query;
            const whereClause = { type: 'OUT' };

            if (from || to) {
                whereClause.created_at = {};
                if (from) whereClause.created_at[Op.gte] = new Date(from);
                if (to) whereClause.created_at[Op.lte] = new Date(new Date(to).setHours(23, 59, 59, 999));
            }

            const orders = await Order.findAll({
                where: whereClause,
                include: [{ model: Partner, as: 'partner' }],
                order: [['created_at', 'DESC']]
            });
            res.json({ success: true, data: orders });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async layChiTietPhieuXuat(req, res) {
        try {
            const order = await Order.findByPk(req.params.id, {
                include: [
                    { model: Partner, as: 'partner' },
                    { model: OrderDetail, as: 'details' }
                ]
            });
            if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu' });

            // Fetch all products to map info
            const products = await productApi.getAllProducts();
            const productMap = {};
            if (Array.isArray(products)) {
                products.forEach(p => { productMap[p.id] = p; });
            }

            // Transform details
            const orderJSON = order.toJSON();
            orderJSON.details = orderJSON.details.map(d => {
                const product = productMap[d.product_id] || {};
                return {
                    ...d,
                    product: {
                        id: product.id || d.product_id,
                        ten_san_pham: product.name || product.ten_san_pham || 'Unknown Product',
                        sku: product.sku || 'N/A',
                        don_vi_tinh: product.unit || product.don_vi_tinh || '',
                        price: product.price || 0
                    }
                };
            });

            res.json({ success: true, data: orderJSON });
        } catch (error) {
            console.error('Error in layChiTietPhieuXuat:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * API trả về JSON chuẩn để in Vận đơn (Bill of Lading)
     */
    /**
     * API trả về JSON chuẩn để in Vận đơn (Bill of Lading)
     */
    async layVanDon(req, res) {
        try {
            const order = await Order.findByPk(req.params.id, {
                include: [
                    { model: Partner, as: 'partner' },
                    { model: OrderDetail, as: 'details' }
                ]
            });

            if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy order' });

            // Fetch products for details (FIXED: Don't rely on Include Product)
            const products = await productApi.getAllProducts();
            const productMap = {};
            products.forEach(p => { productMap[p.id] = p; });

            const bol = {
                document_type: 'BILL_OF_LADING',
                order_code: order.order_code,
                date: order.created_at,
                warehouse: "Warehouse Central",
                partner: {
                    name: order.partner.name,
                    type: order.partner.type === 1 ? 'Supplier' : 'Customer',
                    address: order.partner.address,
                    phone: order.partner.phone
                },
                items: order.details.map(d => {
                    const product = productMap[d.product_id] || {};
                    return {
                        sku: product.sku || 'N/A',
                        name: product.name || product.ten_san_pham || d.product_id,
                        quantity: d.quantity,
                        uom: product.unit || product.don_vi_tinh,
                        price: d.price,
                        total: Number(d.quantity) * Number(d.price)
                    };
                }),
                total_amount: order.total_amount,
                status: order.status,
                created_by: order.created_by
            };

            res.json({ success: true, data: bol });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async huyPhieuXuat(req, res) {
        try {
            const order = await Order.findByPk(req.params.id);
            if (!order || order.status === 'COMPLETED') {
                return res.status(400).json({ success: false, message: 'Không thể hủy phiếu đã hoàn thành' });
            }
            await order.update({ status: 'CANCELLED' });
            res.json({ success: true, message: 'Đã hủy phiếu xuất' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async taoMaPhieu(prefix) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await Order.count({ where: { order_code: { [Op.like]: `${prefix}-${dateStr}-%` } } });
        return `${prefix}-${dateStr}-${String(count + 1).padStart(3, '0')}`;
    }
}

module.exports = new XuatKhoController();
