const pool = require("../db");

exports.getAll = async (filters = {}) => {
    let query = `SELECT * FROM warehouse_locations WHERE 1=1`;
    const values = [];

    if (filters.warehouse) {
        values.push(filters.warehouse);
        query += ` AND warehouse = $${values.length}`;
    }

    if (filters.zone) {
        values.push(filters.zone);
        query += ` AND zone = $${values.length}`;
    }

    if (filters.aisle) {
        values.push(filters.aisle);
        query += ` AND aisle = $${values.length}`;
    }

    if (filters.shelf) {
        values.push(filters.shelf);
        query += ` AND shelf = $${values.length}`;
    }

    if (filters.status) {
        values.push(filters.status);
        query += ` AND status = $${values.length}`;
    }

    query += ` ORDER BY warehouse, zone, aisle, shelf`;

    const result = await pool.query(query, values);
    return result.rows;
};

exports.getById = async (id) => {
    const result = await pool.query(
        `SELECT * FROM warehouse_locations WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};

exports.create = async (data) => {
    const { warehouse, zone, aisle, shelf, capacity, status } = data;
    const location_code = `${warehouse}-${zone}-${aisle}-${shelf}`;

    const result = await pool.query(
        `INSERT INTO warehouse_locations(warehouse, zone, aisle, shelf, location_code, capacity, status)
     VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [warehouse, zone, aisle, shelf, location_code, capacity || 0, status || 'ACTIVE']
    );
    return result.rows[0];
};

exports.update = async (id, data) => {
    const { warehouse, zone, aisle, shelf, capacity, status } = data;
    const location_code = `${warehouse}-${zone}-${aisle}-${shelf}`;

    const result = await pool.query(
        `UPDATE warehouse_locations 
     SET warehouse=$1, zone=$2, aisle=$3, shelf=$4, location_code=$5, capacity=$6, status=$7, updated_at=CURRENT_TIMESTAMP
     WHERE id=$8 RETURNING *`,
        [warehouse, zone, aisle, shelf, location_code, capacity, status, id]
    );
    return result.rows[0];
};

exports.remove = async (id) => {
    await pool.query(`DELETE FROM warehouse_locations WHERE id = $1`, [id]);
    return { message: "Location deleted successfully" };
};

exports.search = async (query) => {
    const result = await pool.query(
        `SELECT * FROM warehouse_locations 
     WHERE location_code ILIKE $1 
     ORDER BY warehouse, zone, aisle, shelf`,
        [`%${query}%`]
    );
    return result.rows;
};
