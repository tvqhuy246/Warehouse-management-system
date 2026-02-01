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
    const { name, description, vat_rate, profit_margin } = data;
    const result = await pool.query(
        `INSERT INTO categories(name, description, vat_rate, profit_margin)
     VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, description, vat_rate || 10, profit_margin || 15]
    );
    return result.rows[0];
};

// Update category
exports.update = async (id, data) => {
    const { name, description, vat_rate, profit_margin } = data;
    const result = await pool.query(
        `UPDATE categories 
     SET name=$1, description=$2, vat_rate=$3, profit_margin=$4 
     WHERE id=$5 RETURNING *`,
        [name, description, vat_rate, profit_margin, id]
    );
    return result.rows[0];
};

// Delete category
exports.remove = async (id) => {
    await pool.query("DELETE FROM categories WHERE id=$1", [id]);
};
