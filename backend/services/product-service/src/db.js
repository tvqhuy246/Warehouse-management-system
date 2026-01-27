require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const initDb = async (retries = 5) => {
  while (retries > 0) {
    try {
      const sqlPath = path.join(__dirname, "../init.sql");
      const sql = fs.readFileSync(sqlPath, "utf8");
      await pool.query(sql);
      console.log("✓ Product database tables initialized");
      return;
    } catch (err) {
      if (err.code === "42P07") {
        console.log("✓ Product database tables already exist");
        return;
      }
      console.error(`✗ Database initialization failed. Retries left: ${retries - 1}`, err.message);
      retries--;
      await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds
    }
  }
  console.error("✗ Failed to initialize database after multiple attempts");
};

initDb();

module.exports = pool;
