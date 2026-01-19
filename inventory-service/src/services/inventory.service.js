const axios = require('axios');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const INOUTBOUND_SERVICE_URL = process.env.INOUTBOUND_SERVICE_URL || 'http://localhost:3000';
const REQUEST_TIMEOUT = Number(process.env.HTTP_TIMEOUT_MS) || 10000;

const productClient = axios.create({
  baseURL: PRODUCT_SERVICE_URL,
  timeout: REQUEST_TIMEOUT,
});

const inoutClient = axios.create({
  baseURL: INOUTBOUND_SERVICE_URL,
  timeout: REQUEST_TIMEOUT,
});

const safeNumber = (value) => (value === null || value === undefined ? 0 : Number(value));

const fetchProducts = async (search) => {
  const params = { status: 'ACTIVE' };
  if (search) params.search = search;

  const { data } = await productClient.get('/products', { params });
  // ASSUMPTION: Product Service trả về mảng sản phẩm trực tiếp
  return Array.isArray(data) ? data : data?.data || [];
};

const fetchInventory = async ({ search, page, limit }) => {
  const params = {};
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  const { data } = await inoutClient.get('/api/tonkho', { params });
  // ASSUMPTION: InOutbound Service trả về { success, data: [], pagination }
  return {
    items: Array.isArray(data) ? data : data?.data || [],
    pagination: data?.pagination || null,
  };
};

const fetchInventoryDetail = async (productId) => {
  const { data } = await inoutClient.get(`/api/tonkho/${productId}`);
  // ASSUMPTION: API trả về { success, data: { ... } }
  return data?.data || data;
};

const fetchHistory = async (productId, limit = 50) => {
  const { data } = await inoutClient.get(`/api/tonkho/${productId}/lichsu`, { params: { limit } });
  return data?.data?.lich_su || data?.data || [];
};

const fetchProductById = async (productId) => {
  const { data } = await productClient.get(`/products/${productId}`);
  return data;
};

const mergeInventory = (inventoryItems = [], products = []) => {
  const productMap = new Map(products.map((p) => [String(p.id), p]));

  return inventoryItems.map((item) => {
    const product = productMap.get(String(item.id)) || {};
    return {
      product_id: item.id,
      sku: item.sku,
      name: item.ten_san_pham || product.name,
      unit: item.don_vi_tinh || product.unit || product.uom,
      category_id: product.category_id || null,
      price: product.price || null,
      stock: safeNumber(item.ton_kho_hien_tai),
      min_stock: safeNumber(item.ton_kho_toi_thieu),
      low_stock: Boolean(item.canh_bao) || safeNumber(item.ton_kho_hien_tai) <= safeNumber(item.ton_kho_toi_thieu),
      total_in: item.total_in ? safeNumber(item.total_in) : null,
      total_out: item.total_out ? safeNumber(item.total_out) : null,
      updated_at: item.updated_at,
    };
  });
};

const getInventoryList = async ({ search, page = 1, limit = 20 }) => {
  const [{ items, pagination }, products] = await Promise.all([
    fetchInventory({ search, page, limit }),
    fetchProducts(search),
  ]);

  const merged = mergeInventory(items, products);

  const paging = pagination || {
    total: merged.length,
    page: Number(page),
    limit: Number(limit),
    total_pages: Math.ceil(merged.length / Number(limit || merged.length || 1)) || 1,
  };

  return { items: merged, pagination: paging };
};

const getProductStock = async ({ id }) => {
  const [inventory, history, product] = await Promise.all([
    fetchInventoryDetail(id),
    fetchHistory(id, 50),
    fetchProductById(id).catch(() => null), // không fail toàn bộ nếu product service lỗi
  ]);

  if (!inventory) return null;

  return {
    product_id: inventory.id,
    sku: inventory.sku,
    name: inventory.ten_san_pham || product?.name,
    unit: inventory.don_vi_tinh || product?.unit || product?.uom,
    category_id: product?.category_id || null,
    price: product?.price || null,
    stock: safeNumber(inventory.ton_kho_hien_tai),
    min_stock: safeNumber(inventory.ton_kho_toi_thieu),
    low_stock: Boolean(inventory.canh_bao) || safeNumber(inventory.ton_kho_hien_tai) <= safeNumber(inventory.ton_kho_toi_thieu),
    history,
  };
};

module.exports = {
  getInventoryList,
  getProductStock,
};
