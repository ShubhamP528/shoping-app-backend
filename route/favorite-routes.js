const express = require("express");
const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favorite-controller");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router();

router.post("/add-favorite", requireAuth, addFavorite);

router.post("/remove-favorite", requireAuth, removeFavorite);

router.get("/get-favorites", requireAuth, getFavorites);

module.exports = router;
