const express = require('express');
const exportController = require('../controllers/export.controller');

const router = express.Router();

router.get('/products.xlsx', exportController.exportProductsExcel);
router.get('/inventory.pdf', exportController.exportInventoryPdf);
router.get('/history.xlsx', exportController.exportHistoryExcel);

module.exports = router;
