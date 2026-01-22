const { sequelize } = require('../config/database');
const { Product, InventoryHistory } = require('../models');

/**
 * Service xử lý logic nghiệp vụ tồn kho
 */
class TonKhoService {

    /**
     * Tăng tồn kho khi nhập hàng
     * @param {number} productId - ID sản phẩm
     * @param {number} soLuong - Số lượng nhập
     * @param {number} receiptId - ID phiếu nhập
     * @param {string} nguoiThucHien - Người thực hiện
     * @param {object} transaction - Sequelize transaction
     */
    async tangTonKho(productId, soLuong, receiptId, nguoiThucHien, transaction) {
        try {
            // Lấy thông tin sản phẩm với lock để tránh race condition
            const product = await Product.findByPk(productId, {
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            if (!product) {
                throw new Error(`Không tìm thấy sản phẩm với ID: ${productId}`);
            }

            const tonKhoTruoc = parseFloat(product.ton_kho_hien_tai);
            const tonKhoSau = tonKhoTruoc + parseFloat(soLuong);

            // Cập nhật tồn kho
            await product.update(
                { ton_kho_hien_tai: tonKhoSau },
                { transaction }
            );

            // Ghi nhận lịch sử
            await InventoryHistory.create({
                product_id: productId,
                loai_giao_dich: 'INBOUND',
                so_luong_thay_doi: soLuong,
                ton_kho_truoc: tonKhoTruoc,
                ton_kho_sau: tonKhoSau,
                receipt_type: 'INBOUND',
                receipt_id: receiptId,
                nguoi_thuc_hien: nguoiThucHien
            }, { transaction });

            return {
                success: true,
                ton_kho_truoc: tonKhoTruoc,
                ton_kho_sau: tonKhoSau,
                so_luong_thay_doi: soLuong
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Giảm tồn kho khi xuất hàng
     * @param {number} productId - ID sản phẩm
     * @param {number} soLuong - Số lượng xuất
     * @param {number} receiptId - ID phiếu xuất
     * @param {string} nguoiThucHien - Người thực hiện
     * @param {object} transaction - Sequelize transaction
     */
    async giamTonKho(productId, soLuong, receiptId, nguoiThucHien, transaction) {
        try {
            // Lấy thông tin sản phẩm với lock
            const product = await Product.findByPk(productId, {
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            if (!product) {
                throw new Error(`Không tìm thấy sản phẩm với ID: ${productId}`);
            }

            const tonKhoTruoc = parseFloat(product.ton_kho_hien_tai);
            const soLuongXuat = parseFloat(soLuong);

            // Kiểm tra tồn kho
            if (tonKhoTruoc < soLuongXuat) {
                throw new Error(
                    `Không đủ hàng trong kho. Tồn kho hiện tại: ${tonKhoTruoc}, Số lượng xuất: ${soLuongXuat}`
                );
            }

            const tonKhoSau = tonKhoTruoc - soLuongXuat;

            // Cập nhật tồn kho
            await product.update(
                { ton_kho_hien_tai: tonKhoSau },
                { transaction }
            );

            // Ghi nhận lịch sử
            await InventoryHistory.create({
                product_id: productId,
                loai_giao_dich: 'OUTBOUND',
                so_luong_thay_doi: -soLuongXuat, // Số âm cho xuất kho
                ton_kho_truoc: tonKhoTruoc,
                ton_kho_sau: tonKhoSau,
                receipt_type: 'OUTBOUND',
                receipt_id: receiptId,
                nguoi_thuc_hien: nguoiThucHien
            }, { transaction });

            return {
                success: true,
                ton_kho_truoc: tonKhoTruoc,
                ton_kho_sau: tonKhoSau,
                so_luong_thay_doi: -soLuongXuat
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Kiểm tra tồn kho trước khi xuất
     * @param {Array} items - Danh sách sản phẩm cần xuất [{product_id, so_luong}]
     */
    async kiemTraTonKho(items) {
        const errors = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id);

            if (!product) {
                errors.push({
                    product_id: item.product_id,
                    message: 'Không tìm thấy sản phẩm'
                });
                continue;
            }

            const tonKhoHienTai = parseFloat(product.ton_kho_hien_tai);
            const soLuongXuat = parseFloat(item.so_luong);

            if (tonKhoHienTai < soLuongXuat) {
                errors.push({
                    product_id: item.product_id,
                    sku: product.sku,
                    ten_san_pham: product.ten_san_pham,
                    ton_kho_hien_tai: tonKhoHienTai,
                    so_luong_yeu_cau: soLuongXuat,
                    thieu: soLuongXuat - tonKhoHienTai,
                    message: `Không đủ hàng. Tồn kho: ${tonKhoHienTai}, Yêu cầu: ${soLuongXuat}`
                });
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Lấy danh sách sản phẩm tồn kho thấp
     */
    async layDanhSachTonKhoThap() {
        const { Op } = require('sequelize');

        const products = await Product.findAll({
            where: sequelize.where(
                sequelize.col('ton_kho_hien_tai'),
                Op.lte,
                sequelize.col('ton_kho_toi_thieu')
            ),
            order: [['ton_kho_hien_tai', 'ASC']]
        });

        return products.map(p => ({
            id: p.id,
            sku: p.sku,
            ten_san_pham: p.ten_san_pham,
            don_vi_tinh: p.don_vi_tinh,
            ton_kho_hien_tai: parseFloat(p.ton_kho_hien_tai),
            ton_kho_toi_thieu: parseFloat(p.ton_kho_toi_thieu),
            can_nhap_them: parseFloat(p.ton_kho_toi_thieu) - parseFloat(p.ton_kho_hien_tai)
        }));
    }

    /**
     * Lấy lịch sử biến động tồn kho của sản phẩm
     */
    async layLichSuBienDong(productId, limit = 50) {
        const history = await InventoryHistory.findAll({
            where: { product_id: productId },
            include: [{
                model: Product,
                as: 'san_pham',
                attributes: ['sku', 'ten_san_pham', 'don_vi_tinh']
            }],
            order: [['created_at', 'DESC']],
            limit
        });

        return history;
    }
}

module.exports = new TonKhoService();
