-- Migration: Simplify Category Structure
-- Replace inbound_margin, outbound_margin, tax_rate with vat_rate and profit_margin

-- Step 1: Add new columns
ALTER TABLE categories ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5, 2) DEFAULT 10.00;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5, 2) DEFAULT 15.00;

-- Step 2: Migrate existing data
-- Use tax_rate as vat_rate, outbound_margin as profit_margin
UPDATE categories 
SET vat_rate = COALESCE(tax_rate, 10.00),
    profit_margin = COALESCE(outbound_margin, 15.00)
WHERE vat_rate IS NULL OR profit_margin IS NULL;

-- Step 3: Drop old columns
ALTER TABLE categories DROP COLUMN IF EXISTS inbound_margin;
ALTER TABLE categories DROP COLUMN IF EXISTS outbound_margin;
ALTER TABLE categories DROP COLUMN IF EXISTS tax_rate;

-- Step 4: Add comments
COMMENT ON COLUMN categories.vat_rate IS 'Thuế VAT (%) - áp dụng chung cho nhập và xuất';
COMMENT ON COLUMN categories.profit_margin IS 'Tỉ lệ lợi nhuận mong muốn (%)';

-- Verify migration
SELECT id, name, vat_rate, profit_margin FROM categories;
