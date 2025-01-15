const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema(
  {
    name: {
      type: String,
      required: true, // Name of the person receiving the delivery
    },
    phone: {
      type: String,
      required: true, // Mobile number for delivery contact
      validate: {
        validator: function (v) {
          return /^[6-9]\d{9}$/.test(v); // Indian phone number validation
        },
        message: (props) =>
          `${props.value} is not a valid Indian phone number!`,
      },
    },
    pincode: {
      type: String,
      required: true, // Postal code for the delivery address
      validate: {
        validator: function (v) {
          return /^[1-9][0-9]{5}$/.test(v); // Indian postal code validation
        },
        message: (props) => `${props.value} is not a valid postal code!`,
      },
    },
    locality: {
      type: String,
      required: true, // Locality or neighborhood
    },
    address: {
      type: String,
      required: true, // Full address (area and street)
    },
    city: {
      type: String,
      required: true, // City name
    },
    state: {
      type: String,
      required: true, // State name
    },
    landmark: {
      type: String,
      required: false, // Landmark near the address (optional)
    },
    type: {
      type: String,
      enum: ["HOME", "WORK"], // Address type (HOME or WORK)
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false, // Indicates if the address is the default one
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
