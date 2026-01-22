const express = require('express');
const router = express.Router();
const xuatKhoController = require('../controllers/xuatkho.controller');

/**
 * Routes cho quản lý xuất kho
 */

// Tạo phiếu xuất kho mới
router.post('/', xuatKhoController.taoPhieuXuat.bind(xuatKhoController));

// Lấy danh sách phiếu xuất
router.get('/', xuatKhoController.layDanhSachPhieuXuat.bind(xuatKhoController));

// Lấy chi tiết phiếu xuất
router.get('/:id', xuatKhoController.layChiTietPhieuXuat.bind(xuatKhoController));

// Hủy phiếu xuất
router.delete('/:id', xuatKhoController.huyPhieuXuat.bind(xuatKhoController));

module.exports = router;
