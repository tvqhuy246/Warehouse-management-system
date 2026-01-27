const pool = require("../db");

exports.getAll = async (filters) => {
  let query = `
    SELECT p.*, 
           c.id as cat_id,
           c.name as cat_name,
           c.inbound_margin,
           c.outbound_margin,
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
    unit: row.unit,
    min_stock: row.min_stock,
    status: row.status,
    category_id: row.category_id,
    default_location_id: row.default_location_id,
    category: row.cat_id ? {
      id: row.cat_id,
      name: row.cat_name,
      inbound_margin: row.inbound_margin,
      outbound_margin: row.outbound_margin
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
  const { sku, name, price, unit, min_stock, status, category_id, default_location_id } = data;
  const result = await pool.query(
    `INSERT INTO products(sku, name, price, unit, min_stock, status, category_id, default_location_id)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [sku, name, price, unit || 'Cái', min_stock || 10, status || 'ACTIVE', category_id || null, default_location_id || null]
  );
  return result.rows[0];
};

exports.update = async (id, data) => {
  const { sku, name, price, unit, min_stock, status, category_id, default_location_id } = data;
  const result = await pool.query(
    `UPDATE products
     SET sku=$1, name=$2, price=$3, unit=$4, min_stock=$5, status=$6, category_id=$7, default_location_id=$8
     WHERE id=$9 RETURNING *`,
    [sku, name, price, unit, min_stock, status, category_id, default_location_id, id]
  );
  return result.rows[0];
};

exports.remove = async (id) => {
  await pool.query("DELETE FROM products WHERE id=$1", [id]);
};
