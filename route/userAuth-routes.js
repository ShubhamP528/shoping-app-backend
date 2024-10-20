const express = require("express");
const router = express.Router();
const passport = require("passport");
require("../services/passport"); // passport configuration

// user Controller
const {
  login,
  Signup,
  getUser,
  googleAuthCallback,
} = require("../controllers/userAuth-controller");
const requireAuth = require("../middleware/requireAuth");

// login
router.post("/login", login);

//signup
router.post("/signup", Signup);

// getUser

// router.post("/google/login", googleLogin);

// Routes
router.get("/", (req, res) => {
  res.send(
    '<h1>Home Page</h1><a href="/api/auth/google">Login with Google</a>'
  );
});

// Authentication routes
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  googleAuthCallback
);

router.get("/profile", (req, res) => {
  if (!req.user) {
    return res.redirect("https://smart-shop-kro.netlify.app/");
  }
  console.log(req.user);
  res.send(
    `<h1>Welcome ${req.user.name}</h1><p>Email: ${req.user.email}</p><a href="/logout">Logout</a>`
  );
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

router.get("/getUser", requireAuth, getUser);

module.exports = router;
