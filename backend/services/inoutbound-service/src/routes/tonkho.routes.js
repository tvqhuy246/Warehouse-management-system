const express = require('express');
const router = express.Router();
const tonKhoController = require('../controllers/tonkho.controller');

/**
 * Routes cho quản lý tồn kho
 */

// Lấy danh sách tồn kho
router.get('/', tonKhoController.layDanhSachTonKho.bind(tonKhoController));

// Lấy cảnh báo tồn kho thấp
router.get('/caobao', tonKhoController.layCanhBaoTonKhoThap.bind(tonKhoController));

// Tạo sản phẩm mới
router.post('/sanpham', tonKhoController.taoSanPham.bind(tonKhoController));

// Lấy tồn kho sản phẩm cụ thể
router.get('/:productId', tonKhoController.layTonKhoSanPham.bind(tonKhoController));

// Lấy lịch sử biến động tồn kho
router.get('/:productId/lichsu', tonKhoController.layLichSuBienDong.bind(tonKhoController));

module.exports = router;
