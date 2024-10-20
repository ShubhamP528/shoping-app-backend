// config/nodemailer.js
const nodemailer = require("nodemailer");

require("dotenv").config();
const handlebars = require("handlebars");

const welcomEmail = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Smart Shop Kro</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #4338ca;
        padding: 20px;
        text-align: center;
        color: #ffffff;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 20px;
        text-align: left;
        color: #333333;
      }
      .footer {
        background-color: #f4f4f4;
        padding: 10px;
        text-align: center;
        font-size: 12px;
        color: #999999;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
      }
      .btn {
        display: inline-block;
        padding: 10px 20px;
        margin-top: 20px;
        background-color: #4338ca;
        color: white;
        text-decoration: none;
        border-radius: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to Smart Shop Kro, {{name}}!</h1>
      </div>
      <div class="content">
        <p>Hi {{name}},</p>
        <p>
          We're thrilled to have you with us. Thank you for joining Smart Shop Kro! You can now explore a wide variety of products across multiple categories.
        </p>

        {{#if storeName}}
        <p>
          Since you’ve set up a store named <strong>{{storeName}}</strong>, you’re ready to sell your products on our platform!
        </p>
        {{/if}}

        <p>
          To get started, visit your account dashboard where you can manage your profile, track orders, and much more.
        </p>
        <a href="https://smart-shop-kro.netlify.app" class="btn">Go to Shop</a>

        <p>If you need any help, feel free to contact our support team at <a href="mailto:support@smartshopkro.com">support@smartshopkro.com</a>.</p>

        <p>Best Regards,<br />The Smart Shop Kro Team</p>
      </div>
      <div class="footer">
        <p>&copy; 2024 Smart Shop Kro. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;

const WelcomeTemplate = handlebars.compile(welcomEmail);

const deliveryEmail = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Confirmation</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #4338ca;
        padding: 20px;
        text-align: center;
        color: #ffffff;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 20px;
        text-align: left;
        color: #333333;
      }
      .content h2 {
        color: #4338ca;
      }
      .footer {
        background-color: #f4f4f4;
        padding: 10px;
        text-align: center;
        font-size: 12px;
        color: #999999;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
      }
      .btn {
        display: inline-block;
        padding: 10px 20px;
        margin-top: 20px;
        background-color: #4338ca;
        color: white;
        text-decoration: none;
        border-radius: 5px;
      }
      .order-summary {
        background-color: #f9f9f9;
        padding: 15px;
        margin-top: 20px;
        border-radius: 8px;
      }
      .order-summary p {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Thank You for Your Purchase, {{username}}!</h1>
      </div>
      <div class="content">
        <h2>Your Order Has Been Placed!</h2>
        <p>
          Hi {{username}},
        </p>
        <p>
          We’re excited to let you know that your order has been successfully placed! Your items will be delivered within <strong>3 business days</strong>.
        </p>

        <div class="order-summary">
          <h3>Order Summary</h3>
          <p><strong>Order Number:</strong> {{order_number}}</p>
          <p><strong>Total Amount:</strong> ₹{{total_amount}}</p>
          <p><strong>Estimated Delivery Date:</strong> {{delivery_date}}</p>
        </div>

        <p>
          You can track your order status or make changes by visiting your order
          page:
        </p>
        <a href="https://smart-shop-kro.netlify.app/orders" class="btn">View My Order</a>

        <p>
          If you have any questions or need further assistance, feel free to contact our support team at <a href="mailto:support@smartshopkro.com">support@smartshopkro.com</a>.
        </p>

        <p>Happy shopping!</p>
        <p><strong>The Smart Shop Kro Team</strong></p>
      </div>
      <div class="footer">
        <p>
          &copy; 2024 Smart Shop Kro. All rights reserved. If you didn't make this purchase, please <a href="mailto:support@smartshopkro.com">contact us</a> immediately.
        </p>
      </div>
    </div>
  </body>
</html>
`;

const deliveryTemplate = handlebars.compile(deliveryEmail);

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  logger: true,
  debug: true,
  secureConnection: true,
  auth: {
    user: process.env.EMAIL_USER, // Replace with your email
    pass: process.env.EMAIL_PASS, // Replace with your email password
  },
  tls: {
    rejectUnauthorized: true,
  },
});

const sendContactEmail = (contact) => {
  console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
  const mailOptions = {
    from: contact.email,
    to: process.env.EMAIL_USER,
    subject: `Contact Us Message from ${contact.name}`,
    text: contact.message,
    html: `<p><strong>Name:</strong> ${contact.name}</p>
           <p><strong>Email:</strong> ${contact.email}</p>
           <p><strong>Message:</strong> ${contact.message}</p>`,
  };

  return transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = (user) => {
  console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);

  const filledTemplate = WelcomeTemplate({
    name: user.name,
    storeName: user.storeName || null, // If storeName exists
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Welcome to Smart Shop Kro Application`,
    html: filledTemplate,
  };

  return transporter.sendMail(mailOptions);
};

const sendDeliveryEmail = (user) => {
  console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);

  const calculateDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 3);
    return deliveryDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  const filledTemplate = deliveryTemplate({
    username: user.name,
    order_number: user.order_number,
    total_amount: user.total_amount,
    delivery_date: calculateDeliveryDate,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Product order summary`,
    html: filledTemplate,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendContactEmail, sendWelcomeEmail, sendDeliveryEmail };
