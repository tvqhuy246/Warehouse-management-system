CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  inbound_margin DECIMAL(5, 2) DEFAULT -5.00,
  outbound_margin DECIMAL(5, 2) DEFAULT 10.00
);

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

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  price NUMERIC CHECK (price > 0),
  unit VARCHAR(50) DEFAULT 'Cái',
  min_stock NUMERIC DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  default_location_id UUID REFERENCES warehouse_locations(id) ON DELETE SET NULL
);

-- Insert sample warehouse locations if not exist
INSERT INTO warehouse_locations (warehouse, zone, aisle, shelf, location_code, capacity) VALUES
('A', '01', '01', '01', 'A-01-01-01', 100),
('A', '01', '01', '02', 'A-01-01-02', 100),
('A', '01', '02', '01', 'A-01-02-01', 100),
('A', '02', '01', '01', 'A-02-01-01', 150),
('B', '01', '01', '01', 'B-01-01-01', 200),
('B', '01', '02', '01', 'B-01-02-01', 200),
('C', '01', '01', '01', 'C-01-01-01', 80)
ON CONFLICT (location_code) DO NOTHING;
