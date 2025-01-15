const Order = require("../model/order");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const GetOrder = async (req, res) => {
  try {
    console.log(req.user);
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
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("user")
      .populate("items.product")
      .populate("address");
    return res.status(200).json(order);
  } catch (err) {
    return res.status(500).json({ error: err.message });
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

    const doc = new PDFDocument();
    const fontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Regular.ttf"
    );
    doc.registerFont("NotoSans", fontPath);
    doc.font("NotoSans");

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

    // Order details
    doc.fontSize(16).text(`Order ID: ${order._id}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Customer Name: ${order.user.username}`);
    doc.text(`Customer Email: ${order.user.email}`);
    doc.moveDown();

    // Address details
    const address = order.address;
    if (address) {
      doc.text("Delivery Address:", { underline: true });
      doc.text(`${address.name}`);
      doc.text(`${address.address}`);
      doc.text(
        `${address.locality}, ${address.city}, ${address.state} - ${address.pincode}`
      );
      doc.text(`Phone: ${address.phone}`);
      if (address.landmark) {
        doc.text(`Landmark: ${address.landmark}`);
      }
    }

    doc.moveDown();
    doc.text("Items:", { underline: true });

    // Item details
    order.items.forEach((item) => {
      doc.text(
        `${item.product.title} (x${item.quantity}) - ₹${
          item.product.price * item.quantity
        }`
      );
    });

    doc.moveDown();
    doc.text(`Total Amount: ₹${order.totalAmount}`);
    doc.text(`Status: ${order.status}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);

    doc.end();
  } catch (error) {
    res.status(500).send({ message: "Server Error", error: error.message });
  }
};

module.exports = { GetOrder, showOrderSummary, getOrderPdf };
