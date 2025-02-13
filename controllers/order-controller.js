const Order = require("../model/order");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const User = require("../model/user");

const GetOrder = async (req, res) => {
  try {
    // console.log(req.user);
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product address user")
      .sort({ createdAt: -1 }); // Sort in descending order of createdAt

    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const showOrderSummary = async (req, res) => {
  try {
    console.log("Hello");
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("user")
      .populate("items.product")
      .populate("address")
      ?.populate("card");

    console.log(order);
    return res.status(200).json(order);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const PlaceOrder = async (req, res) => {
  try {
    const order = req.body;
    console.log(req.body);

    const user = await User.findOne(req.user._id);
    const cart = user.cart;

    if (!cart || cart.length === 0) {
      return res.status(200).json({ message: "Cart is empty" });
    }

    const placeOrder = await Order.create({
      user: user._id,
      items: cart,
      totalAmount: order.amount,
      status: "success",
      createdAt: new Date(), // Set to current date and time
      address: order.addressId,
      card: order.cardId,
      shippingFee: order.shippingFee,
      shippingMethod: order.shippingMethod,
    });

    user.cart = [];
    await user.save();

    console.log("This is order =>   ", placeOrder);
    return res.status(201).json(placeOrder);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Server Error", error: error.message });
  }
};

const getOrderPdf = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "items.product user address"
    );
    if (!order) {
      return res.status(404).send("Order not found");
    }
    console.log(order);

    const doc = new PDFDocument({ margin: 50 });

    // Register fonts - ensure these files exist in your fonts folder
    const regularFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Regular.ttf"
    );
    const boldFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Bold.ttf"
    );
    doc.registerFont("NotoSans", regularFontPath);
    doc.registerFont("NotoSansBold", boldFontPath);

    // Set default font to regular
    doc.font("NotoSans");

    // Collect PDF data chunks
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader(
        "Content-disposition",
        `attachment; filename="order_${order._id}.pdf"`
      );
      res.setHeader("Content-type", "application/pdf");
      res.send(pdfBuffer);
    });

    // HEADER with bold font
    doc
      .font("NotoSansBold")
      .fontSize(16)
      .text("Smart Solution Pvt. Ltd.", 50, 50);
    // doc
    //   .font("NotoSans")
    //   .fontSize(12)
    //   .text("www.smart-shop-kro.netlify.app", 50, 70);
    // Horizontal line
    doc.moveTo(50, 90).lineTo(550, 90).stroke();

    // Invoice Title in bold
    doc
      .font("NotoSansBold")
      .fontSize(14)
      .text(`Invoice for Order: ${order._id}`, 50, 100);

    // User & Order Info (Regular font)
    doc
      .font("NotoSans")
      .fontSize(12)
      .text(`User: ${order.user.name}`, 50, 130)
      .text(`Email: ${order.user.email}`, 50, 145)
      .text(`Status: ${order.status}`, 50, 160)
      .text(
        `Order Date: ${new Date(order.createdAt).toLocaleString()}`,
        50,
        175
      );

    // Divider
    doc.moveTo(50, 190).lineTo(550, 190).stroke();

    let currentY = 200;

    // Address Section (if exists)
    if (order.address) {
      doc.font("NotoSansBold").text("Delivery Address:", 50, currentY);
      currentY += 15;
      doc.font("NotoSans").text(order.address.name, 50, currentY);
      currentY += 15;
      doc.text(order.address.address, 50, currentY);
      currentY += 15;
      doc.text(
        `${order.address.locality}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
        50,
        currentY
      );
      currentY += 15;
      doc.text(`Phone: ${order.address.phone}`, 50, currentY);
      if (order.address.landmark) {
        currentY += 15;
        doc.text(`Landmark: ${order.address.landmark}`, 50, currentY);
      }
      currentY += 20;
      doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 10;
    }

    // Items Table Header in bold
    doc.font("NotoSansBold").fontSize(12).fillColor("black");
    doc.text("Product", 50, currentY);
    doc.text("Quantity", 250, currentY, { width: 50, align: "center" });
    doc.text("Price", 320, currentY, { width: 70, align: "right" });
    doc.text("Total", 400, currentY, { width: 70, align: "right" });
    currentY += 20;

    // Items Table Rows in regular font
    order.items.forEach((item) => {
      doc.font("NotoSans");
      doc.text(item.product.name, 50, currentY);
      doc.text(`${item.quantity}`, 250, currentY, {
        width: 50,
        align: "center",
      });
      doc.text(`${item.product.price}/-`, 320, currentY, {
        width: 70,
        align: "right",
      });
      doc.text(`${item.quantity * item.product.price}/-`, 400, currentY, {
        width: 70,
        align: "right",
      });
      currentY += 20;
    });

    // Calculate subtotal and total amounts
    const subtotal = order.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    const totalAmount = order.totalAmount;

    currentY += 10;
    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 10;

    // Totals (using bold for labels)
    doc
      .font("NotoSansBold")
      .text(`Subtotal: `, 50, currentY, { continued: true });
    doc.font("NotoSans").text(`${subtotal}/-`);
    currentY += 15;
    doc
      .font("NotoSansBold")
      .text(`Total Amount: `, 50, currentY, { continued: true });
    doc.font("NotoSans").text(`${totalAmount}/-`);
    currentY += 30;

    // Footer with Terms in small regular font
    doc
      .font("NotoSans")
      .fontSize(8)
      .text(
        "Terms and Conditions: All sales are final. No refunds.",
        50,
        currentY,
        { align: "center", width: 500 }
      );

    doc.end();
  } catch (error) {
    res.status(500).send({ message: "Server Error", error: error.message });
  }
};

module.exports = { GetOrder, showOrderSummary, getOrderPdf, PlaceOrder };
