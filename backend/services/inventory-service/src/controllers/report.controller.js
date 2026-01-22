const reportService = require('../services/report.service');

const getSummary = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await reportService.getSummary({ from, to });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const getTimeline = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await reportService.getTimeline({ from, to });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getTimeline };
