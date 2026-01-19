const PDFDocument = require('pdfkit');

const buildInventoryPdf = (products = []) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'portrait' });
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(buffers)));
  doc.on('error', reject);

  // Tiêu đề báo cáo
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .text('BÁO CÁO TỒN KHO', { align: 'center' })
    .moveDown(0.4)
    .fontSize(12)
    .font('Helvetica')
    .text(`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, { align: 'center' })
    .moveDown(2);

  // Thông tin table
  const tableTop = doc.y;
  const colWidths = [80, 220, 70, 70, 100];
  const colPositions = [50];
  colWidths.reduce((prev, width) => {
    colPositions.push(prev + width);
    return prev + width;
  }, 50);

  const totalWidth = colWidths.reduce((a, b) => a + b, 0);

  // Header background + text
  doc.fillColor('#1E88E5').rect(50, tableTop - 8, totalWidth, 30).fill();
  doc.fillColor('white').font('Helvetica-Bold').fontSize(11);

  doc.text('SKU', colPositions[0], tableTop, { width: colWidths[0], align: 'center' });
  doc.text('Tên sản phẩm', colPositions[1], tableTop, { width: colWidths[1], align: 'left' });
  doc.text('Tồn kho', colPositions[2], tableTop, { width: colWidths[2], align: 'center' });
  doc.text('Tồn min', colPositions[3], tableTop, { width: colWidths[3], align: 'center' });
  doc.text('Giá bán (₫)', colPositions[4], tableTop, { width: colWidths[4], align: 'right' });

  // Border header
  doc.lineWidth(1.2).strokeColor('black').rect(50, tableTop - 8, totalWidth, 30).stroke();

  let y = tableTop + 35;
  doc.font('Helvetica').fontSize(10).fillColor('black');

  products.forEach((item, index) => {
    // Xen kẽ màu nền dòng
    if (index % 2 === 0) {
      doc.fillColor('#f8f9fa').rect(50, y - 8, totalWidth, 22).fill();
    }

    doc.text(String(item.sku || '-'), colPositions[0], y, { width: colWidths[0], align: 'center' });
    doc.text(String(item.name || ''), colPositions[1], y, { width: colWidths[1], align: 'left' });
    doc.text(String(item.stock || 0), colPositions[2], y, { width: colWidths[2], align: 'center' });
    doc.text(String(item.min_stock || 0), colPositions[3], y, { width: colWidths[3], align: 'center' });
    doc.text(
      item.price ? Number(item.price).toLocaleString('vi-VN') : '-',
      colPositions[4],
      y,
      { width: colWidths[4], align: 'right' }
    );

    // Border mỗi dòng
    doc.lineWidth(0.8).strokeColor('#cccccc').rect(50, y - 8, totalWidth, 22).stroke();

    y += 22;

    // Chuyển trang nếu gần hết
    if (y > 720) {
      doc.addPage({ margin: 50 });
      y = 80;
    }
  });

  // Line cuối cùng nếu có dữ liệu
  if (products.length > 0) {
    doc.lineWidth(1.2).strokeColor('black').moveTo(50, y - 8).lineTo(50 + totalWidth, y - 8).stroke();
  }

  doc.end();
});

module.exports = { buildInventoryPdf };