const User = require("../model/user");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcrypt");
const {
  getUserByEmail,
  signupSeller,
  signupCustomer,
} = require("../services/userAuth-services");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const createToken = (_id, email) => {
  return jwt.sign(
    { _id, email },
    process.env.SECRET || "yguihkndeuiwkjsbnilwehsbdjnnc798082ohjbnm",
    { expiresIn: "3d" }
  );
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existUser = await getUserByEmail(email);

    if (!existUser) {
      return res.status(400).json({ error: "Email or password is invalid" });
    }
    const isMatch = await bcrypt.compare(password, existUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Email or password is invalid" });
    }

    const name = existUser.name;

    //create a token
    const token = createToken(existUser._id, email);
    res.status(200).json({ email, name, token, userId: existUser._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Signup
const Signup = async (req, res) => {
  const {
    name,
    email,
    password,
    userType,
    storeName,
    BusinessAddress,
    ContactNumber,
    BusinessCatagory,
  } = req.body;

  try {
    // Check if user already exists
    const existUser = await getUserByEmail(email);

    console.log(existUser);

    if (existUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      throw Error("Email is not valid");
    }

    if (!validator.isStrongPassword(password)) {
      throw Error("Password is not enough strong");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let user;

    if (userType === "Seller") {
      if (
        !name ||
        !email ||
        !storeName ||
        !BusinessAddress ||
        !ContactNumber ||
        !BusinessCatagory
      ) {
        throw Error("ALl fields must be field");
      }

      user = await signupSeller(
        name,
        email,
        hash,
        userType,
        storeName,
        BusinessAddress,
        ContactNumber,
        BusinessCatagory
      );
    } else if (userType === "Customer") {
      if (!name || !email) {
        throw Error("ALl fields must be field");
      }
      user = await signupCustomer(name, email, hash, userType);
    }

    // create a token
    const token = createToken(user._id, email);
    await sendWelcomeEmail({
      name: name,
      email: email,
      storeName: storeName === undefined ? null : storeName,
    });

    res.status(200).json({ email, name, token, userId: user._id });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
};

const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    // create a token
    const token = createToken(user._id, user.email);
    res.redirect(
      `https://smart-shop-kro.netlify.app/?token=${token}&email=${user.email}&name=${user.name}&userId=${user._id}`
    );
    // res
    //   .status(200)
    //   .json({ email: user.email, name: user.name, token, userId: user._id });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (error) {
    res.status(404).json({ error: "User not found" });
  }
};

module.exports = { login, Signup, googleAuthCallback, getUser };
