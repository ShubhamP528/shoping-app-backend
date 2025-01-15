const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

const {
  paymentrequest,
  PaymentSuccess,
  createPayment,
  verifyPayment,
} = require("../controllers/payment-controller");

// Endpoint to create a payment intent
router.post("/create-checkout-session", requireAuth, paymentrequest);
router.delete("/payment-success/:totalPrice", requireAuth, PaymentSuccess);

router.post("/create-order", requireAuth, createPayment);
router.post("/verifyPayment", requireAuth, verifyPayment);

module.exports = router;
