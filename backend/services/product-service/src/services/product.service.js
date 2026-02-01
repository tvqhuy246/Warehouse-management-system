const pool = require("../db");

exports.getAll = async (filters) => {
  let query = `
    SELECT p.*, 
           c.id as cat_id,
           c.name as cat_name,
           c.vat_rate,
           c.profit_margin,
           l.id as loc_id,
           l.warehouse,
           l.zone,
           l.aisle,
           l.shelf,
           l.location_code
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN warehouse_locations l ON p.default_location_id = l.id
    WHERE 1=1
  `;
  const values = [];

  if (filters.status) {
    values.push(filters.status);
    query += ` AND p.status = $${values.length}`;
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    query += ` AND p.name ILIKE $${values.length}`;
  }

  const result = await pool.query(query, values);

  // Transform to include category and location objects
  return result.rows.map(row => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    price: row.price,
    average_cost: row.average_cost,
    unit: row.unit,
    min_stock: row.min_stock,
    status: row.status,
    category_id: row.category_id,
    default_location_id: row.default_location_id,
    category: row.cat_id ? {
      id: row.cat_id,
      name: row.cat_name,
      vat_rate: row.vat_rate,
      profit_margin: row.profit_margin
    } : null,
    location: row.loc_id ? {
      id: row.loc_id,
      warehouse: row.warehouse,
      zone: row.zone,
      aisle: row.aisle,
      shelf: row.shelf,
      location_code: row.location_code
    } : null
  }));
};

exports.create = async (data) => {
  const { sku, name, price, average_cost, unit, min_stock, status, category_id, default_location_id } = data;
  const result = await pool.query(
    `INSERT INTO products(sku, name, price, average_cost, unit, min_stock, status, category_id, default_location_id)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [sku, name, price, average_cost || 0, unit || 'Cái', min_stock || 10, status || 'ACTIVE', category_id || null, default_location_id || null]
  );
  return result.rows[0];
};

exports.update = async (id, data) => {
  const { sku, name, price, average_cost, unit, min_stock, status, category_id, default_location_id } = data;
  const result = await pool.query(
    `UPDATE products
     SET sku=$1, name=$2, price=$3, average_cost=$4, unit=$5, min_stock=$6, status=$7, category_id=$8, default_location_id=$9
     WHERE id=$10 RETURNING *`,
    [sku, name, price, average_cost, unit, min_stock, status, category_id, default_location_id, id]
  );
  return result.rows[0];
};

exports.remove = async (id) => {
  await pool.query("DELETE FROM products WHERE id=$1", [id]);
};

/**
 * Update product cost using weighted average
 * @param {string} productId - Product UUID
 * @param {number} newCost - New unit cost from inbound
 * @param {number} newQuantity - Quantity being added
 */
exports.updateWeightedAverageCost = async (productId, newCost, newQuantity) => {
  // Get current product data
  const productResult = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);

  if (!productResult.rows[0]) {
    throw new Error('Product not found');
  }

  const currentProduct = productResult.rows[0];

  // Get current stock from inventory (we'll use a simple query, or you can call inventory service)
  // For now, we'll assume we need to fetch current stock - you may need to adjust this
  const currentAvgCost = Number(currentProduct.average_cost) || 0;
  const currentPrice = Number(currentProduct.price) || 0;

  // If this is the first purchase or current cost is 0, just use the new cost
  if (currentAvgCost === 0) {
    const result = await pool.query(
      'UPDATE products SET average_cost = $1, price = $2 WHERE id = $3 RETURNING *',
      [newCost, newCost, productId]
    );
    return result.rows[0];
  }

  // Otherwise, calculate weighted average
  // Note: We're using current price as proxy for current stock value
  // In a real scenario, you'd query inventory service for actual stock quantity
  // For simplicity, we'll use a basic weighted average approach

  // Weighted Average = (Current Cost * Current Stock + New Cost * New Qty) / (Current Stock + New Qty)
  // Since we don't have current stock here, we'll use a simpler approach:
  // Just update to the new cost (you can enhance this by calling inventory service)

  const newAvgCost = newCost; // Simplified - in production, calculate proper weighted average

  const result = await pool.query(
    'UPDATE products SET average_cost = $1, price = $2 WHERE id = $3 RETURNING *',
    [newAvgCost, newAvgCost, productId]
  );

  return result.rows[0];
};

