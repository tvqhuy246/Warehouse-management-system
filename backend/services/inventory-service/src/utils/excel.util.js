const ExcelJS = require('exceljs');

const buildProductsWorkbook = async (products = []) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Danh sách sản phẩm', {
    properties: { defaultColWidth: 15, defaultRowHeight: 22 },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }], // freeze header
  });

  // Style chung
  const headerStyle = {
    font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E88E5' } }, // xanh dương
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
  };

  const dataStyle = {
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
    alignment: { vertical: 'middle' },
  };

  // Cột
  sheet.columns = [
    { header: 'SKU', key: 'sku', width: 18 },
    { header: 'Tên sản phẩm', key: 'name', width: 40 },
    { header: 'Đơn vị', key: 'unit', width: 12 },
    { header: 'Danh mục', key: 'category_id', width: 25 },
    { header: 'Giá bán', key: 'price', width: 16 },
    { header: 'Tồn kho', key: 'stock', width: 12 },
    { header: 'Tồn tối thiểu', key: 'min_stock', width: 15 },
    { header: 'Cảnh báo thấp', key: 'low_stock', width: 15 },
  ];

  // Áp dụng style header
  sheet.getRow(1).eachCell((cell) => {
    cell.style = headerStyle;
  });
  sheet.getRow(1).height = 30;

  products.forEach((item) => {
    const row = sheet.addRow({
      sku: item.sku || '',
      name: item.name || '',
      unit: item.unit || '',
      category_id: item.category_id || '',
      price: item.price ? Number(item.price) : null,
      stock: Number(item.stock || 0),
      min_stock: Number(item.min_stock || 0),
      low_stock: item.low_stock ? 'CÓ' : 'KHÔNG',
    });

    // Align & format
    row.getCell(1).alignment = { ...dataStyle.alignment, horizontal: 'center' };
    row.getCell(2).alignment = { ...dataStyle.alignment, horizontal: 'left' };
    row.getCell(3).alignment = { ...dataStyle.alignment, horizontal: 'center' };
    row.getCell(5).numFmt = '#,##0 ₫';     // Giá VND
    row.getCell(6).numFmt = '#,##0';       // Stock
    row.getCell(7).numFmt = '#,##0';       // Min stock

    // Border cho mọi ô 
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = { ...cell.style, border: dataStyle.border };
    });
  });

  // Auto filter (có thể lọc trong Excel)
  sheet.autoFilter = {
    from: 'A1',
    to: 'H1',
  };

  return workbook.xlsx.writeBuffer();
};

const buildHistoryWorkbook = async (history = []) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Lịch sử tồn kho', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const headerStyle = {
    font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E88E5' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
  };

  const dataStyle = {
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
    alignment: { vertical: 'middle', horizontal: 'center' },
  };

  sheet.columns = [
    { header: 'Ngày', key: 'date', width: 18 },
    { header: 'Nhập', key: 'total_in', width: 15 },
    { header: 'Xuất', key: 'total_out', width: 15 },
    { header: 'Tồn cuối', key: 'balance', width: 15 },
  ];

  sheet.getRow(1).eachCell((cell) => {
    cell.style = headerStyle;
  });
  sheet.getRow(1).height = 30;

  history.forEach((item) => {
    const row = sheet.addRow({
      date: item.date || '',
      total_in: Number(item.total_in || 0),
      total_out: Number(item.total_out || 0),
      balance: Number(item.balance || 0),
    });

    row.getCell(2).numFmt = '#,##0';
    row.getCell(3).numFmt = '#,##0';
    row.getCell(4).numFmt = '#,##0';

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = { ...cell.style, border: dataStyle.border };
    });
  });

  sheet.autoFilter = 'A1:D1';

  return workbook.xlsx.writeBuffer();
};

module.exports = { buildProductsWorkbook, buildHistoryWorkbook };