const reportService = require('../services/report.service');
const inventoryService = require('../services/inventory.service');
const ExcelJS = require('exceljs');

const getSummary = async (req, res, next) => {
  try {
    const { from, to, location_code } = req.query;
    // IF location_code is present OR client expects a list (InventoryPage), use getReport
    // Dashboard likely checks for specific keys, but let's see.
    // To support InventoryPage calling /summary, we simply return the full list here.
    // If Dashboard needs aggregates, it can calculate from this list or we specific a separate endpoint.

    // For now, let's fix InventoryPage first.
    // InventoryPage calls: getReport({ location_code: ... }) -> /api/reports/summary

    const data = await inventoryService.getReport({ from, to, location_code });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const getTimeline = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await reportService.getTimeline({ from, to });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const exportInventory = async (req, res, next) => {
  try {
    const { from, to, location_code } = req.query;
    // Use inventoryService to get the detailed list
    const stockList = await inventoryService.getReport({ from, to, location_code });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Báo cáo Tồn Kho');

    worksheet.columns = [
      { header: 'Mã SKU', key: 'sku', width: 20 },
      { header: 'Tên Sản Phẩm', key: 'product_name', width: 40 },
      { header: 'ĐVT', key: 'uom', width: 10 },
      { header: 'Tổng Nhập', key: 'import', width: 15 },
      { header: 'Tổng Xuất', key: 'export', width: 15 },
      { header: 'Tồn Cuối', key: 'closing', width: 15 },
      { header: 'Trạng Thái', key: 'status', width: 20 },
    ];

    stockList.forEach(item => {
      worksheet.addRow({
        sku: item.sku,
        product_name: item.name,
        uom: item.uom,
        import: item.total_in,
        export: item.total_out,
        closing: item.current_stock,
        status: item.status === 'LOW_STOCK' ? 'Sắp hết hàng' : 'Bình thường'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=BaoCaoTonKho.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getTimeline, exportInventory };
