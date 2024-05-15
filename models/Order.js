const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    transactionId: { type: String, required: true },
    products: [
      { productId: { type: String }, quantity: { type: Number, default: 1 }, productName: {type: String},extraTopings: {type: String}, imageUrl: {type: String} },
    ],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    shipping: { type: Object, required: true },
    delivery_status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Processing", "Shipped", "deliverd", "cancel"],
    },
    payment_status: { type: String, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

exports.Order = Order;