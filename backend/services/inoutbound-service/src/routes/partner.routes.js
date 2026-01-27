const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partner.controller');

router.get('/', partnerController.list.bind(partnerController));
router.post('/', partnerController.create.bind(partnerController));
router.get('/:id', partnerController.detail.bind(partnerController));

module.exports = router;
