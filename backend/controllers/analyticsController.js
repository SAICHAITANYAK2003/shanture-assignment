const Sale = require('../models/Sale');
const Product = require('../models/Product');
const AnalyticsReport = require('../models/AnalyticsReport');
const mongoose = require('mongoose');

const parseDates = (start, end) => {
  const s = start ? new Date(start) : new Date('1970-01-01');
  const e = end ? new Date(end) : new Date();
  // ensure day end includes full day
  e.setHours(23,59,59,999);
  return { s, e };
};

exports.getOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { s, e } = parseDates(startDate, endDate);

    // totalRevenue and avgOrderValue
    const totals = await Sale.aggregate([
      { $match: { saleDate: { $gte: s, $lte: e } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = totals[0]?.totalRevenue || 0;
    const avgOrderValue = totals[0]?.avgOrderValue || 0;

    // top products
    const topProducts = await Sale.aggregate([
      { $match: { saleDate: { $gte: s, $lte: e } } },
      { $group: { _id: '$productId', totalSold: { $sum: '$quantity' }, revenue: { $sum: '$totalAmount' } } },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $project: { productId: '$_id', name: '$product.name', totalSold: 1, revenue: 1 } },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // region-wise
    const regionStats = await Sale.aggregate([
      { $match: { saleDate: { $gte: s, $lte: e } } },
      { $group: { _id: '$region', revenue: { $sum: '$totalAmount' } } },
      { $project: { region: '$_id', revenue: 1, _id: 0 } },
      { $sort: { revenue: -1 } }
    ]);

    // optionally persist result
    const report = await AnalyticsReport.create({
      startDate: s,
      endDate: e,
      totalRevenue,
      avgOrderValue,
      topProducts: topProducts.map(p => ({ productId: p.productId, name: p.name, totalSold: p.totalSold })),
      regionStats
    });

    res.json({ totalRevenue, avgOrderValue, topProducts, regionStats, reportId: report._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
