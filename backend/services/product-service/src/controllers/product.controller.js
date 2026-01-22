const service = require("../services/product.service");

exports.getAll = async (req, res) => {
  const products = await service.getAll(req.query);
  res.json(products);
};

exports.create = async (req, res) => {
  const product = await service.create(req.body);
  res.status(201).json(product);
};

exports.update = async (req, res) => {
  const product = await service.update(req.params.id, req.body);
  res.json(product);
};

exports.remove = async (req, res) => {
  await service.remove(req.params.id);
  res.status(204).end();
};
