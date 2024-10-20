const express = require("express");
const router = express.Router();
const User = require("../model/user");
const passport = require("passport");

// registeration
router.post("/customer/register", async (req, res) => {
  try {
    const user = new User({
      email: req.body.email,
      userType: req.body.userType,
      username: req.body.username,
    });
    await User.register(user, req.body.password.trim());
    passport.authenticate("local", {
      failureRedirect: "/register",
      failureFlash: true,
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// logined
router.post(
  "/login",
  async (req, res, next) => {
    try {
      req.body.username = req.body.username;
      req.body.password = req.body.password;
      passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
      })(req, res, next); // Invoke the middleware with (req, res, next);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },
  async (req, res) => {
    try {
      res.status(200).json({ mesage: `Welcome Back!! ${req.body.username}` });
      console.log(req.user); // This should now display the logged-in user
    } catch (e) {
      req.flash("error", `${e.message}`);
      res.redirect("/login");
    }
  }
);

router.get("/logout", (req, res) => {
  try {
    req.logOut(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (e) {
    res.status(500).json({ message: "Error logging out" });
  }
});

module.exports = router;
