-- Create tables
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  uom TEXT DEFAULT 'pcs',
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inbound (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  received_at TIMESTAMP NOT NULL DEFAULT NOW(),
  note TEXT
);

CREATE TABLE IF NOT EXISTS outbound (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  shipped_at TIMESTAMP NOT NULL DEFAULT NOW(),
  note TEXT
);

-- Seed demo data
INSERT INTO products (code, name, uom, category) VALUES
('P001', 'Laptop Dell XPS 13', 'pcs', 'Electronics'),
('P002', 'Mouse Logitech MX Master', 'pcs', 'Electronics'),
('P003', 'Keyboard Mechanical RGB', 'pcs', 'Electronics'),
('P004', 'Monitor LG 27 inch', 'pcs', 'Electronics'),
('P005', 'USB-C Cable 2m', 'pcs', 'Accessories'),
('P006', 'Webcam HD 1080p', 'pcs', 'Electronics'),
('P007', 'Headset Sony WH-1000XM4', 'pcs', 'Electronics'),
('P008', 'SSD Samsung 1TB', 'pcs', 'Storage'),
('P009', 'RAM DDR4 16GB', 'pcs', 'Components'),
('P010', 'Power Bank 20000mAh', 'pcs', 'Accessories');

-- Inbound transactions (recent months)
INSERT INTO inbound (product_id, quantity, received_at, note) VALUES
(1, 50, '2024-11-01 08:30:00', 'Initial stock'),
(2, 100, '2024-11-02 09:00:00', 'Bulk order'),
(3, 80, '2024-11-03 10:15:00', 'Supplier A'),
(4, 30, '2024-11-05 11:00:00', 'Monthly restock'),
(5, 200, '2024-11-10 14:20:00', 'Accessories batch'),
(1, 30, '2024-12-01 08:00:00', 'Restock Laptop'),
(2, 50, '2024-12-05 09:30:00', 'Restock Mouse'),
(3, 40, '2024-12-10 10:00:00', 'Keyboard restock'),
(6, 45, '2024-12-12 11:30:00', 'New Webcam stock'),
(7, 35, '2024-12-15 13:00:00', 'Headset delivery'),
(8, 60, '2024-12-18 14:45:00', 'SSD shipment'),
(9, 70, '2024-12-20 15:00:00', 'RAM order'),
(10, 90, '2024-12-22 16:00:00', 'Power bank batch'),
(4, 20, '2024-12-25 09:00:00', 'Monitor restock'),
(5, 150, '2024-12-26 10:30:00', 'Cable bulk order');

-- Outbound transactions
INSERT INTO outbound (product_id, quantity, shipped_at, note) VALUES
(1, 20, '2024-11-15 10:00:00', 'Order #1001'),
(2, 30, '2024-11-16 11:00:00', 'Order #1002'),
(3, 25, '2024-11-18 12:00:00', 'Order #1003'),
(4, 10, '2024-11-20 13:00:00', 'Order #1004'),
(5, 50, '2024-11-22 14:00:00', 'Order #1005'),
(1, 15, '2024-12-03 09:00:00', 'Order #2001'),
(2, 20, '2024-12-07 10:00:00', 'Order #2002'),
(3, 18, '2024-12-11 11:00:00', 'Order #2003'),
(6, 15, '2024-12-14 12:00:00', 'Order #2004'),
(7, 10, '2024-12-17 13:00:00', 'Order #2005'),
(8, 25, '2024-12-19 14:00:00', 'Order #2006'),
(9, 30, '2024-12-21 15:00:00', 'Order #2007'),
(10, 40, '2024-12-23 16:00:00', 'Order #2008'),
(4, 8, '2024-12-24 17:00:00', 'Order #2009'),
(5, 80, '2024-12-27 18:00:00', 'Order #2010');

-- Create indexes for better query performance
CREATE INDEX idx_inbound_product_id ON inbound(product_id);
CREATE INDEX idx_inbound_received_at ON inbound(received_at);
CREATE INDEX idx_outbound_product_id ON outbound(product_id);
CREATE INDEX idx_outbound_shipped_at ON outbound(shipped_at);
