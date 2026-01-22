const exportService = require('../services/export.service');

const exportProductsExcel = async (req, res, next) => {
  try {
    const { search } = req.query;
    const buffer = await exportService.exportProductsExcel({ search });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="products.xlsx"');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

const exportInventoryPdf = async (req, res, next) => {
  try {
    const { search } = req.query;
    const buffer = await exportService.exportInventoryPdf({ search });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory.pdf"');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

const exportHistoryExcel = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const buffer = await exportService.exportHistoryExcel({ from, to });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="history.xlsx"');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

module.exports = { exportProductsExcel, exportInventoryPdf, exportHistoryExcel };
