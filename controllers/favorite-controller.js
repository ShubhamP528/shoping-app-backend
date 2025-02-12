const Product = require("../model/product");

const addFavorite = async (req, res) => {
  // Add favorite functionality here
  try {
    const { productId } = req.body;
    const user = req.user;
    user.favorite.push(productId);
    await user.save();
    res.status(201).json({ message: "Product added to favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFavorite = async (req, res) => {
  // Remove favorite functionality here
  try {
    const { productId } = req.body;
    console.log(productId);
    const user = req.user;
    console.log(user);
    user.favorite = user.favorite.filter((id) => id.toString() !== productId);
    console.log(user.favorite);
    await user.save();
    res.status(200).json({ message: "Product removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFavorites = async (req, res) => {
  // Get favorite products functionality here
  try {
    const user = req.user;
    const favorites = await Product.find({ _id: { $in: user.favorite } });
    res.json({ favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Import and export the functions above for use in other controllers

module.exports = { addFavorite, removeFavorite, getFavorites };
