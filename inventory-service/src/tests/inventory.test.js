const request = require('supertest');

jest.mock('../services/inventory.service', () => ({
  getInventoryList: jest.fn().mockResolvedValue({
    items: [
      { product_id: 1, sku: 'P001', name: 'Product 1', stock: 10, total_in: 15, total_out: 5 },
    ],
    pagination: { total: 1, page: 1, limit: 20, total_pages: 1 },
  }),
  getProductStock: jest.fn().mockResolvedValue({ product_id: 1, sku: 'P001', name: 'Product 1', stock: 10 }),
}));

jest.mock('../services/report.service', () => ({
  getSummary: jest.fn().mockResolvedValue({ total_in: 15, total_out: 5, current_stock: 10 }),
  getTimeline: jest.fn().mockResolvedValue([
    { date: '2025-01-01', total_in: 5, total_out: 0, balance: 5 },
  ]),
}));

jest.mock('../services/export.service', () => ({
  exportProductsExcel: jest.fn().mockResolvedValue(Buffer.from('excel')),
  exportInventoryPdf: jest.fn().mockResolvedValue(Buffer.from('pdf')),
  exportHistoryExcel: jest.fn().mockResolvedValue(Buffer.from('excel')),
}));

const app = require('../app');
const inventoryService = require('../services/inventory.service');
const reportService = require('../services/report.service');
const exportService = require('../services/export.service');

describe('Inventory routes', () => {
  it('returns inventory list', async () => {
    const res = await request(app).get('/inventory/products');
    expect(res.status).toBe(200);
    expect(inventoryService.getInventoryList).toHaveBeenCalledWith({ search: undefined, page: 1, limit: 20 });
    expect(res.body.data).toHaveLength(1);
  });

  it('returns single product stock', async () => {
    const res = await request(app).get('/inventory/products/1');
    expect(res.status).toBe(200);
    expect(inventoryService.getProductStock).toHaveBeenCalledWith({ id: '1' });
  });
});

describe('Report routes', () => {
  it('returns summary', async () => {
    const res = await request(app).get('/reports/summary?from=2025-01-01&to=2025-01-31');
    expect(res.status).toBe(200);
    expect(reportService.getSummary).toHaveBeenCalledWith({ from: '2025-01-01', to: '2025-01-31' });
    expect(res.body.data.current_stock).toBe(10);
  });
});

describe('Export routes', () => {
  it('returns excel buffer', async () => {
    const res = await request(app).get('/export/products.xlsx');
    expect(res.status).toBe(200);
    expect(exportService.exportProductsExcel).toHaveBeenCalled();
  });

  it('returns pdf buffer', async () => {
    const res = await request(app).get('/export/inventory.pdf');
    expect(res.status).toBe(200);
    expect(exportService.exportInventoryPdf).toHaveBeenCalled();
  });
});
