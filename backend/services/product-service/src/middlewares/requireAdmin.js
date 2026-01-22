module.exports = (req, res, next) => {
  const role = req.headers["x-role"];
  if (role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};
