const service = require("../services/location.service");

exports.getAll = async (req, res, next) => {
    try {
        const filters = {
            warehouse: req.query.warehouse,
            zone: req.query.zone,
            aisle: req.query.aisle,
            shelf: req.query.shelf,
            status: req.query.status
        };
        const locations = await service.getAll(filters);
        res.json(locations);
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const location = await service.getById(req.params.id);
        if (!location) {
            return res.status(404).json({ error: "Location not found" });
        }
        res.json(location);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const location = await service.create(req.body);
        res.status(201).json(location);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const location = await service.update(req.params.id, req.body);
        if (!location) {
            return res.status(404).json({ error: "Location not found" });
        }
        res.json(location);
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await service.remove(req.params.id);
        res.json({ message: "Location deleted successfully" });
    } catch (error) {
        next(error);
    }
};

exports.search = async (req, res, next) => {
    try {
        const locations = await service.search(req.query.q || '');
        res.json(locations);
    } catch (error) {
        next(error);
    }
};
