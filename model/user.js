const mongoose = require("mongoose");
const passportLocalmongoose = require("passport-local-mongoose");
const Product = require("./product");

const userSchema = new mongoose.Schema({
  googleAuthId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    // required: true,
    trim: true,
  },
  storeName: {
    type: String,
    trim: true,
  },
  businessAddress: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: String,
    trim: true,
  },
  businessCategory: {
    type: String,
    trim: true,
    enum: ["Electronics", "Fashion", "Groceries", "Beauty", "Other"],
  },
  role: {
    type: String,
    // required: true,
    default: "Customer",
    trim: true,
  },

  cart: [
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
});

userSchema.plugin(passportLocalmongoose); // it will add user and passport property automatically  and other Stuff!!

const user = mongoose.model("User", userSchema);

module.exports = user;
