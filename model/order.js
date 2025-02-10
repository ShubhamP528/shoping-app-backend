const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "pending" },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Card",
  },
  shippingFee: { type: Number, default: 0 },
  shippingMethod: { type: String, default: "Standard" }, // Possible values: Standard, Express

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Order || mongoose.model("order", orderSchema);
