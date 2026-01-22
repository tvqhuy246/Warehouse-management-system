const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware kiểm tra kết quả validation
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};

/**
 * Validation rules cho tạo phiếu nhập
 */
const validateTaoPhieuNhap = [
    body('nha_cung_cap')
        .notEmpty().withMessage('Nhà cung cấp không được để trống')
        .isString().withMessage('Nhà cung cấp phải là chuỗi'),
    body('ngay_nhap')
        .notEmpty().withMessage('Ngày nhập không được để trống')
        .isDate().withMessage('Ngày nhập không hợp lệ'),
    body('nguoi_tao')
        .notEmpty().withMessage('Người tạo không được để trống')
        .isString().withMessage('Người tạo phải là chuỗi'),
    body('chi_tiet')
        .isArray({ min: 1 }).withMessage('Chi tiết phiếu phải là mảng và có ít nhất 1 sản phẩm'),
    body('chi_tiet.*.product_id')
        .isInt({ min: 1 }).withMessage('ID sản phẩm phải là số nguyên dương'),
    body('chi_tiet.*.so_luong')
        .isFloat({ min: 0.01 }).withMessage('Số lượng phải lớn hơn 0'),
    validate
];

/**
 * Validation rules cho tạo phiếu xuất
 */
const validateTaoPhieuXuat = [
    body('khach_hang')
        .notEmpty().withMessage('Khách hàng không được để trống')
        .isString().withMessage('Khách hàng phải là chuỗi'),
    body('ngay_xuat')
        .notEmpty().withMessage('Ngày xuất không được để trống')
        .isDate().withMessage('Ngày xuất không hợp lệ'),
    body('nguoi_tao')
        .notEmpty().withMessage('Người tạo không được để trống')
        .isString().withMessage('Người tạo phải là chuỗi'),
    body('chi_tiet')
        .isArray({ min: 1 }).withMessage('Chi tiết phiếu phải là mảng và có ít nhất 1 sản phẩm'),
    body('chi_tiet.*.product_id')
        .isInt({ min: 1 }).withMessage('ID sản phẩm phải là số nguyên dương'),
    body('chi_tiet.*.so_luong')
        .isFloat({ min: 0.01 }).withMessage('Số lượng phải lớn hơn 0'),
    validate
];

/**
 * Validation rules cho tạo sản phẩm
 */
const validateTaoSanPham = [
    body('sku')
        .notEmpty().withMessage('Mã SKU không được để trống')
        .isString().withMessage('Mã SKU phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã SKU không được quá 50 ký tự'),
    body('ten_san_pham')
        .notEmpty().withMessage('Tên sản phẩm không được để trống')
        .isString().withMessage('Tên sản phẩm phải là chuỗi')
        .isLength({ max: 255 }).withMessage('Tên sản phẩm không được quá 255 ký tự'),
    body('don_vi_tinh')
        .notEmpty().withMessage('Đơn vị tính không được để trống')
        .isString().withMessage('Đơn vị tính phải là chuỗi'),
    body('ton_kho_toi_thieu')
        .optional()
        .isFloat({ min: 0 }).withMessage('Tồn kho tối thiểu phải >= 0'),
    validate
];

/**
 * Validation rules cho ID params
 */
const validateId = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID phải là số nguyên dương'),
    validate
];

const validateProductId = [
    param('productId')
        .isInt({ min: 1 }).withMessage('ID sản phẩm phải là số nguyên dương'),
    validate
];

module.exports = {
    validate,
    validateTaoPhieuNhap,
    validateTaoPhieuXuat,
    validateTaoSanPham,
    validateId,
    validateProductId
};
