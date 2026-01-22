const { sequelize } = require('../config/database');
const { OutboundReceipt, ReceiptItem, Product } = require('../models');
const tonKhoService = require('../services/tonkho.service');

/**
 * Controller xử lý các thao tác xuất kho
 */
class XuatKhoController {

    /**
     * Tạo phiếu xuất kho mới
     * POST /api/xuatkho
     */
    async taoPhieuXuat(req, res) {
        const transaction = await sequelize.transaction();

        try {
            const { khach_hang, ngay_xuat, nguoi_tao, ghi_chu, chi_tiet } = req.body;

            // Validate dữ liệu đầu vào
            if (!khach_hang || !ngay_xuat || !nguoi_tao || !chi_tiet || chi_tiet.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: khach_hang, ngay_xuat, nguoi_tao, chi_tiet'
                });
            }

            // Kiểm tra tồn kho trước khi xuất
            const kiemTra = await tonKhoService.kiemTraTonKho(chi_tiet);

            if (!kiemTra.valid) {
                return res.status(400).json({
                    success: false,
                    message: 'Không đủ hàng trong kho',
                    errors: kiemTra.errors
                });
            }

            // Tạo mã phiếu xuất tự động
            const ma_phieu_xuat = await this.taoMaPhieuXuat();

            // Tạo phiếu xuất
            const phieuXuat = await OutboundReceipt.create({
                ma_phieu_xuat,
                khach_hang,
                ngay_xuat,
                nguoi_tao,
                ghi_chu,
                trang_thai: 'DRAFT'
            }, { transaction });

            // Tạo chi tiết phiếu xuất
            const chiTietPromises = chi_tiet.map(item =>
                ReceiptItem.create({
                    receipt_type: 'OUTBOUND',
                    receipt_id: phieuXuat.id,
                    product_id: item.product_id,
                    so_luong: item.so_luong,
                    don_gia: item.don_gia || null,
                    ghi_chu: item.ghi_chu || null
                }, { transaction })
            );

            await Promise.all(chiTietPromises);

            // Giảm tồn kho cho từng sản phẩm
            for (const item of chi_tiet) {
                await tonKhoService.giamTonKho(
                    item.product_id,
                    item.so_luong,
                    phieuXuat.id,
                    nguoi_tao,
                    transaction
                );
            }

            // Cập nhật trạng thái phiếu thành COMPLETED
            await phieuXuat.update({ trang_thai: 'COMPLETED' }, { transaction });

            await transaction.commit();

            // Lấy lại phiếu xuất với đầy đủ thông tin
            const result = await OutboundReceipt.findByPk(phieuXuat.id, {
                include: [{
                    model: ReceiptItem,
                    as: 'chi_tiet',
                    include: [{
                        model: Product,
                        as: 'san_pham',
                        attributes: ['id', 'sku', 'ten_san_pham', 'don_vi_tinh']
                    }]
                }]
            });

            res.status(201).json({
                success: true,
                message: 'Tạo phiếu xuất kho thành công',
                data: result
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Lỗi tạo phiếu xuất:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo phiếu xuất kho',
                error: error.message
            });
        }
    }

    /**
     * Lấy danh sách phiếu xuất
     * GET /api/xuatkho
     */
    async layDanhSachPhieuXuat(req, res) {
        try {
            const { trang_thai, tu_ngay, den_ngay, page = 1, limit = 20 } = req.query;

            const where = {};

            if (trang_thai) {
                where.trang_thai = trang_thai;
            }

            if (tu_ngay || den_ngay) {
                where.ngay_xuat = {};
                if (tu_ngay) where.ngay_xuat[sequelize.Op.gte] = tu_ngay;
                if (den_ngay) where.ngay_xuat[sequelize.Op.lte] = den_ngay;
            }

            const offset = (page - 1) * limit;

            const { count, rows } = await OutboundReceipt.findAndCountAll({
                where,
                include: [{
                    model: ReceiptItem,
                    as: 'chi_tiet',
                    include: [{
                        model: Product,
                        as: 'san_pham',
                        attributes: ['id', 'sku', 'ten_san_pham', 'don_vi_tinh']
                    }]
                }],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                success: true,
                data: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(count / limit)
                }
            });

        } catch (error) {
            console.error('Lỗi lấy danh sách phiếu xuất:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách phiếu xuất',
                error: error.message
            });
        }
    }

    /**
     * Lấy chi tiết phiếu xuất
     * GET /api/xuatkho/:id
     */
    async layChiTietPhieuXuat(req, res) {
        try {
            const { id } = req.params;

            const phieuXuat = await OutboundReceipt.findByPk(id, {
                include: [{
                    model: ReceiptItem,
                    as: 'chi_tiet',
                    include: [{
                        model: Product,
                        as: 'san_pham'
                    }]
                }]
            });

            if (!phieuXuat) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phiếu xuất'
                });
            }

            res.json({
                success: true,
                data: phieuXuat
            });

        } catch (error) {
            console.error('Lỗi lấy chi tiết phiếu xuất:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy chi tiết phiếu xuất',
                error: error.message
            });
        }
    }

    /**
     * Hủy phiếu xuất
     * DELETE /api/xuatkho/:id
     */
    async huyPhieuXuat(req, res) {
        try {
            const { id } = req.params;

            const phieuXuat = await OutboundReceipt.findByPk(id);

            if (!phieuXuat) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phiếu xuất'
                });
            }

            if (phieuXuat.trang_thai === 'COMPLETED') {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể hủy phiếu đã hoàn thành. Vui lòng tạo phiếu nhập điều chỉnh.'
                });
            }

            await phieuXuat.update({ trang_thai: 'CANCELLED' });

            res.json({
                success: true,
                message: 'Hủy phiếu xuất thành công',
                data: phieuXuat
            });

        } catch (error) {
            console.error('Lỗi hủy phiếu xuất:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi hủy phiếu xuất',
                error: error.message
            });
        }
    }

    /**
     * Tạo mã phiếu xuất tự động
     */
    async taoMaPhieuXuat() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const prefix = `PX${year}${month}${day}`;

        // Đếm số phiếu xuất trong ngày
        const count = await OutboundReceipt.count({
            where: {
                ma_phieu_xuat: {
                    [sequelize.Op.like]: `${prefix}%`
                }
            }
        });

        const sequence = String(count + 1).padStart(4, '0');
        return `${prefix}${sequence}`;
    }
}

module.exports = new XuatKhoController();
