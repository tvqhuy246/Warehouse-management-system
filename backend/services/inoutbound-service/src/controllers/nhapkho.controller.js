const { sequelize } = require('../config/database');
const { InboundReceipt, ReceiptItem, Product } = require('../models');
const tonKhoService = require('../services/tonkho.service');

/**
 * Controller xử lý các thao tác nhập kho
 */
class NhapKhoController {

    /**
     * Tạo phiếu nhập kho mới
     * POST /api/nhapkho
     */
    async taoPhieuNhap(req, res) {
        const transaction = await sequelize.transaction();

        try {
            const { nha_cung_cap, ngay_nhap, nguoi_tao, ghi_chu, chi_tiet } = req.body;

            // Validate dữ liệu đầu vào
            if (!nha_cung_cap || !ngay_nhap || !nguoi_tao || !chi_tiet || chi_tiet.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: nha_cung_cap, ngay_nhap, nguoi_tao, chi_tiet'
                });
            }

            // Tạo mã phiếu nhập tự động
            const ma_phieu_nhap = await this.taoMaPhieuNhap();

            // Tạo phiếu nhập
            const phieuNhap = await InboundReceipt.create({
                ma_phieu_nhap,
                nha_cung_cap,
                ngay_nhap,
                nguoi_tao,
                ghi_chu,
                trang_thai: 'DRAFT'
            }, { transaction });

            // Tạo chi tiết phiếu nhập
            const chiTietPromises = chi_tiet.map(item =>
                ReceiptItem.create({
                    receipt_type: 'INBOUND',
                    receipt_id: phieuNhap.id,
                    product_id: item.product_id,
                    so_luong: item.so_luong,
                    don_gia: item.don_gia || null,
                    ghi_chu: item.ghi_chu || null
                }, { transaction })
            );

            await Promise.all(chiTietPromises);

            // Cập nhật tồn kho cho từng sản phẩm
            for (const item of chi_tiet) {
                await tonKhoService.tangTonKho(
                    item.product_id,
                    item.so_luong,
                    phieuNhap.id,
                    nguoi_tao,
                    transaction
                );
            }

            // Cập nhật trạng thái phiếu thành COMPLETED
            await phieuNhap.update({ trang_thai: 'COMPLETED' }, { transaction });

            await transaction.commit();

            // Lấy lại phiếu nhập với đầy đủ thông tin
            const result = await InboundReceipt.findByPk(phieuNhap.id, {
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
                message: 'Tạo phiếu nhập kho thành công',
                data: result
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Lỗi tạo phiếu nhập:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo phiếu nhập kho',
                error: error.message
            });
        }
    }

    /**
     * Lấy danh sách phiếu nhập
     * GET /api/nhapkho
     */
    async layDanhSachPhieuNhap(req, res) {
        try {
            const { trang_thai, tu_ngay, den_ngay, page = 1, limit = 20 } = req.query;

            const where = {};

            if (trang_thai) {
                where.trang_thai = trang_thai;
            }

            if (tu_ngay || den_ngay) {
                where.ngay_nhap = {};
                if (tu_ngay) where.ngay_nhap[sequelize.Op.gte] = tu_ngay;
                if (den_ngay) where.ngay_nhap[sequelize.Op.lte] = den_ngay;
            }

            const offset = (page - 1) * limit;

            const { count, rows } = await InboundReceipt.findAndCountAll({
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
            console.error('Lỗi lấy danh sách phiếu nhập:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách phiếu nhập',
                error: error.message
            });
        }
    }

    /**
     * Lấy chi tiết phiếu nhập
     * GET /api/nhapkho/:id
     */
    async layChiTietPhieuNhap(req, res) {
        try {
            const { id } = req.params;

            const phieuNhap = await InboundReceipt.findByPk(id, {
                include: [{
                    model: ReceiptItem,
                    as: 'chi_tiet',
                    include: [{
                        model: Product,
                        as: 'san_pham'
                    }]
                }]
            });

            if (!phieuNhap) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phiếu nhập'
                });
            }

            res.json({
                success: true,
                data: phieuNhap
            });

        } catch (error) {
            console.error('Lỗi lấy chi tiết phiếu nhập:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy chi tiết phiếu nhập',
                error: error.message
            });
        }
    }

    /**
     * Hủy phiếu nhập
     * DELETE /api/nhapkho/:id
     */
    async huyPhieuNhap(req, res) {
        try {
            const { id } = req.params;

            const phieuNhap = await InboundReceipt.findByPk(id);

            if (!phieuNhap) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phiếu nhập'
                });
            }

            if (phieuNhap.trang_thai === 'COMPLETED') {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể hủy phiếu đã hoàn thành. Vui lòng tạo phiếu xuất điều chỉnh.'
                });
            }

            await phieuNhap.update({ trang_thai: 'CANCELLED' });

            res.json({
                success: true,
                message: 'Hủy phiếu nhập thành công',
                data: phieuNhap
            });

        } catch (error) {
            console.error('Lỗi hủy phiếu nhập:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi hủy phiếu nhập',
                error: error.message
            });
        }
    }

    /**
     * Tạo mã phiếu nhập tự động
     */
    async taoMaPhieuNhap() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const prefix = `PN${year}${month}${day}`;

        // Đếm số phiếu nhập trong ngày
        const count = await InboundReceipt.count({
            where: {
                ma_phieu_nhap: {
                    [sequelize.Op.like]: `${prefix}%`
                }
            }
        });

        const sequence = String(count + 1).padStart(4, '0');
        return `${prefix}${sequence}`;
    }
}

module.exports = new NhapKhoController();
