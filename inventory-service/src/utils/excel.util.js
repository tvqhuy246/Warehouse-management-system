const ExcelJS = require('exceljs');

const buildProductsWorkbook = async (products = []) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Products');

  sheet.columns = [
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Unit', key: 'unit', width: 10 },
    { header: 'Category', key: 'category_id', width: 20 },
    { header: 'Price', key: 'price', width: 12 },
    { header: 'Stock', key: 'stock', width: 12 },
    { header: 'Min Stock', key: 'min_stock', width: 12 },
    { header: 'Low Stock', key: 'low_stock', width: 12 },
  ];

  products.forEach((item) => {
    sheet.addRow({
      sku: item.sku,
      name: item.name,
      unit: item.unit,
      category_id: item.category_id,
      price: item.price ?? '',
      stock: Number(item.stock || 0),
      min_stock: Number(item.min_stock || 0),
      low_stock: item.low_stock ? 'YES' : 'NO',
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
