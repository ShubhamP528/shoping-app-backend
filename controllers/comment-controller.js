const Product = require("../model/product");
const reviews = require("../model/reviews");
const Reviews = require("../model/reviews");

exports.addComment = async (req, res) => {
  const { rating, comment, productId } = req.body;

  console.log(req.user);

  console.log(req.body);
  try {
    const review = new Reviews({
      rating,
      comment,
      user: req.user._id,
    });

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $push: { reviews: review._id },
      },
      { new: true }
    );

    if (!product) return res.status(404).json({ error: "Product not found" });

    await review.save(product);

    res.status(200).json({ message: "comment added successfully , " });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

exports.editComment = async (req, res) => {
  const { commentId } = req.params;
  const { rating, comment } = req.body;
  try {
    const updatedComment = await reviews.findByIdAndUpdate(
      commentId,
      {
        rating,
        comment,
      },
      { new: true }
    );
    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.status(200).json({ message: "comment updated successfully" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.message });
  }
};

exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  console.log(commentId);
  try {
    const deletedComment = await Reviews.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    console.log(deletedComment);
    res.status(200).json({ message: "comment deleted successfully" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.message });
  }
};
