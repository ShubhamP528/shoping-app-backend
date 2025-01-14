const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema(
  {
    name: {
      type: String,
      required: true, // Name of the person receiving the delivery
    },
    mobileNumber: {
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
    streetAddress: {
      type: String,
      required: true, // Address of the building or area
    },
    landmark: {
      type: String,
      required: false, // Landmark near the address (optional)
    },
    area: {
      type: String,
      required: true, // Local area or locality name (example: "Koramangala")
    },
    city: {
      type: String,
      required: true, // City name (example: "Bangalore")
    },
    state: {
      type: String,
      required: true, // State name (example: "Karnataka")
    },
    postalCode: {
      type: String,
      required: true, // Pincode (example: "560001")
      validate: {
        validator: function (v) {
          return /^[1-9][0-9]{5}$/.test(v); // Indian postal code validation
        },
        message: (props) => `${props.value} is not a valid postal code!`,
      },
    },
    country: {
      type: String,
      default: "India", // Fixed as India for delivery purposes
    },
    deliveryInstructions: {
      type: String,
      required: false, // Special instructions for delivery (optional)
    },
    addressType: {
      type: String,
      enum: ["Home", "Office", "Other"], // Type of address: Home, Office, etc.
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false, // Whether this is the default address for delivery
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
