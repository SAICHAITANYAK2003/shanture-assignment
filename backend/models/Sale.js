const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  saleDate: { type: Date, required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true }, // quantity * unitPrice
  region: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', saleSchema);
