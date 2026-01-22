const pool = require("../db");

exports.getAll = async (filters) => {
  let query = "SELECT * FROM products WHERE 1=1";
  const values = [];

  if (filters.status) {
    values.push(filters.status);
    query += ` AND status = $${values.length}`;
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    query += ` AND name ILIKE $${values.length}`;
  }

  const result = await pool.query(query, values);
  return result.rows;
};

exports.create = async (data) => {
  const { name, price, status, category_id } = data;
  const result = await pool.query(
    `INSERT INTO products(name, price, status, category_id)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, price, status || "ACTIVE", category_id]
  );
  return result.rows[0];
};

exports.update = async (id, data) => {
  const { name, price, status } = data;
  const result = await pool.query(
    `UPDATE products SET name=$1, price=$2, status=$3 WHERE id=$4 RETURNING *`,
    [name, price, status, id]
  );
  return result.rows[0];
};

exports.remove = async (id) => {
  await pool.query("DELETE FROM products WHERE id=$1", [id]);
};
