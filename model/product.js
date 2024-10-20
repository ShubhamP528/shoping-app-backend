const mongoose = require("mongoose");
const Review = require("./reviews");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    min: 0,
    required: true,
    trim: true,
  },
  originalPrice: {
    type: Number,
    min: 0,
    required: true,
    trim: true,
  },
  images: [
    {
      type: String,
      trim: true,
      required: true,
    },
  ],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    required: true,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  description: {
    type: String,
    required: true,
    trim: true,
  },
  highlights: [
    {
      type: String,
      trim: true,
    },
  ],
  features: [
    {
      type: String,
      trim: true,
    },
  ],
  featured: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: [
      "Electronics",
      "Audio",
      "Wearables",
      "Smart Home",
      "Furniture",
      "Computers",
      "Home Entertainment",
      "Kitchen Appliances",
      "Peripherals",
      "Cameras",
      "Home Appliances",
      "Personal Care",
    ], // You can modify or add categories here as needed
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
