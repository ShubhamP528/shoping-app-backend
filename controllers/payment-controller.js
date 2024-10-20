// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2023-10-16",
// });

const User = require("../model/user");
const Order = require("../model/order");
const { sendDeliveryEmail } = require("../config/nodemailer");

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

module.exports = { paymentrequest, PaymentSuccess };
