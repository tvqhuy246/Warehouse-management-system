const inventoryService = require('./inventory.service');
const reportService = require('./report.service');
const excelUtil = require('../utils/excel.util');
const pdfUtil = require('../utils/pdf.util');

const exportProductsExcel = async ({ search }) => {
  const { items } = await inventoryService.getInventoryList({ search, page: 1, limit: 5000 });
  return excelUtil.buildProductsWorkbook(items);
};

const exportInventoryPdf = async ({ search }) => {
  const { items } = await inventoryService.getInventoryList({ search, page: 1, limit: 5000 });
  return pdfUtil.buildInventoryPdf(items);
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
