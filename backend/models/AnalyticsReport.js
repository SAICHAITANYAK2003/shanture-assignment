const mongoose = require('mongoose');

const analyticsReportSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
  totalRevenue: Number,
  avgOrderValue: Number,
  topProducts: [{ productId: mongoose.Schema.Types.ObjectId, name: String, totalSold: Number }],
  regionStats: [{ region: String, revenue: Number }],
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AnalyticsReport', analyticsReportSchema);
