const inventoryService = require('../services/inventory.service');

const listInventory = async (req, res, next) => {
  try {
    const { search } = req.query;
    const data = await inventoryService.getInventoryList({ search });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

//Lấy thông tin tồn kho của một sản phẩm cụ thể
 
const getProductStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await inventoryService.getProductStock({ id });
    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ data });
  } catch (err) {
    return next(err);
  }
};

module.exports = { listInventory, getProductStock };
