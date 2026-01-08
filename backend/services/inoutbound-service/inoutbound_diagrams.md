# Sơ Đồ Mermaid - Inoutbound Service

Tài liệu này chứa các sơ đồ Mermaid cho hệ thống quản lý nhập xuất kho.

## 1. ERD (Entity Relationship Diagram)

Sơ đồ quan hệ thực thể mô tả cấu trúc database của hệ thống.

```mermaid
erDiagram
    products ||--o{ receipt_items : "có trong"
    products ||--o{ inventory_history : "có lịch sử"
    inbound_receipts ||--o{ receipt_items : "chứa"
    outbound_receipts ||--o{ receipt_items : "chứa"
    
    products {
        int id PK
        varchar sku UK "Mã sản phẩm"
        varchar ten_san_pham "Tên sản phẩm"
        text mo_ta "Mô tả"
        varchar don_vi_tinh "Đơn vị tính"
        decimal ton_kho_hien_tai "Tồn kho hiện tại"
        decimal ton_kho_toi_thieu "Tồn kho tối thiểu"
        timestamp created_at
        timestamp updated_at
    }
    
    inbound_receipts {
        int id PK
        varchar ma_phieu_nhap UK "Mã phiếu nhập"
        varchar nha_cung_cap "Nhà cung cấp"
        date ngay_nhap "Ngày nhập"
        varchar nguoi_tao "Người tạo"
        text ghi_chu "Ghi chú"
        enum trang_thai "DRAFT, COMPLETED, CANCELLED"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "Soft delete"
    }
    
    outbound_receipts {
        int id PK
        varchar ma_phieu_xuat UK "Mã phiếu xuất"
        varchar khach_hang "Khách hàng"
        date ngay_xuat "Ngày xuất"
        varchar nguoi_tao "Người tạo"
        text ghi_chu "Ghi chú"
        enum trang_thai "DRAFT, COMPLETED, CANCELLED"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "Soft delete"
    }
    
    receipt_items {
        int id PK
        enum receipt_type "INBOUND, OUTBOUND"
        int receipt_id FK "ID phiếu"
        int product_id FK "ID sản phẩm"
        decimal so_luong "Số lượng"
        decimal don_gia "Đơn giá"
        text ghi_chu "Ghi chú"
        timestamp created_at
    }
    
    inventory_history {
        int id PK
        int product_id FK "ID sản phẩm"
        enum loai_giao_dich "INBOUND, OUTBOUND"
        decimal so_luong_thay_doi "Số lượng thay đổi"
        decimal ton_kho_truoc "Tồn kho trước"
        decimal ton_kho_sau "Tồn kho sau"
        enum receipt_type "INBOUND, OUTBOUND"
        int receipt_id "ID phiếu tham chiếu"
        varchar nguoi_thuc_hien "Người thực hiện"
        timestamp created_at
    }
```

## 2. Class Diagram

Sơ đồ lớp mô tả cấu trúc các class trong hệ thống.

```mermaid
classDiagram
    %% Models
    class Product {
        +int id
        +string sku
        +string ten_san_pham
        +string mo_ta
        +string don_vi_tinh
        +decimal ton_kho_hien_tai
        +decimal ton_kho_toi_thieu
        +timestamp created_at
        +timestamp updated_at
    }
    
    class InboundReceipt {
        +int id
        +string ma_phieu_nhap
        +string nha_cung_cap
        +date ngay_nhap
        +string nguoi_tao
        +string ghi_chu
        +enum trang_thai
        +timestamp created_at
        +timestamp updated_at
        +timestamp deleted_at
    }
    
    class OutboundReceipt {
        +int id
        +string ma_phieu_xuat
        +string khach_hang
        +date ngay_xuat
        +string nguoi_tao
        +string ghi_chu
        +enum trang_thai
        +timestamp created_at
        +timestamp updated_at
        +timestamp deleted_at
    }
    
    class ReceiptItem {
        +int id
        +enum receipt_type
        +int receipt_id
        +int product_id
        +decimal so_luong
        +decimal don_gia
        +string ghi_chu
        +timestamp created_at
        +belongsTo(Product)
    }
    
    class InventoryHistory {
        +int id
        +int product_id
        +enum loai_giao_dich
        +decimal so_luong_thay_doi
        +decimal ton_kho_truoc
        +decimal ton_kho_sau
        +enum receipt_type
        +int receipt_id
        +string nguoi_thuc_hien
        +timestamp created_at
        +belongsTo(Product)
    }
    
    %% Controllers
    class NhapKhoController {
        +taoPhieuNhap(req, res)
        +layDanhSachPhieuNhap(req, res)
        +layChiTietPhieuNhap(req, res)
        +huyPhieuNhap(req, res)
        -taoMaPhieuNhap()
    }
    
    class XuatKhoController {
        +taoPhieuXuat(req, res)
        +layDanhSachPhieuXuat(req, res)
        +layChiTietPhieuXuat(req, res)
        +huyPhieuXuat(req, res)
        -taoMaPhieuXuat()
    }
    
    class TonKhoController {
        +layDanhSachTonKho(req, res)
        +layTonKhoSanPham(req, res)
        +layLichSuBienDong(req, res)
        +layCanhBaoTonKhoThap(req, res)
        +taoSanPham(req, res)
    }
    
    %% Service
    class TonKhoService {
        +tangTonKho(productId, soLuong, receiptId, nguoiThucHien, transaction)
        +giamTonKho(productId, soLuong, receiptId, nguoiThucHien, transaction)
        +kiemTraTonKho(items)
        +layDanhSachTonKhoThap()
        +layLichSuBienDong(productId, limit)
    }
    
    %% Relationships
    Product "1" --> "0..*" ReceiptItem : has
    Product "1" --> "0..*" InventoryHistory : has
    
    NhapKhoController ..> InboundReceipt : uses
    NhapKhoController ..> ReceiptItem : uses
    NhapKhoController ..> Product : uses
    NhapKhoController ..> TonKhoService : uses
    
    XuatKhoController ..> OutboundReceipt : uses
    XuatKhoController ..> ReceiptItem : uses
    XuatKhoController ..> Product : uses
    XuatKhoController ..> TonKhoService : uses
    
    TonKhoController ..> Product : uses
    TonKhoController ..> TonKhoService : uses
    
    TonKhoService ..> Product : uses
    TonKhoService ..> InventoryHistory : uses
```

## 3. Sequence Diagram - Tạo Phiếu Nhập Kho

Sơ đồ tuần tự mô tả luồng nghiệp vụ tạo phiếu nhập kho.

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant API as Express API
    participant Controller as NhapKhoController
    participant DB as Database
    participant Service as TonKhoService
    participant Model as Models
    
    User->>API: POST /api/nhapkho
    Note over User,API: Body: {nha_cung_cap, ngay_nhap,<br/>nguoi_tao, chi_tiet[]}
    
    API->>Controller: taoPhieuNhap(req, res)
    
    Controller->>Controller: Validate dữ liệu đầu vào
    
    Controller->>DB: BEGIN TRANSACTION
    activate DB
    
    Controller->>Controller: taoMaPhieuNhap()
    Note over Controller: Generate mã: PN + YYYYMMDD + XXXX
    
    Controller->>Model: InboundReceipt.create()
    Note over Controller,Model: Tạo phiếu với trạng thái DRAFT
    Model-->>Controller: phieuNhap
    
    loop Cho mỗi sản phẩm trong chi_tiet
        Controller->>Model: Product.findByPk(product_id)
        Model-->>Controller: product
        
        alt Sản phẩm không tồn tại
            Controller->>DB: ROLLBACK
            Controller-->>User: 404 - Không tìm thấy sản phẩm
        end
        
        Controller->>Model: ReceiptItem.create()
        Note over Controller,Model: Tạo chi tiết phiếu nhập
        
        Controller->>Service: tangTonKho(productId, soLuong,<br/>receiptId, nguoiThucHien, transaction)
        
        Service->>Model: Product.findByPk(productId, {lock})
        Note over Service,Model: Row-level lock để tránh race condition
        Model-->>Service: product
        
        Service->>Service: Tính toán tồn kho mới
        Note over Service: ton_kho_sau = ton_kho_truoc + so_luong
        
        Service->>Model: product.update({ton_kho_hien_tai})
        Note over Service,Model: Cập nhật tồn kho
        
        Service->>Model: InventoryHistory.create()
        Note over Service,Model: Ghi nhận lịch sử biến động
        
        Service-->>Controller: {success, ton_kho_truoc, ton_kho_sau}
    end
    
    Controller->>Model: phieuNhap.update({trang_thai: 'COMPLETED'})
    Note over Controller,Model: Hoàn thành phiếu nhập
    
    Controller->>DB: COMMIT TRANSACTION
    deactivate DB
    
    Controller-->>User: 201 - Phiếu nhập tạo thành công
    Note over User,Controller: Response: {success, message, data}
```

## 4. Sequence Diagram - Tạo Phiếu Xuất Kho

Sơ đồ tuần tự mô tả luồng nghiệp vụ tạo phiếu xuất kho với kiểm tra tồn kho.

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant API as Express API
    participant Controller as XuatKhoController
    participant DB as Database
    participant Service as TonKhoService
    participant Model as Models
    
    User->>API: POST /api/xuatkho
    Note over User,API: Body: {khach_hang, ngay_xuat,<br/>nguoi_tao, chi_tiet[]}
    
    API->>Controller: taoPhieuXuat(req, res)
    
    Controller->>Controller: Validate dữ liệu đầu vào
    
    Controller->>Service: kiemTraTonKho(chi_tiet)
    Note over Controller,Service: Kiểm tra tồn kho TRƯỚC khi tạo phiếu
    
    loop Cho mỗi sản phẩm
        Service->>Model: Product.findByPk(product_id)
        Model-->>Service: product
        
        alt Sản phẩm không tồn tại
            Service-->>Controller: {valid: false, errors}
        end
        
        Service->>Service: Kiểm tra số lượng
        Note over Service: if (ton_kho < so_luong_xuat)<br/>thêm vào errors[]
    end
    
    Service-->>Controller: {valid, errors}
    
    alt Không đủ hàng
        Controller-->>User: 400 - Không đủ hàng trong kho
        Note over User,Controller: Trả về chi tiết sản phẩm thiếu
    end
    
    Controller->>DB: BEGIN TRANSACTION
    activate DB
    
    Controller->>Controller: taoMaPhieuXuat()
    Note over Controller: Generate mã: PX + YYYYMMDD + XXXX
    
    Controller->>Model: OutboundReceipt.create()
    Note over Controller,Model: Tạo phiếu với trạng thái DRAFT
    Model-->>Controller: phieuXuat
    
    loop Cho mỗi sản phẩm trong chi_tiet
        Controller->>Model: ReceiptItem.create()
        Note over Controller,Model: Tạo chi tiết phiếu xuất
        
        Controller->>Service: giamTonKho(productId, soLuong,<br/>receiptId, nguoiThucHien, transaction)
        
        Service->>Model: Product.findByPk(productId, {lock})
        Note over Service,Model: Row-level lock
        Model-->>Service: product
        
        Service->>Service: Kiểm tra lại tồn kho
        Note over Service: Double-check trong transaction
        
        alt Không đủ hàng (race condition)
            Service->>DB: ROLLBACK
            Service-->>Controller: Error
            Controller-->>User: 400 - Không đủ hàng
        end
        
        Service->>Service: Tính toán tồn kho mới
        Note over Service: ton_kho_sau = ton_kho_truoc - so_luong
        
        Service->>Model: product.update({ton_kho_hien_tai})
        Note over Service,Model: Giảm tồn kho
        
        Service->>Model: InventoryHistory.create()
        Note over Service,Model: Ghi nhận lịch sử (số âm)
        
        Service-->>Controller: {success, ton_kho_truoc, ton_kho_sau}
    end
    
    Controller->>Model: phieuXuat.update({trang_thai: 'COMPLETED'})
    Note over Controller,Model: Hoàn thành phiếu xuất
    
    Controller->>DB: COMMIT TRANSACTION
    deactivate DB
    
    Controller-->>User: 201 - Phiếu xuất tạo thành công
    Note over User,Controller: Response: {success, message, data}
```

## 5. Sequence Diagram - Quản Lý Tồn Kho

Sơ đồ tuần tự mô tả các chức năng truy vấn tồn kho.

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant API as Express API
    participant Controller as TonKhoController
    participant Service as TonKhoService
    participant Model as Models
    
    rect rgb(200, 220, 250)
        Note over User,Model: 1. Lấy danh sách tồn kho
        User->>API: GET /api/tonkho?search=laptop&page=1&limit=50
        API->>Controller: layDanhSachTonKho(req, res)
        
        Controller->>Model: Product.findAndCountAll({where, pagination})
        Model-->>Controller: {count, rows}
        
        Controller->>Controller: Tính toán cảnh báo
        Note over Controller: canh_bao = ton_kho <= ton_kho_toi_thieu
        
        Controller-->>User: 200 - Danh sách tồn kho + pagination
    end
    
    rect rgb(220, 250, 200)
        Note over User,Model: 2. Lấy tồn kho sản phẩm cụ thể
        User->>API: GET /api/tonkho/:productId
        API->>Controller: layTonKhoSanPham(req, res)
        
        Controller->>Model: Product.findByPk(productId)
        Model-->>Controller: product
        
        alt Sản phẩm không tồn tại
            Controller-->>User: 404 - Không tìm thấy sản phẩm
        end
        
        Controller-->>User: 200 - Thông tin tồn kho sản phẩm
    end
    
    rect rgb(250, 220, 200)
        Note over User,Model: 3. Lấy lịch sử biến động
        User->>API: GET /api/tonkho/:productId/lichsu?limit=50
        API->>Controller: layLichSuBienDong(req, res)
        
        Controller->>Model: Product.findByPk(productId)
        Model-->>Controller: product
        
        alt Sản phẩm không tồn tại
            Controller-->>User: 404 - Không tìm thấy sản phẩm
        end
        
        Controller->>Service: layLichSuBienDong(productId, limit)
        
        Service->>Model: InventoryHistory.findAll({where, include, order, limit})
        Note over Service,Model: Include thông tin sản phẩm<br/>Order by created_at DESC
        Model-->>Service: history[]
        
        Service-->>Controller: history[]
        
        Controller-->>User: 200 - Lịch sử biến động
        Note over User,Controller: {san_pham, lich_su[]}
    end
    
    rect rgb(250, 200, 220)
        Note over User,Model: 4. Lấy cảnh báo tồn kho thấp
        User->>API: GET /api/tonkho/caobao
        API->>Controller: layCanhBaoTonKhoThap(req, res)
        
        Controller->>Service: layDanhSachTonKhoThap()
        
        Service->>Model: Product.findAll({where: ton_kho <= ton_kho_toi_thieu})
        Note over Service,Model: Lọc sản phẩm tồn kho thấp
        Model-->>Service: products[]
        
        Service->>Service: Tính toán số lượng cần nhập
        Note over Service: can_nhap_them = ton_kho_toi_thieu - ton_kho_hien_tai
        
        Service-->>Controller: products[]
        
        Controller-->>User: 200 - Danh sách sản phẩm cần nhập thêm
    end
    
    rect rgb(220, 200, 250)
        Note over User,Model: 5. Tạo sản phẩm mới
        User->>API: POST /api/tonkho/sanpham
        Note over User,API: Body: {sku, ten_san_pham,<br/>mo_ta, don_vi_tinh, ton_kho_toi_thieu}
        
        API->>Controller: taoSanPham(req, res)
        
        Controller->>Controller: Validate dữ liệu
        
        Controller->>Model: Product.create({...})
        Note over Controller,Model: ton_kho_hien_tai = 0
        
        alt SKU đã tồn tại
            Model-->>Controller: SequelizeUniqueConstraintError
            Controller-->>User: 400 - Mã SKU đã tồn tại
        end
        
        Model-->>Controller: product
        
        Controller-->>User: 201 - Tạo sản phẩm thành công
    end
```

---

## Tổng Quan Kiến Trúc

### Các Thành Phần Chính

1. **Models (Sequelize ORM)**
   - `Product`: Quản lý thông tin sản phẩm và tồn kho
   - `InboundReceipt`: Phiếu nhập kho
   - `OutboundReceipt`: Phiếu xuất kho
   - `ReceiptItem`: Chi tiết phiếu (dùng chung cho nhập/xuất)
   - `InventoryHistory`: Lịch sử biến động tồn kho

2. **Controllers**
   - `NhapKhoController`: Xử lý API nhập kho
   - `XuatKhoController`: Xử lý API xuất kho
   - `TonKhoController`: Xử lý API truy vấn tồn kho

3. **Services**
   - `TonKhoService`: Logic nghiệp vụ tồn kho (tăng/giảm, kiểm tra, lịch sử)

### Đặc Điểm Kỹ Thuật

- **Transaction Support**: Tất cả thao tác nhập/xuất sử dụng database transaction
- **Row-Level Locking**: Tránh race condition khi cập nhật tồn kho đồng thời
- **Soft Delete**: Phiếu nhập/xuất hỗ trợ xóa mềm (paranoid)
- **Audit Trail**: Ghi nhận đầy đủ lịch sử biến động tồn kho
- **Validation**: Kiểm tra tồn kho trước khi xuất hàng
- **Auto-generated Code**: Mã phiếu tự động theo format PN/PX + YYYYMMDD + XXXX
