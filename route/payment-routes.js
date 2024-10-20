const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

const {
  paymentrequest,
  PaymentSuccess,
} = require("../controllers/payment-controller");

// Endpoint to create a payment intent
router.post("/create-checkout-session", requireAuth, paymentrequest);
router.delete("/payment-success/:totalPrice", requireAuth, PaymentSuccess);

module.exports = router;