const service = require("../services/category.service");

// Get all categories
exports.getAll = async (req, res) => {
    try {
        const categories = await service.getAll();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get category by ID
exports.getById = async (req, res) => {
    try {
        const category = await service.getById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create category (admin only)
exports.create = async (req, res) => {
    try {
        const category = await service.create(req.body);
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update category (admin only)
exports.update = async (req, res) => {
    try {
        const category = await service.update(req.params.id, req.body);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete category (admin only)
exports.remove = async (req, res) => {
    try {
        await service.remove(req.params.id);
        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
