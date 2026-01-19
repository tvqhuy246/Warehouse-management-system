# Inventory Service - API Documentation

**Version**: 1.0.0  
**Base URL**: `http://localhost:3000`  
**Service Role**: Read-only aggregator 

---

## 📌 Tóm Tắt API

Inventory Service tổng hợp dữ liệu từ **Product Service** và **InOutbound Service** để cung cấp:
- ✅ Danh sách tồn kho (search, pagination)
- ✅ Chi tiết sản phẩm + lịch sử nhập/xuất
- ✅ Báo cáo thống kê (tổng nhập, tổng xuất, timeline)
- ✅ Export Excel/PDF

---

## 🏥 Health Check

### `GET /health`
**Mô tả**: Kiểm tra dịch vụ có hoạt động không

**Response** (200 OK):
```json
{
  "status": "ok",
  "service": "inventory-service"
}
```

---

## 📦 API TỒN KHO

### 1. `GET /inventory/products` - Danh Sách Tồn Kho

**Mô tả**: Lấy danh sách sản phẩm với thông tin tồn kho hiện tại

**Query Parameters**:
| Parameter | Type | Required | Mô Tả | Ví Dụ |
|-----------|------|----------|-------|-------|
| `search` | string | ❌ | Tìm kiếm theo mã (SKU) hoặc tên | `search=laptop` |
| `page` | number | ❌ | Số trang (default: 1) | `page=2` |
| `limit` | number | ❌ | Số bản ghi/trang (default: 20) | `limit=50` |

**Example Request**:
```bash
GET /inventory/products?search=laptop&page=1&limit=20
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "product_id": 1,
      "sku": "LAPTOP-001",
      "name": "Dell XPS 13",
      "unit": "pcs",
      "category_id": 1,
      "price": 1200,
      "stock": 15,
      "min_stock": 5,
      "low_stock": false,
      "total_in": 50,
      "total_out": 35,
      "updated_at": "2026-01-19T10:30:00Z"
    },
    ...
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

**Field Descriptions**:
- `product_id`: ID sản phẩm từ Product Service
- `sku`: Mã hàng (Stock Keeping Unit)
- `name`: Tên sản phẩm
- `unit`: Đơn vị tính (pcs, kg, box, ...)
- `category_id`: ID danh mục (từ Product Service)
- `price`: Giá bán (từ Product Service)
- `stock`: Số lượng tồn hiện tại
- `min_stock`: Số lượng tối thiểu cảnh báo
- `low_stock`: `true` nếu stock ≤ min_stock
- `total_in`: Tổng số nhập (toàn thời gian)
- `total_out`: Tổng số xuất (toàn thời gian)
- `updated_at`: Lần cập nhật cuối

---

### 2. `GET /inventory/products/:id` - Chi Tiết Tồn Kho

**Mô tả**: Lấy thông tin chi tiết 1 sản phẩm + lịch sử 50 bản ghi gần nhất

**Path Parameters**:
| Parameter | Type | Mô Tả |
|-----------|------|-------|
| `id` | number | ID sản phẩm |

**Example Request**:
```bash
GET /inventory/products/1
```

**Response** (200 OK):
```json
{
  "data": {
    "product_id": 1,
    "sku": "LAPTOP-001",
    "name": "Dell XPS 13",
    "unit": "pcs",
    "category_id": 1,
    "price": 1200,
    "stock": 15,
    "min_stock": 5,
    "low_stock": false,
    "history": [
      {
        "id": 101,
        "type": "INBOUND",
        "quantity": 10,
        "date": "2026-01-15T09:00:00Z",
        "note": "Nhập hàng lô 1"
      },
      {
        "id": 102,
        "type": "OUTBOUND",
        "quantity": 3,
        "date": "2026-01-16T14:30:00Z",
        "note": "Xuất bán hàng"
      }
    ]
  }
}
```

**Response** (404 Not Found):
```json
{
  "error": "Product not found"
}
```

---

## 📊 API THỐNG KÊ

### 1. `GET /reports/summary` - Tóm Tắt

**Mô tả**: Lấy tổng hợp nhập/xuất trong kỳ + tồn kho hiện tại

**Query Parameters**:
| Parameter | Type | Required | Mô Tả | Format |
|-----------|------|----------|-------|--------|
| `from` | string | ❌ | Ngày bắt đầu | `YYYY-MM-DD` |
| `to` | string | ❌ | Ngày kết thúc | `YYYY-MM-DD` |

**Example Request**:
```bash
GET /reports/summary?from=2026-01-01&to=2026-01-31
```

**Response** (200 OK):
```json
{
  "data": {
    "total_in": 500,
    "total_out": 350,
    "current_stock": 1250
  }
}
```

**Field Descriptions**:
- `total_in`: Tổng số lượng nhập trong kỳ
- `total_out`: Tổng số lượng xuất trong kỳ
- `current_stock`: Tồn kho hiện tại (tất cả sản phẩm)

---

### 2. `GET /reports/timeline` - Biểu Đồ Theo Thời Gian

**Mô tả**: Lấy dữ liệu nhập/xuất theo từng ngày + số dư chạy (running balance)

**Query Parameters**:
| Parameter | Type | Required | Mô Tả | Format |
|-----------|------|----------|-------|--------|
| `from` | string | ❌ | Ngày bắt đầu | `YYYY-MM-DD` |
| `to` | string | ❌ | Ngày kết thúc | `YYYY-MM-DD` |

**Example Request**:
```bash
GET /reports/timeline?from=2026-01-01&to=2026-01-10
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "date": "2026-01-01",
      "total_in": 100,
      "total_out": 20,
      "balance": 80
    },
    {
      "date": "2026-01-02",
      "total_in": 50,
      "total_out": 30,
      "balance": 100
    },
    {
      "date": "2026-01-03",
      "total_in": 0,
      "total_out": 40,
      "balance": 60
    }
  ]
}
```

**Field Descriptions**:
- `date`: Ngày (YYYY-MM-DD)
- `total_in`: Tổng số nhập trong ngày
- `total_out`: Tổng số xuất trong ngày
- `balance`: Số dư chạy (cumulative từ ngày 1)

---

## 📥 API XUẤT DỮ LIỆU

### 1. `GET /export/products.xlsx` - Xuất Danh Sách Sản Phẩm (Excel)

**Mô tả**: Xuất toàn bộ sản phẩm (có filter search) thành file Excel

**Query Parameters**:
| Parameter | Type | Required |
|-----------|------|----------|
| `search` | string | ❌ |

**Example Request**:
```bash
GET /export/products.xlsx?search=laptop
```

**Response**:
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Headers**: `Content-Disposition: attachment; filename="products.xlsx"`
- **Columns**:
  - Mã hàng (SKU)
  - Tên sản phẩm
  - Đơn vị tính
  - Giá
  - Tồn kho hiện tại
  - Tồn kho tối thiểu
  - Cảnh báo tồn kho thấp

**Limit**: Tối đa 5000 hàng/file

---

### 2. `GET /export/inventory.pdf` - Xuất Báo Cáo Tồn Kho (PDF)

**Mô tả**: Xuất báo cáo tồn kho định dạng PDF

**Query Parameters**:
| Parameter | Type | Required |
|-----------|------|----------|
| `search` | string | ❌ |

**Example Request**:
```bash
GET /export/inventory.pdf?search=laptop
```

**Response**:
- **Content-Type**: `application/pdf`
- **Headers**: `Content-Disposition: attachment; filename="inventory.pdf"`
- **Content**: PDF được format sẵn với:
  - Tiêu đề "Báo Cáo Tồn Kho"
  - Bảng dữ liệu (sku, name, unit, price, stock, min_stock, low_stock)
  - Timestamp report

---

### 3. `GET /export/history.xlsx` - Xuất Lịch Sử Nhập/Xuất (Excel)

**Mô tả**: Xuất lịch sử nhập/xuất theo kỳ thành file Excel

**Query Parameters**:
| Parameter | Type | Required | Mô Tả | Format |
|-----------|------|----------|-------|--------|
| `from` | string | ❌ | Ngày bắt đầu | `YYYY-MM-DD` |
| `to` | string | ❌ | Ngày kết thúc | `YYYY-MM-DD` |

**Example Request**:
```bash
GET /export/history.xlsx?from=2026-01-01&to=2026-01-31
```

**Response**:
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Headers**: `Content-Disposition: attachment; filename="history.xlsx"`
- **Columns**:
  - Ngày
  - Tổng nhập
  - Tổng xuất
  - Số dư chạy

---

## 🔧 Environment Configuration

Cấu hình các biến môi trường trong `.env`:

```env
# Port server Inventory Service
PORT=3000

# URL của Product Service (để lấy thông tin sản phẩm)
PRODUCT_SERVICE_URL=http://localhost:3002

# URL của InOutbound Service (để lấy tồn kho, nhập/xuất)
INOUTBOUND_SERVICE_URL=http://localhost:3000

# Timeout cho HTTP requests (ms)
HTTP_TIMEOUT_MS=10000
```

---

## 🚨 Error Handling

### Error Response Format

**400 Bad Request** - Invalid query parameters
```json
{
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

**404 Not Found** - Resource không tồn tại
```json
{
  "error": "Product not found"
}
```

**500 Internal Server Error** - Upstream service error
```json
{
  "error": "Internal Server Error"
}
```

---

## 🎯 Ví Dụ Workflow

### Workflow 1: Xem Danh Sách Tồn Kho + Search

```javascript
// Frontend - React/Vue
const response = await fetch(
  '/inventory/products?search=laptop&page=1&limit=20'
);
const { data, pagination } = await response.json();

// Hiển thị danh sách
data.forEach(product => {
  console.log(`${product.sku} - ${product.name}: ${product.stock} ${product.unit}`);
  if (product.low_stock) {
    console.warn(`⚠️ Cảnh báo: ${product.name} tồn kho thấp`);
  }
});

// Pagination
console.log(`Trang ${pagination.page}/${pagination.total_pages}`);
```

---

### Workflow 2: Xem Chi Tiết + Lịch Sử

```javascript
// Lấy chi tiết sản phẩm ID=1
const response = await fetch('/inventory/products/1');
const { data } = await response.json();

console.log(`Sản phẩm: ${data.name}`);
console.log(`Tồn kho: ${data.stock} ${data.unit}`);
console.log(`Giá: ${data.price}`);

// Hiển thị 10 bản ghi lịch sử gần nhất
data.history.slice(0, 10).forEach(h => {
  console.log(
    `${h.date} - ${h.type}: ${h.quantity} ${h.unit} (${h.note})`
  );
});
```

---

### Workflow 3: Báo Cáo Thống Kê + Export

```javascript
// Lấy báo cáo tháng 1/2026
const summary = await fetch(
  '/reports/summary?from=2026-01-01&to=2026-01-31'
).then(r => r.json());

console.log(`
  Tổng nhập: ${summary.data.total_in}
  Tổng xuất: ${summary.data.total_out}
  Tồn hiện tại: ${summary.data.current_stock}
`);

// Export báo cáo Excel
window.location.href = '/export/history.xlsx?from=2026-01-01&to=2026-01-31';
```

---

## 📝 Notes

### Assumptions (Phụ thuộc vào Upstream Services)

1. **Product Service** trả về response:
   - Dạng: Array hoặc `{ data: [...] }`
   - Fields: `id`, `sku`, `name`, `price`, `unit`, `status`, `category_id`
   - Search support via `search` query parameter

2. **InOutbound Service** trả về response cho:
   - `/api/tonkho`: Inventory snapshot với fields `id`, `sku`, `ton_kho_hien_tai`, `ton_kho_toi_thieu`, `canh_bao`
   - `/api/tonkho/:id`: Chi tiết 1 sản phẩm
   - `/api/tonkho/:id/lichsu`: Lịch sử nhập/xuất
   - `/api/nhapkho`, `/api/xuatkho`: Danh sách nhập/xuất với `chi_tiet` array
   - Pagination format: `{ data: [...], pagination: { total, page, limit, total_pages } }`

### Rate Limiting
- Không có rate limiting tích hợp (tùy setup gateway/proxy)

### Caching
- Không có caching (mỗi request gọi upstream)
- Nên setup Redis layer nếu cần

### Performance
- Pagination mặc định 20 items/page → tùy chỉnh `?limit=100`
- Export tối đa 5000 rows
- Timeline query giới hạn 1000 records

---

## 📞 Support

- **Issues**: Kiểm tra kết nối upstream services (PRODUCT_SERVICE_URL, INOUTBOUND_SERVICE_URL)
- **Test**: Chạy `npm test`
- **Development**: `npm run dev`
