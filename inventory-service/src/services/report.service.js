const inboundModel = require('../models/inbound.model');
const outboundModel = require('../models/outbound.model');

const getSummary = async ({ from, to }) => {
  const [inboundSum, outboundSum] = await Promise.all([
    inboundModel.sumInbound({ from, to }),
    outboundModel.sumOutbound({ from, to }),
  ]);

  const totalIn = Number(inboundSum.total_in || 0);
  const totalOut = Number(outboundSum.total_out || 0);
  const currentStock = totalIn - totalOut;

  return { total_in: totalIn, total_out: totalOut, current_stock: currentStock };
};

const getTimeline = async ({ from, to }) => {
  const [inbound, outbound] = await Promise.all([
    inboundModel.groupInboundByDate({ from, to }),
    outboundModel.groupOutboundByDate({ from, to }),
  ]);

  const map = new Map();

  inbound.forEach((row) => {
    map.set(row.date, {
      date: row.date,
      total_in: Number(row.total_in || 0),
      total_out: 0,
    });
  });

  outbound.forEach((row) => {
    const existing = map.get(row.date) || {
      date: row.date,
      total_in: 0,
      total_out: 0,
    };
    existing.total_out = Number(row.total_out || 0);
    map.set(row.date, existing);
  });

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  let running = 0;
  return merged.map((row) => {
    running += row.total_in - row.total_out;
    return { ...row, balance: running };
  });
};

module.exports = { getSummary, getTimeline };
