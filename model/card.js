const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
  holder: {
    type: String,
    required: true,
    trim: true,
  },
  number: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  expiry: {
    type: String,
    required: true,
    trim: true,
  },
  cvv: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Card", CardSchema);
