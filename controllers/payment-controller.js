// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2023-10-16",
// });

const User = require("../model/user");
const Order = require("../model/order");
const { sendDeliveryEmail } = require("../config/nodemailer");
const Razorpay = require("razorpay");
const crypto = require("crypto");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const createPayment = async (req, res) => {
  const { amount, currency, receipt, addressId } = req.body;
  console.log(req.body);

  const user = await User.findOne(req.user._id);
  const cart = user.cart;

  if (!cart || cart.length === 0) {
    return res.status(200).json({ message: "Cart is empty" });
  }

  const order = await Order.create({
    user: user._id,
    items: cart,
    totalAmount: amount,
    status: "pending",
    createdAt: new Date(), // Set to current date and time
    address: addressId,
  });

  try {
    const options = {
      amount: amount * 100,
      currency,
      receipt,
    };

    const orderr = await razorpay.orders.create(options);
    const combinedResponse = {
      razorpayOrder: orderr,
      createdOrder: order,
    };
    console.log(combinedResponse);
    res.status(200).json(combinedResponse);
  } catch (error) {
    res.status(500).json(error);
  }
};

const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    _id,
    amount,
  } = req.body;

  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest("hex");
  let rs;

  if (generated_signature === razorpay_signature) {
    try {
      const user = await User.findOne(req.user._id);

      const order = await Order.findByIdAndUpdate(_id, {
        status: "success",
      }).populate("address");

      console.log("This is order =>   ", order);

      await sendDeliveryEmail({
        name: user.name,
        email: user.email,
        order_number: order._id,
        total_amount: amount,
        address: order.address,
      });

      console.log(order);
      user.cart = [];
      await user.save();

      console.log(rs);
    } catch (error) {
      console.log(error);
    }
    res.status(200).json({ status: "Payment verified successfully", plan: rs });
  } else {
    res.status(400).json({ status: "Payment verification failed" });
  }
};

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const paymentrequest = async (req, res) => {
  try {
    const { items } = req.body;
    console.log(items);

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product.name,

          // images: [product.image],
        },
        unit_amount: item.product.price * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "https://smart-shop-kro.netlify.app/success",
      cancel_url: "https://smart-shop-kro.netlify.app/cancel",
    });

    res.status(200).json({
      id: session.id,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const PaymentSuccess = async (req, res) => {
  try {
    console.log(req.params); // Log the request body to verify the data

    const { totalPrice } = req.params;
    const user = await User.findOne(req.user._id);
    const cart = user.cart;

    if (!cart || cart.length === 0) {
      return res.status(200).json({ message: "Cart is empty" });
    }

    const order = await Order.create({
      user: user._id,
      items: cart,
      totalAmount: totalPrice,
      status: "success",
      createdAt: new Date(), // Set to current date and time
    });

    await sendDeliveryEmail({
      name: user.name,
      email: user.email,
      order_number: order._id,
      total_amount: totalPrice,
    });

    console.log(order);
    user.cart = [];
    await user.save();

    res.status(200).json({ message: "Payment Success" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  paymentrequest,
  PaymentSuccess,
  createPayment,
  verifyPayment,
};
