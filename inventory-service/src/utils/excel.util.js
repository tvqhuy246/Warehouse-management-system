const ExcelJS = require('exceljs');

const buildProductsWorkbook = async (products = []) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Products');

  sheet.columns = [
    { header: 'Code', key: 'code', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Unit', key: 'uom', width: 10 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Total In', key: 'total_in', width: 12 },
    { header: 'Total Out', key: 'total_out', width: 12 },
    { header: 'Stock', key: 'stock', width: 12 },
  ];

  products.forEach((item) => {
    sheet.addRow({
      code: item.code,
      name: item.name,
      uom: item.uom,
      category: item.category,
      total_in: Number(item.total_in || 0),
      total_out: Number(item.total_out || 0),
      stock: Number(item.stock || 0),
    });
  });

  sheet.getRow(1).font = { bold: true };
  return workbook.xlsx.writeBuffer();
};

const buildHistoryWorkbook = async (history = []) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('History');

  sheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Inbound', key: 'total_in', width: 12 },
    { header: 'Outbound', key: 'total_out', width: 12 },
    { header: 'Balance', key: 'balance', width: 12 },
  ];

  history.forEach((item) => {
    sheet.addRow({
      date: item.date,
      total_in: Number(item.total_in || 0),
      total_out: Number(item.total_out || 0),
      balance: Number(item.balance || 0),
    });
  });

  sheet.getRow(1).font = { bold: true };
  return workbook.xlsx.writeBuffer();
};

module.exports = { buildProductsWorkbook, buildHistoryWorkbook };
