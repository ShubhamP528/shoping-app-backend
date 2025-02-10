const express = require("express");
const router = express.Router();
const {
  GetOrder,
  showOrderSummary,
  getOrderPdf,
  PlaceOrder,
} = require("../controllers/order-controller");
const requireAuth = require("../middleware/requireAuth");

router.get("/orders", requireAuth, GetOrder);
router.get("/order/:id", requireAuth, showOrderSummary);

router.get("/order/:orderId/download", requireAuth, getOrderPdf);

router.post("/placeOrder", requireAuth, PlaceOrder);

module.exports = router;
