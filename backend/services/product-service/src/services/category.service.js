const pool = require("../db");

// Get all categories
exports.getAll = async () => {
    const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    return result.rows;
};

// Get category by ID
exports.getById = async (id) => {
    const result = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);
    return result.rows[0];
};

// Create category
exports.create = async (data) => {
    const { name, description, inbound_margin, outbound_margin } = data;
    const result = await pool.query(
        `INSERT INTO categories(name, description, inbound_margin, outbound_margin)
     VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, description, inbound_margin || 0, outbound_margin || 0]
    );
    return result.rows[0];
};

// Update category
exports.update = async (id, data) => {
    const { name, description, inbound_margin, outbound_margin } = data;
    const result = await pool.query(
        `UPDATE categories 
     SET name=$1, description=$2, inbound_margin=$3, outbound_margin=$4 
     WHERE id=$5 RETURNING *`,
        [name, description, inbound_margin, outbound_margin, id]
    );
    return result.rows[0];
};

// Delete category
exports.remove = async (id) => {
    await pool.query("DELETE FROM categories WHERE id=$1", [id]);
};
