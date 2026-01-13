exports.validateProduct = (req, res, next) => {
  const { name, price } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ message: "Invalid name" });
  }

  if (price === undefined || Number(price) <= 0) {
    return res.status(400).json({ message: "Invalid price" });
  }

  next();
};
