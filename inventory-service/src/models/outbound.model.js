const db = require('../db');

const buildWhere = ({ from, to }) => {
  const clauses = [];
  const params = [];

  if (from) {
    params.push(from);
    clauses.push(`shipped_at::date >= $${params.length}`);
  }

  if (to) {
    params.push(to);
    clauses.push(`shipped_at::date <= $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
};

const sumOutbound = async ({ from, to }) => {
  const { where, params } = buildWhere({ from, to });
  const query = `
    SELECT COALESCE(SUM(quantity), 0) AS total_out
    FROM outbound
    ${where};
  `;
  const { rows } = await db.query(query, params);
  return rows[0];
};

const groupOutboundByDate = async ({ from, to }) => {
  const { where, params } = buildWhere({ from, to });
  const query = `
    SELECT shipped_at::date AS date, SUM(quantity) AS total_out
    FROM outbound
    ${where}
    GROUP BY shipped_at::date
    ORDER BY shipped_at::date;
  `;
  const { rows } = await db.query(query, params);
  return rows;
};

module.exports = { sumOutbound, groupOutboundByDate };
