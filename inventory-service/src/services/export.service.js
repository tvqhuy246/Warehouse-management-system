const inventoryService = require('./inventory.service');
const reportService = require('./report.service');
const excelUtil = require('../utils/excel.util');
const pdfUtil = require('../utils/pdf.util');

const exportProductsExcel = async ({ search }) => {
  const products = await inventoryService.getInventoryList({ search });
  return excelUtil.buildProductsWorkbook(products);
};

const exportInventoryPdf = async ({ search }) => {
  const products = await inventoryService.getInventoryList({ search });
  return pdfUtil.buildInventoryPdf(products);
};

const exportHistoryExcel = async ({ from, to }) => {
  const history = await reportService.getTimeline({ from, to });
  return excelUtil.buildHistoryWorkbook(history);
};

module.exports = {
  exportProductsExcel,
  exportInventoryPdf,
  exportHistoryExcel,
};
