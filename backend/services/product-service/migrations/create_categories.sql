-- Create categories table in product-service database (PostgreSQL with UUID)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  inbound_margin DECIMAL(5,2) DEFAULT 0,
  outbound_margin DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
INSERT INTO categories (name, description, inbound_margin, outbound_margin) VALUES
('Điện tử', 'Thiết bị điện tử, máy tính, điện thoại', -1.0, 1.0),
('Văn phòng phẩm', 'Đồ dùng văn phòng, giấy tờ, bút viết', -5.0, 5.0),
('Thực phẩm', 'Thực phẩm và đồ uống', -3.0, 3.0),
('Gia dụng', 'Đồ gia dụng, nội thất', -2.0, 2.0),
('Thời trang', 'Quần áo, giày dép, phụ kiện', -4.0, 4.0)
ON CONFLICT (name) DO NOTHING;
