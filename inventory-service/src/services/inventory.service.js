
const productModel = require('../models/product.model');

const getInventoryList = async ({ search }) => productModel.getInventoryRows({ search });

const getProductStock = async ({ id }) => {
  const rows = await productModel.getInventoryRows({ id });
  return rows[0];
};

module.exports = { getInventoryList, getProductStock };
