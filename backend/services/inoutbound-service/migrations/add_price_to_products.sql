-- Add price column to products table in inoutbound-service database
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(15, 2) DEFAULT 0 COMMENT 'Giá sản phẩm';

-- Update existing products with price from product-service if needed
-- This is optional - you can manually update prices later
