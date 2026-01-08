-- Tạo database
CREATE DATABASE IF NOT EXISTS inoutbound_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inoutbound_db;

-- Bảng Sản phẩm
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL COMMENT 'Mã sản phẩm',
  ten_san_pham VARCHAR(255) NOT NULL COMMENT 'Tên sản phẩm',
  mo_ta TEXT COMMENT 'Mô tả sản phẩm',
  don_vi_tinh VARCHAR(50) NOT NULL DEFAULT 'Cái' COMMENT 'Đơn vị tính',
  ton_kho_hien_tai DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Số lượng tồn kho hiện tại',
  ton_kho_toi_thieu DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Mức tồn kho tối thiểu',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sku (sku),
  INDEX idx_ton_kho (ton_kho_hien_tai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng sản phẩm';

-- Bảng Phiếu nhập kho
CREATE TABLE IF NOT EXISTS inbound_receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_phieu_nhap VARCHAR(50) UNIQUE NOT NULL COMMENT 'Mã phiếu nhập',
  nha_cung_cap VARCHAR(255) NOT NULL COMMENT 'Nhà cung cấp',
  ngay_nhap DATE NOT NULL COMMENT 'Ngày nhập kho',
  nguoi_tao VARCHAR(100) NOT NULL COMMENT 'Người tạo phiếu',
  ghi_chu TEXT COMMENT 'Ghi chú',
  trang_thai ENUM('DRAFT', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT' COMMENT 'Trạng thái phiếu',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_ma_phieu (ma_phieu_nhap),
  INDEX idx_ngay_nhap (ngay_nhap),
  INDEX idx_trang_thai (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng phiếu nhập kho';

-- Bảng Phiếu xuất kho
CREATE TABLE IF NOT EXISTS outbound_receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_phieu_xuat VARCHAR(50) UNIQUE NOT NULL COMMENT 'Mã phiếu xuất',
  khach_hang VARCHAR(255) NOT NULL COMMENT 'Khách hàng/Đích đến',
  ngay_xuat DATE NOT NULL COMMENT 'Ngày xuất kho',
  nguoi_tao VARCHAR(100) NOT NULL COMMENT 'Người tạo phiếu',
  ghi_chu TEXT COMMENT 'Ghi chú',
  trang_thai ENUM('DRAFT', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT' COMMENT 'Trạng thái phiếu',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_ma_phieu (ma_phieu_xuat),
  INDEX idx_ngay_xuat (ngay_xuat),
  INDEX idx_trang_thai (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng phiếu xuất kho';

-- Bảng Chi tiết phiếu (dùng chung cho nhập và xuất)
CREATE TABLE IF NOT EXISTS receipt_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_type ENUM('INBOUND', 'OUTBOUND') NOT NULL COMMENT 'Loại phiếu',
  receipt_id INT NOT NULL COMMENT 'ID phiếu',
  product_id INT NOT NULL COMMENT 'ID sản phẩm',
  so_luong DECIMAL(15,2) NOT NULL COMMENT 'Số lượng',
  don_gia DECIMAL(15,2) DEFAULT NULL COMMENT 'Đơn giá',
  ghi_chu TEXT COMMENT 'Ghi chú',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_receipt (receipt_type, receipt_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng chi tiết phiếu nhập/xuất';

-- Bảng Lịch sử tồn kho
CREATE TABLE IF NOT EXISTS inventory_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL COMMENT 'ID sản phẩm',
  loai_giao_dich ENUM('INBOUND', 'OUTBOUND') NOT NULL COMMENT 'Loại giao dịch',
  so_luong_thay_doi DECIMAL(15,2) NOT NULL COMMENT 'Số lượng thay đổi (+/-)',
  ton_kho_truoc DECIMAL(15,2) NOT NULL COMMENT 'Tồn kho trước khi thay đổi',
  ton_kho_sau DECIMAL(15,2) NOT NULL COMMENT 'Tồn kho sau khi thay đổi',
  receipt_type ENUM('INBOUND', 'OUTBOUND') NOT NULL COMMENT 'Loại phiếu',
  receipt_id INT NOT NULL COMMENT 'ID phiếu tham chiếu',
  nguoi_thuc_hien VARCHAR(100) NOT NULL COMMENT 'Người thực hiện',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_product (product_id),
  INDEX idx_loai_giao_dich (loai_giao_dich),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lịch sử tồn kho';

-- Thêm dữ liệu mẫu sản phẩm
INSERT INTO products (sku, ten_san_pham, mo_ta, don_vi_tinh, ton_kho_hien_tai, ton_kho_toi_thieu) VALUES
('SP001', 'Laptop Dell XPS 13', 'Laptop cao cấp cho doanh nhân', 'Cái', 0, 5),
('SP002', 'Chuột Logitech MX Master 3', 'Chuột không dây cao cấp', 'Cái', 0, 10),
('SP003', 'Bàn phím Keychron K2', 'Bàn phím cơ không dây', 'Cái', 0, 8),
('SP004', 'Màn hình LG 27 inch 4K', 'Màn hình chuyên nghiệp', 'Cái', 0, 3),
('SP005', 'USB-C Hub 7 in 1', 'Hub đa năng cho laptop', 'Cái', 0, 15);
