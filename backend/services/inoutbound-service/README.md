# INOUTBOUND Service

Dịch vụ backend quản lý nhập xuất kho với tự động theo dõi tồn kho và ghi nhận lịch sử.

## Tính Năng

- ✅ **Quản lý nhập kho**: Tạo phiếu nhập, tự động tăng tồn kho
- ✅ **Quản lý xuất kho**: Tạo phiếu xuất với kiểm tra tồn kho
- ✅ **Theo dõi tồn kho**: Xem tồn kho theo thời gian thực
- ✅ **Lịch sử biến động**: Ghi nhận đầy đủ lịch sử nhập-xuất
- ✅ **Cảnh báo tồn kho thấp**: Tự động phát hiện sản phẩm cần nhập thêm
- ✅ **Transaction support**: Đảm bảo tính nhất quán dữ liệu

## Công Nghệ

- **Backend**: Node.js + Express.js
- **Database**: MySQL/PostgreSQL với Sequelize ORM
- **Validation**: express-validator
- **Logging**: Morgan

## Cài Đặt

### 1. Cài đặt dependencies

```bash
cd inoutbound-service
npm install
```

### 2. Cấu hình database

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật thông tin database trong file `.env`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=inoutbound_db
DB_USER=root
DB_PASSWORD=your_password
DB_DIALECT=mysql
```

### 3. Tạo database và tables

Chạy file SQL migration:

```bash
mysql -u root -p < src/migrations/001_create_tables.sql
```

Hoặc nếu dùng PostgreSQL:

```bash
psql -U postgres -d inoutbound_db -f src/migrations/001_create_tables.sql
```

### 4. Khởi động server

**Development mode** (với nodemon):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## API Endpoints

### 📥 Nhập Kho

#### Tạo phiếu nhập kho

```http
POST /api/nhapkho
Content-Type: application/json

{
  "nha_cung_cap": "Công ty ABC",
  "ngay_nhap": "2025-12-30",
  "nguoi_tao": "Nguyễn Văn A",
  "ghi_chu": "Nhập hàng tháng 12",
  "chi_tiet": [
    {
      "product_id": 1,
      "so_luong": 10,
      "don_gia": 25000000,
      "ghi_chu": "Laptop Dell XPS 13"
    }
  ]
}
```

#### Lấy danh sách phiếu nhập

```http
GET /api/nhapkho?trang_thai=COMPLETED&page=1&limit=20
```

#### Lấy chi tiết phiếu nhập

```http
GET /api/nhapkho/:id
```

#### Hủy phiếu nhập

```http
DELETE /api/nhapkho/:id
```

### 📤 Xuất Kho

#### Tạo phiếu xuất kho

```http
POST /api/xuatkho
Content-Type: application/json

{
  "khach_hang": "Công ty XYZ",
  "ngay_xuat": "2025-12-30",
  "nguoi_tao": "Trần Thị B",
  "ghi_chu": "Xuất hàng cho khách hàng XYZ",
  "chi_tiet": [
    {
      "product_id": 1,
      "so_luong": 5,
      "don_gia": 26000000
    }
  ]
}
```

#### Lấy danh sách phiếu xuất

```http
GET /api/xuatkho?trang_thai=COMPLETED&tu_ngay=2025-12-01&den_ngay=2025-12-31
```

#### Lấy chi tiết phiếu xuất

```http
GET /api/xuatkho/:id
```

#### Hủy phiếu xuất

```http
DELETE /api/xuatkho/:id
```

### 📊 Tồn Kho

#### Lấy danh sách tồn kho

```http
GET /api/tonkho?search=laptop&page=1&limit=50
```

#### Lấy tồn kho sản phẩm cụ thể

```http
GET /api/tonkho/:productId
```

#### Lấy lịch sử biến động

```http
GET /api/tonkho/:productId/lichsu?limit=50
```

#### Lấy cảnh báo tồn kho thấp

```http
GET /api/tonkho/caobao
```

#### Tạo sản phẩm mới

```http
POST /api/tonkho/sanpham
Content-Type: application/json

{
  "sku": "SP006",
  "ten_san_pham": "MacBook Pro 14 inch",
  "mo_ta": "Laptop cao cấp cho developer",
  "don_vi_tinh": "Cái",
  "ton_kho_toi_thieu": 5
}
```

### 🏥 Health Check

```http
GET /health
```

## Logic Nghiệp Vụ

### Nhập Kho

1. Tạo phiếu nhập với trạng thái DRAFT
2. Thêm chi tiết sản phẩm vào phiếu
3. **Tăng tồn kho** cho từng sản phẩm (atomic operation)
4. Ghi nhận lịch sử biến động
5. Cập nhật trạng thái phiếu thành COMPLETED

### Xuất Kho

1. **Kiểm tra tồn kho** trước khi tạo phiếu
2. Nếu không đủ hàng → Trả về lỗi với chi tiết
3. Tạo phiếu xuất với trạng thái DRAFT
4. Thêm chi tiết sản phẩm vào phiếu
5. **Giảm tồn kho** cho từng sản phẩm (atomic operation)
6. Ghi nhận lịch sử biến động
7. Cập nhật trạng thái phiếu thành COMPLETED

### Transaction Support

Tất cả thao tác nhập/xuất kho sử dụng database transaction để đảm bảo:
- Tính nhất quán dữ liệu
- Rollback tự động khi có lỗi
- Tránh race condition với row-level locking

## Cấu Trúc Database

### Bảng `products`
- Thông tin sản phẩm
- Tồn kho hiện tại
- Mức tồn kho tối thiểu

### Bảng `inbound_receipts`
- Phiếu nhập kho
- Thông tin nhà cung cấp
- Trạng thái phiếu

### Bảng `outbound_receipts`
- Phiếu xuất kho
- Thông tin khách hàng
- Trạng thái phiếu

### Bảng `receipt_items`
- Chi tiết phiếu nhập/xuất
- Số lượng, đơn giá

### Bảng `inventory_history`
- Lịch sử biến động tồn kho
- Audit trail đầy đủ

## Kiểm Thử

### Test với cURL

```bash
# Health check
curl http://localhost:3000/health

# Tạo phiếu nhập
curl -X POST http://localhost:3000/api/nhapkho \
  -H "Content-Type: application/json" \
  -d '{
    "nha_cung_cap": "Công ty ABC",
    "ngay_nhap": "2025-12-30",
    "nguoi_tao": "Admin",
    "chi_tiet": [{"product_id": 1, "so_luong": 10}]
  }'

# Xem tồn kho
curl http://localhost:3000/api/tonkho
```

### Test với Postman/Thunder Client

Import các endpoint từ phần API Endpoints ở trên.

## Lưu Ý

- Phiếu có trạng thái COMPLETED không thể hủy trực tiếp
- Để điều chỉnh phiếu đã hoàn thành, cần tạo phiếu ngược lại
- Tất cả số lượng được lưu dưới dạng DECIMAL(15,2)
- Mã phiếu được tạo tự động theo format: `PN/PX + YYYYMMDD + XXXX`

## License

ISC
