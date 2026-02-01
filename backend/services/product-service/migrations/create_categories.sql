-- Create categories table in product-service database (PostgreSQL with UUID)
DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  vat_rate DECIMAL(5,2) DEFAULT 10.00,
  profit_margin DECIMAL(5,2) DEFAULT 15.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN categories.vat_rate IS 'Thuế VAT (%) - áp dụng chung';
COMMENT ON COLUMN categories.profit_margin IS 'Tỉ lệ lợi nhuận mong muốn (%)';

-- Add category_id to products table (UUID type to match categories.id)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID;

-- Add foreign key constraint (drop first if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_product_category'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT fk_product_category 
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Insert sample categories (using ON CONFLICT for PostgreSQL)
INSERT INTO categories (name, description, vat_rate, profit_margin) VALUES
('Điện tử', 'Thiết bị điện tử, máy tính, điện thoại', 10.00, 20.00),
('Văn phòng phẩm', 'Đồ dùng văn phòng, giấy tờ, bút viết', 10.00, 15.00),
('Thực phẩm', 'Thực phẩm và đồ uống', 5.00, 10.00),
('Gia dụng', 'Đồ gia dụng, nội thất', 10.00, 15.00),
('Thời trang', 'Quần áo, giày dép, phụ kiện', 10.00, 18.00)
ON CONFLICT (name) DO NOTHING;
