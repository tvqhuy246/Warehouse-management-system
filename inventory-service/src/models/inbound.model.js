const db = require('../db');

const buildWhere = ({ from, to }) => {
  const clauses = [];
  const params = [];

  if (from) {
    params.push(from);
    clauses.push(`received_at::date >= $${params.length}`);
  }

  if (to) {
    params.push(to);
    clauses.push(`received_at::date <= $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
};

const sumInbound = async ({ from, to }) => {
  const { where, params } = buildWhere({ from, to });
  const query = `
    SELECT COALESCE(SUM(quantity), 0) AS total_in
    FROM inbound
    ${where};
  `;
  const { rows } = await db.query(query, params);
  return rows[0];
};

const groupInboundByDate = async ({ from, to }) => {
  const { where, params } = buildWhere({ from, to });
  const query = `
    SELECT received_at::date AS date, SUM(quantity) AS total_in
    FROM inbound
    ${where}
    GROUP BY received_at::date
    ORDER BY received_at::date;
  `;
  const { rows } = await db.query(query, params);
  return rows;
};

module.exports = { sumInbound, groupInboundByDate };
