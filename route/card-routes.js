const express = require("express");
const router = express.Router();

const {
  getAllCard,
  editCard,
  addCard,
} = require("../controllers/card-controller");

const requireAuth = require("../middleware/requireAuth");

router.get("/all-cards", requireAuth, getAllCard);
router.post("/add-card", requireAuth, addCard);
router.put("/edit-card/:id", requireAuth, editCard);

module.exports = router;
