const PDFDocument = require('pdfkit');

const buildInventoryPdf = (products = []) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ margin: 40 });
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(buffers)));
  doc.on('error', reject);

  doc.fontSize(16).text('Inventory Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(10);
  doc.text('Code', 40, doc.y, { continued: true, width: 80 });
  doc.text('Name', 120, doc.y, { continued: true, width: 180 });
  doc.text('Stock', 300, doc.y, { continued: true, width: 80 });
  doc.text('Total In', 380, doc.y, { continued: true, width: 80 });
  doc.text('Total Out', 460, doc.y, { width: 80 });
  doc.moveDown(0.5);

  products.forEach((item) => {
    doc.text(String(item.code || ''), 40, doc.y, { continued: true, width: 80 });
    doc.text(String(item.name || ''), 120, doc.y, { continued: true, width: 180 });
    doc.text(String(item.stock || 0), 300, doc.y, { continued: true, width: 80 });
    doc.text(String(item.total_in || 0), 380, doc.y, { continued: true, width: 80 });
    doc.text(String(item.total_out || 0), 460, doc.y, { width: 80 });
  });

  doc.end();
});

module.exports = { buildInventoryPdf };
