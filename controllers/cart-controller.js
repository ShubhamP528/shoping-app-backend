const User = require("../model/user");
const Product = require("../model/product");
const { default: mongoose } = require("mongoose");

const showCart = async (req, res) => {
  try {
    const user = await User.findOne(req.user._id).populate("cart.product");
    res.status(200).json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addItem = async (req, res) => {
  try {
    const { quantityval } = req.body;
    console.log(quantityval);
    let { itemId } = req.params;

    const objectIdItemId = new mongoose.Types.ObjectId(itemId);

    const user = await User.findOne(req.user._id).populate("cart.product");
    let newCart = user.cart;

    for (let i = 0; i < newCart.length; i++) {
      if (newCart[i].product?._id.equals(objectIdItemId)) {
        console.log("Product");
        console.log("Quantity: " + newCart[i].quantity);
        console.log("quantity: " + quantityval);
        if (quantityval !== null) {
          newCart[i].quantity = parseInt(quantityval);
        } else {
          newCart[i].quantity += 1;
        }
        console.log("Quantity: " + newCart[i].quantity);
        user.cart = newCart;
        user.save();
        res.status(201).json({ message: "Product added to cart is done" });
        return;
      }
    }
    newCart.push({
      product: itemId,
      quantity: 1,
    });
    user.cart = newCart;
    user.save();
    res.status(201).json({ message: "Product added to cart is done" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

const removeItem = async (req, res) => {
  try {
    const { itemId, isClear } = req.params;
    const objectIdItemId = new mongoose.Types.ObjectId(itemId);

    console.log(itemId);
    const user = await User.findOne(req.user._id).populate("cart.product");
    let newCart = user.cart;
    for (let i = 0; i < newCart.length; i++) {
      if (newCart[i].product?._id.equals(objectIdItemId)) {
        newCart[i].quantity--;
        if (newCart[i].quantity === 0 || isClear) {
          newCart.splice(i, 1);
        }
        user.cart = newCart;
        user.save();
        res.status(201).json({ message: "Product remove to cart is done" });
        return;
      }
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const user = await User.findOne(req.user._id);
    user.cart = [];
    user.save();
    res.status(201).json({ message: "Cart is cleared" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addItem, removeItem, showCart, clearCart };
