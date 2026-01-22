CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price NUMERIC CHECK (price > 0),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  category_id UUID REFERENCES categories(id)
);
