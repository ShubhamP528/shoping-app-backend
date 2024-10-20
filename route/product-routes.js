const express = require("express");
const router = express.Router();
const {
  getProducts,
  addProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getSuggested,
  getFeaturedProducts,
} = require("../controllers/product-controller");
const {
  addComment,
  editComment,
  deleteComment,
} = require("../controllers/comment-controller");
const requireAuth = require("../middleware/requireAuth");

// product routes

router.get("/products", getProducts);
router.get("/products/featured", getFeaturedProducts);
router.get("/product/:id", getProduct);
router.post("/product", addProduct);
router.patch("/product/:id", updateProduct);
router.delete("/product/:id", deleteProduct);

router.get("/suggested-products", getSuggested);

// comment routes

router.post("/comment", requireAuth, addComment);
router.put("/comment/:commentId", requireAuth, editComment);
router.delete("/comment/:commentId", requireAuth, deleteComment);

module.exports = router;
