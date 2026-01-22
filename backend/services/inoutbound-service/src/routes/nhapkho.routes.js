const express = require('express');
const router = express.Router();
const nhapKhoController = require('../controllers/nhapkho.controller');

/**
 * Routes cho quản lý nhập kho
 */

// Tạo phiếu nhập kho mới
router.post('/', nhapKhoController.taoPhieuNhap.bind(nhapKhoController));

// Lấy danh sách phiếu nhập
router.get('/', nhapKhoController.layDanhSachPhieuNhap.bind(nhapKhoController));

// Lấy chi tiết phiếu nhập
router.get('/:id', nhapKhoController.layChiTietPhieuNhap.bind(nhapKhoController));

// Hủy phiếu nhập
router.delete('/:id', nhapKhoController.huyPhieuNhap.bind(nhapKhoController));

module.exports = router;
