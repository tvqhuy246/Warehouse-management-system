const { Product } = require('../models');
const tonKhoService = require('../services/tonkho.service');

/**
 * Controller xử lý truy vấn tồn kho
 */
class TonKhoController {

    /**
     * Lấy danh sách tồn kho tất cả sản phẩm
     * GET /api/tonkho
     */
    async layDanhSachTonKho(req, res) {
        try {
            const { search, page = 1, limit = 50 } = req.query;

            const where = {};

            if (search) {
                const { Op } = require('sequelize');
                where[Op.or] = [
                    { sku: { [Op.like]: `%${search}%` } },
                    { ten_san_pham: { [Op.like]: `%${search}%` } }
                ];
            }

            const offset = (page - 1) * limit;

            const { count, rows } = await Product.findAndCountAll({
                where,
                attributes: [
                    'id', 'sku', 'ten_san_pham', 'mo_ta', 'don_vi_tinh',
                    'ton_kho_hien_tai', 'ton_kho_toi_thieu', 'created_at', 'updated_at'
                ],
                order: [['ten_san_pham', 'ASC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                success: true,
                data: rows.map(p => ({
                    ...p.toJSON(),
                    ton_kho_hien_tai: parseFloat(p.ton_kho_hien_tai),
                    ton_kho_toi_thieu: parseFloat(p.ton_kho_toi_thieu),
                    canh_bao: parseFloat(p.ton_kho_hien_tai) <= parseFloat(p.ton_kho_toi_thieu)
                })),
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(count / limit)
                }
            });

        } catch (error) {
            console.error('Lỗi lấy danh sách tồn kho:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách tồn kho',
                error: error.message
            });
        }
    }

    /**
     * Lấy tồn kho của sản phẩm cụ thể
     * GET /api/tonkho/:productId
     */
    async layTonKhoSanPham(req, res) {
        try {
            const { productId } = req.params;

            const product = await Product.findByPk(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                });
            }

            res.json({
                success: true,
                data: {
                    ...product.toJSON(),
                    ton_kho_hien_tai: parseFloat(product.ton_kho_hien_tai),
                    ton_kho_toi_thieu: parseFloat(product.ton_kho_toi_thieu),
                    canh_bao: parseFloat(product.ton_kho_hien_tai) <= parseFloat(product.ton_kho_toi_thieu)
                }
            });

        } catch (error) {
            console.error('Lỗi lấy tồn kho sản phẩm:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy tồn kho sản phẩm',
                error: error.message
            });
        }
    }

    /**
     * Lấy lịch sử biến động tồn kho
     * GET /api/tonkho/:productId/lichsu
     */
    async layLichSuBienDong(req, res) {
        try {
            const { productId } = req.params;
            const { limit = 50 } = req.query;

            const product = await Product.findByPk(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                });
            }

            const history = await tonKhoService.layLichSuBienDong(productId, parseInt(limit));

            res.json({
                success: true,
                data: {
                    san_pham: {
                        id: product.id,
                        sku: product.sku,
                        ten_san_pham: product.ten_san_pham,
                        don_vi_tinh: product.don_vi_tinh,
                        ton_kho_hien_tai: parseFloat(product.ton_kho_hien_tai)
                    },
                    lich_su: history.map(h => ({
                        ...h.toJSON(),
                        so_luong_thay_doi: parseFloat(h.so_luong_thay_doi),
                        ton_kho_truoc: parseFloat(h.ton_kho_truoc),
                        ton_kho_sau: parseFloat(h.ton_kho_sau)
                    }))
                }
            });

        } catch (error) {
            console.error('Lỗi lấy lịch sử biến động:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy lịch sử biến động',
                error: error.message
            });
        }
    }

    /**
     * Lấy cảnh báo tồn kho thấp
     * GET /api/tonkho/caobao
     */
    async layCanhBaoTonKhoThap(req, res) {
        try {
            const products = await tonKhoService.layDanhSachTonKhoThap();

            res.json({
                success: true,
                message: `Có ${products.length} sản phẩm tồn kho thấp`,
                data: products
            });

        } catch (error) {
            console.error('Lỗi lấy cảnh báo tồn kho:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy cảnh báo tồn kho',
                error: error.message
            });
        }
    }

    /**
     * Tạo sản phẩm mới
     * POST /api/tonkho/sanpham
     */
    async taoSanPham(req, res) {
        try {
            const { sku, ten_san_pham, mo_ta, don_vi_tinh, ton_kho_toi_thieu } = req.body;

            if (!sku || !ten_san_pham || !don_vi_tinh) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: sku, ten_san_pham, don_vi_tinh'
                });
            }

            const product = await Product.create({
                sku,
                ten_san_pham,
                mo_ta,
                don_vi_tinh,
                ton_kho_hien_tai: 0,
                ton_kho_toi_thieu: ton_kho_toi_thieu || 0
            });

            res.status(201).json({
                success: true,
                message: 'Tạo sản phẩm thành công',
                data: product
            });

        } catch (error) {
            console.error('Lỗi tạo sản phẩm:', error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({
                    success: false,
                    message: 'Mã SKU đã tồn tại'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo sản phẩm',
                error: error.message
            });
        }
    }
}

module.exports = new TonKhoController();
