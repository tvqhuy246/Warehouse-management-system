const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

// API Cập nhật kho (In/Out)
router.post('/update', inventoryController.update.bind(inventoryController));

// API Kiểm tra kho
router.post('/check', inventoryController.check.bind(inventoryController));
router.get('/check-capacity', inventoryController.checkCapacity.bind(inventoryController));

// API Gợi ý FIFO
router.get('/suggest-fifo', inventoryController.suggestFIFO.bind(inventoryController));

// API Báo cáo
router.get('/report', inventoryController.report.bind(inventoryController));

// API Điều chuyển kho
router.post('/transfer', inventoryController.transfer.bind(inventoryController));

// API Tồn kho theo vị trí
router.get('/by-location', inventoryController.getByLocation.bind(inventoryController));

// Mặc định lấy danh sách
router.get('/', inventoryController.listInventory.bind(inventoryController));

module.exports = router;
