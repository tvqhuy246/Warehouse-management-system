const express = require('express');
const reportController = require('../controllers/report.controller');

const router = express.Router();

router.get('/summary', reportController.getSummary);
router.get('/timeline', reportController.getTimeline);
router.get('/export-inventory', reportController.exportInventory);

module.exports = router;
