const mongoose = require("mongoose");

const reviewsSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Review", reviewsSchema);
// mongoose.model('Review', reviewsSchema);
