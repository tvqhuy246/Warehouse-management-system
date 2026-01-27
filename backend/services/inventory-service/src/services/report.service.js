const axios = require('axios');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const INOUTBOUND_SERVICE_URL = process.env.INOUTBOUND_SERVICE_URL || 'http://localhost:3000';
const REQUEST_TIMEOUT = Number(process.env.HTTP_TIMEOUT_MS) || 10000;

const productClient = axios.create({ baseURL: PRODUCT_SERVICE_URL, timeout: REQUEST_TIMEOUT });
const inoutClient = axios.create({ baseURL: INOUTBOUND_SERVICE_URL, timeout: REQUEST_TIMEOUT });

const safeNumber = (value) => (value === null || value === undefined ? 0 : Number(value));

const fetchInbound = async ({ from, to }) => {
  const params = { status: 'COMPLETED' };
  if (from) params.from = from;
  if (to) params.to = to;
  params.limit = 1000;

  const { data } = await inoutClient.get('/api/inbound', { params });
  return Array.isArray(data) ? data : data?.data || [];
};

const fetchOutbound = async ({ from, to }) => {
  const params = { status: 'COMPLETED' };
  if (from) params.from = from;
  if (to) params.to = to;
  params.limit = 1000;

  const { data } = await inoutClient.get('/api/outbound', { params });
  return Array.isArray(data) ? data : data?.data || [];
};

// Note: There is no /api/tonkho endpoint - we use inventory-service's Stock table directly
const fetchInventorySnapshot = async () => {
  // This function is not used anymore since we query Stock table directly in inventory.service.js
  return [];
};

const fetchProducts = async () => {
  const { data } = await productClient.get('/products', { params: { status: 'ACTIVE' } });
  return Array.isArray(data) ? data : data?.data || [];
};

const sumInboundQty = (receipts = []) => receipts.reduce((sum, receipt) => {
  const details = receipt.details || [];
  const itemTotal = details.reduce((s, d) => s + safeNumber(d.quantity), 0);
  return sum + itemTotal;
}, 0);

const sumOutboundQty = (receipts = []) => receipts.reduce((sum, receipt) => {
  const details = receipt.details || [];
  const itemTotal = details.reduce((s, d) => s + safeNumber(d.quantity), 0);
  return sum + itemTotal;
}, 0);

const getSummary = async ({ from, to }) => {
  const [inbound, outbound] = await Promise.all([
    fetchInbound({ from, to }),
    fetchOutbound({ from, to }),
  ]);

  const totalIn = sumInboundQty(inbound);
  const totalOut = sumOutboundQty(outbound);

  return { total_in: totalIn, total_out: totalOut };
};

const getTimeline = async ({ from, to }) => {
  const [inbound, outbound] = await Promise.all([
    fetchInbound({ from, to }),
    fetchOutbound({ from, to }),
  ]);

  const timeline = new Map();

  inbound.forEach((receipt) => {
    const date = receipt.created_at?.slice(0, 10);
    if (!date) return;
    const qty = (receipt.details || []).reduce((s, d) => s + safeNumber(d.quantity), 0);
    const existing = timeline.get(date) || { date, total_in: 0, total_out: 0 };
    existing.total_in += qty;
    timeline.set(date, existing);
  });

  outbound.forEach((receipt) => {
    const date = receipt.created_at?.slice(0, 10);
    if (!date) return;
    const qty = (receipt.details || []).reduce((s, d) => s + safeNumber(d.quantity), 0);
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
