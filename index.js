const express = require("express");
const app = express();
const cors = require("cors");
const seedDB = require("./seed");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const dbconnect = require("./config/Dbconnect");
const productRoutes = require("./route/product-routes");
const userAuthRoutes = require("./route/userAuth-routes");
const cartRoutes = require("./route/cart-routes");
const paymentRoutes = require("./route/payment-routes");
const orderRoutes = require("./route/order-routes");

dbconnect();

// seedDB();

app.use(cors()); // Enable cors for all requests

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", productRoutes);
// app.use("/api", userRoutes);
app.use("/api", userAuthRoutes);
app.use("/api", cartRoutes);
app.use("/api", paymentRoutes);
app.use("/api", orderRoutes);

app.listen(8000 || process.env.PORT, () => {
  console.log(`Server is running on port ${8000 || process.env.PORT}`);
});
