// backend/models/Order.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  quantity: Number,
  price: Number,
});

const orderSchema = new mongoose.Schema({
  items: [itemSchema],
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
