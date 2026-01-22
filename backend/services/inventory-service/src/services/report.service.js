const axios = require('axios');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const INOUTBOUND_SERVICE_URL = process.env.INOUTBOUND_SERVICE_URL || 'http://localhost:3000';
const REQUEST_TIMEOUT = Number(process.env.HTTP_TIMEOUT_MS) || 10000;

const productClient = axios.create({ baseURL: PRODUCT_SERVICE_URL, timeout: REQUEST_TIMEOUT });
const inoutClient = axios.create({ baseURL: INOUTBOUND_SERVICE_URL, timeout: REQUEST_TIMEOUT });

const safeNumber = (value) => (value === null || value === undefined ? 0 : Number(value));

const fetchInbound = async ({ from, to }) => {
  const params = { trang_thai: 'COMPLETED' };
  if (from) params.tu_ngay = from;
  if (to) params.den_ngay = to;
  params.limit = 1000; // ASSUMPTION: đủ cho kỳ báo cáo

  const { data } = await inoutClient.get('/api/nhapkho', { params });
  return Array.isArray(data) ? data : data?.data || [];
};

const fetchOutbound = async ({ from, to }) => {
  const params = { trang_thai: 'COMPLETED' };
  if (from) params.tu_ngay = from;
  if (to) params.den_ngay = to;
  params.limit = 1000; // ASSUMPTION: đủ cho kỳ báo cáo

  const { data } = await inoutClient.get('/api/xuatkho', { params });
  return Array.isArray(data) ? data : data?.data || [];
};

const fetchInventorySnapshot = async () => {
  const { data } = await inoutClient.get('/api/tonkho', { params: { limit: 1000 } });
  return Array.isArray(data) ? data : data?.data || [];
};

const fetchProducts = async () => {
  const { data } = await productClient.get('/products', { params: { status: 'ACTIVE' } });
  return Array.isArray(data) ? data : data?.data || [];
};

const sumInboundQty = (receipts = []) => receipts.reduce((sum, receipt) => {
  const details = receipt.chi_tiet || receipt.details || [];
  const itemTotal = details.reduce((s, d) => s + safeNumber(d.so_luong || d.quantity), 0);
  return sum + itemTotal;
}, 0);

const sumOutboundQty = (receipts = []) => receipts.reduce((sum, receipt) => {
  const details = receipt.chi_tiet || receipt.details || [];
  const itemTotal = details.reduce((s, d) => s + safeNumber(d.so_luong || d.quantity), 0);
  return sum + itemTotal;
}, 0);

const getSummary = async ({ from, to }) => {
  const [inbound, outbound, inventory] = await Promise.all([
    fetchInbound({ from, to }),
    fetchOutbound({ from, to }),
    fetchInventorySnapshot(),
  ]);

  const totalIn = sumInboundQty(inbound);
  const totalOut = sumOutboundQty(outbound);
  const currentStock = inventory.reduce((sum, item) => sum + safeNumber(item.ton_kho_hien_tai), 0);

  return { total_in: totalIn, total_out: totalOut, current_stock: currentStock };
};

const getTimeline = async ({ from, to }) => {
  const [inbound, outbound] = await Promise.all([
    fetchInbound({ from, to }),
    fetchOutbound({ from, to }),
  ]);

  const timeline = new Map();

  inbound.forEach((receipt) => {
    const date = receipt.ngay_nhap || receipt.created_at?.slice(0, 10);
    if (!date) return;
    const qty = (receipt.chi_tiet || []).reduce((s, d) => s + safeNumber(d.so_luong || d.quantity), 0);
    const existing = timeline.get(date) || { date, total_in: 0, total_out: 0 };
    existing.total_in += qty;
    timeline.set(date, existing);
  });

  outbound.forEach((receipt) => {
    const date = receipt.ngay_xuat || receipt.created_at?.slice(0, 10);
    if (!date) return;
    const qty = (receipt.chi_tiet || []).reduce((s, d) => s + safeNumber(d.so_luong || d.quantity), 0);
    const existing = timeline.get(date) || { date, total_in: 0, total_out: 0 };
    existing.total_out += qty;
    timeline.set(date, existing);
  });

  const sorted = Array.from(timeline.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

  let running = 0;
  return sorted.map((row) => {
    running += safeNumber(row.total_in) - safeNumber(row.total_out);
    return { ...row, balance: running };
  });
};

module.exports = { getSummary, getTimeline, fetchProducts };
