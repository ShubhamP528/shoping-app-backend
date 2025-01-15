const express = require("express");
const router = express.Router();

const {
  getAllAddress,
  addAddress,
  editAddress,
} = require("../controllers/address-controller");

const requireAuth = require("../middleware/requireAuth");

router.get("/all-address", requireAuth, getAllAddress);
router.post("/add-address", requireAuth, addAddress);
router.put("/edit-address/:id", requireAuth, editAddress);

module.exports = router;
