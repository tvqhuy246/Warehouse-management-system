-- Create warehouse_locations table (PostgreSQL)
CREATE TABLE IF NOT EXISTS warehouse_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse VARCHAR(10) NOT NULL,
  zone VARCHAR(10) NOT NULL,
  aisle VARCHAR(10) NOT NULL,
  shelf VARCHAR(10) NOT NULL,
  location_code VARCHAR(50) UNIQUE NOT NULL,
  capacity INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(warehouse, zone, aisle, shelf)
);

-- Add default_location_id to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS default_location_id UUID;

-- Add foreign key constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_product_default_location'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT fk_product_default_location 
      FOREIGN KEY (default_location_id) REFERENCES warehouse_locations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Insert sample warehouse locations
INSERT INTO warehouse_locations (warehouse, zone, aisle, shelf, location_code, capacity) VALUES
('A', '01', '01', '01', 'A-01-01-01', 100),
('A', '01', '01', '02', 'A-01-01-02', 100),
('A', '01', '02', '01', 'A-01-02-01', 100),
('A', '02', '01', '01', 'A-02-01-01', 150),
('B', '01', '01', '01', 'B-01-01-01', 200),
('B', '01', '02', '01', 'B-01-02-01', 200),
('C', '01', '01', '01', 'C-01-01-01', 80)
ON CONFLICT (location_code) DO NOTHING;
