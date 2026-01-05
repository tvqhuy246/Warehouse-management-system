const db = require('../db');

const buildFilter = ({ search, id }) => {
  const params = [];
  const clauses = [];

  if (search) {
    params.push(`%${search}%`);
    clauses.push(`(p.code ILIKE $${params.length} OR p.name ILIKE $${params.length})`);
  }

  if (id) {
    params.push(id);
    clauses.push(`p.id = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
};

const getInventoryRows = async ({ search, id }) => {
  const { where, params } = buildFilter({ search, id });

  const query = `
    WITH inbound_sum AS (
      SELECT product_id, SUM(quantity) AS total_in
      FROM inbound
      GROUP BY product_id
    ),
    outbound_sum AS (
      SELECT product_id, SUM(quantity) AS total_out
      FROM outbound
      GROUP BY product_id
    )
    SELECT p.id, p.code, p.name, p.uom, p.category,
           COALESCE(inbound_sum.total_in, 0) AS total_in,
           COALESCE(outbound_sum.total_out, 0) AS total_out,
           COALESCE(inbound_sum.total_in, 0) - COALESCE(outbound_sum.total_out, 0) AS stock
    FROM products p
    LEFT JOIN inbound_sum ON inbound_sum.product_id = p.id
    LEFT JOIN outbound_sum ON outbound_sum.product_id = p.id
    ${where}
    ORDER BY p.code;
  `;

  const { rows } = await db.query(query, params);
  return rows;
};

module.exports = { getInventoryRows };
