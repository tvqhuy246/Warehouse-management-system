const { Partner } = require('../models');

class PartnerController {
    async list(req, res) {
        try {
            const { type } = req.query;
            const where = {};
            if (type) where.type = type;
            const partners = await Partner.findAll({ where });
            res.json({ success: true, data: partners });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async create(req, res) {
        try {
            const partner = await Partner.create(req.body);
            res.status(201).json({ success: true, data: partner });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async detail(req, res) {
        try {
            const partner = await Partner.findByPk(req.params.id);
            if (!partner) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: partner });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new PartnerController();
