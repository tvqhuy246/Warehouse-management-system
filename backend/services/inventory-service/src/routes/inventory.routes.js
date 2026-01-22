const express = require('express');
const inventoryController = require('../controllers/inventory.controller');

const router = express.Router();

router.get('/products', inventoryController.listInventory);
router.get('/products/:id', inventoryController.getProductStock);

module.exports = router;
