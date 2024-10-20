const express = require("express");
const router = express.Router();
const {
  GetOrder,
  showOrderSummary,
  getOrderPdf,
} = require("../controllers/order-controller");
const requireAuth = require("../middleware/requireAuth");

router.get("/orders", requireAuth, GetOrder);
router.get("/order/:id", requireAuth, showOrderSummary);

router.get("/order/:orderId/download", requireAuth, getOrderPdf);

module.exports = router;
