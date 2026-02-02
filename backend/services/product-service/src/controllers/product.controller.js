const service = require("../services/product.service");

exports.getAll = async (req, res, next) => {
  try {
    const products = await service.getAll(req.query);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const product = await service.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await service.update(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.updateCost = async (req, res) => {
  try {
    const { new_cost, quantity } = req.body;
    if (new_cost === undefined || quantity === undefined) {
      return res.status(400).json({ message: "new_cost and quantity are required" });
    }
    const product = await service.updateWeightedAverageCost(req.params.id, new_cost, quantity);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
