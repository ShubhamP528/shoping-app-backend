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

// const getOrderPdf = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.orderId).populate(
//       "items.product user address"
//     );
//     if (!order) {
//       return res.status(404).send("Order not found");
//     }
//     console.log(order);

//     const doc = new PDFDocument({ margin: 50 });

//     // Register fonts - ensure these files exist in your fonts folder
//     const regularFontPath = path.join(
//       __dirname,
//       "..",
//       "fonts",
//       "NotoSans-Regular.ttf"
//     );
//     const boldFontPath = path.join(
//       __dirname,
//       "..",
//       "fonts",
//       "NotoSans-Bold.ttf"
//     );
//     doc.registerFont("NotoSans", regularFontPath);
//     doc.registerFont("NotoSansBold", boldFontPath);

//     // Set default font to regular
//     doc.font("NotoSans");

//     // Collect PDF data chunks
//     const chunks = [];
//     doc.on("data", (chunk) => chunks.push(chunk));
//     doc.on("end", () => {
//       const pdfBuffer = Buffer.concat(chunks);
//       res.setHeader(
//         "Content-disposition",
//         `attachment; filename="order_${order._id}.pdf"`
//       );
//       res.setHeader("Content-type", "application/pdf");
//       res.send(pdfBuffer);
//     });

//     // HEADER with bold font
//     doc
//       .font("NotoSansBold")
//       .fontSize(16)
//       .text("Smart Solution Pvt. Ltd.", 50, 50);
//     // doc
//     //   .font("NotoSans")
//     //   .fontSize(12)
//     //   .text("www.smart-shop-kro.netlify.app", 50, 70);
//     // Horizontal line
//     doc.moveTo(50, 90).lineTo(550, 90).stroke();

//     // Invoice Title in bold
//     doc
//       .font("NotoSansBold")
//       .fontSize(14)
//       .text(`Invoice for Order: ${order._id}`, 50, 100);

//     // User & Order Info (Regular font)
//     doc
//       .font("NotoSans")
//       .fontSize(12)
//       .text(`User: ${order.user.name}`, 50, 130)
//       .text(`Email: ${order.user.email}`, 50, 145)
//       .text(`Status: ${order.status}`, 50, 160)
//       .text(
//         `Order Date: ${new Date(order.createdAt).toLocaleString()}`,
//         50,
//         175
//       );

//     // Divider
//     doc.moveTo(50, 190).lineTo(550, 190).stroke();

//     let currentY = 200;

//     // Address Section (if exists)
//     if (order.address) {
//       doc.font("NotoSansBold").text("Delivery Address:", 50, currentY);
//       currentY += 15;
//       doc.font("NotoSans").text(order.address.name, 50, currentY);
//       currentY += 15;
//       doc.text(order.address.address, 50, currentY);
//       currentY += 15;
//       doc.text(
//         `${order.address.locality}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
//         50,
//         currentY
//       );
//       currentY += 15;
//       doc.text(`Phone: ${order.address.phone}`, 50, currentY);
//       if (order.address.landmark) {
//         currentY += 15;
//         doc.text(`Landmark: ${order.address.landmark}`, 50, currentY);
//       }
//       currentY += 20;
//       doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
//       currentY += 10;
//     }

//     // Items Table Header in bold
//     doc.font("NotoSansBold").fontSize(12).fillColor("black");
//     doc.text("Product", 50, currentY);
//     doc.text("Quantity", 250, currentY, { width: 80, align: "center" });
//     doc.text("Price", 320, currentY, { width: 70, align: "center" });
//     doc.text("Total", 400, currentY, { width: 70, align: "center" });
//     currentY += 20;

//     // Items Table Rows in regular font
//     order.items.forEach((item) => {
//       doc.font("NotoSans");
//       doc.text(item.product.name, 50, currentY);
//       // doc.text(`${item.quantity}`, 250, currentY, {
//       //   width: 50,
//       //   align: "center",
//       // });
//       doc.text(String(item.quantity), 250, currentY, {
//         width: 80,
//         align: "center",
//       });
//       doc.text(`${item.product.price}/-`, 320, currentY, {
//         width: 70,
//         align: "center",
//       });
//       doc.text(`${item.quantity * item.product.price}/-`, 400, currentY, {
//         width: 70,
//         align: "center",
//       });
//       currentY += 20;
//     });

//     // Calculate subtotal and total amounts
//     const subtotal = order.items.reduce(
//       (acc, item) => acc + item.product.price * item.quantity,
//       0
//     );
//     const totalAmount = order.totalAmount;

//     currentY += 10;
//     doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
//     currentY += 10;

//     // Totals (using bold for labels)
//     doc
//       .font("NotoSansBold")
//       .text(`Subtotal: `, 50, currentY, { continued: true });
//     doc.font("NotoSans").text(`${subtotal}/-`);
//     currentY += 15;
//     doc
//       .font("NotoSansBold")
//       .text(`Total Amount: `, 50, currentY, { continued: true });
//     doc.font("NotoSans").text(`${totalAmount}/-`);
//     currentY += 30;

//     // Footer with Terms in small regular font
//     doc
//       .font("NotoSans")
//       .fontSize(8)
//       .text(
//         "Terms and Conditions: All sales are final. No refunds.",
//         50,
//         currentY,
//         { align: "center", width: 500 }
//       );

//     doc.end();
//   } catch (error) {
//     res.status(500).send({ message: "Server Error", error: error.message });
//   }
// };

// const getOrderPdf = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.orderId).populate(
//       "items.product user address"
//     );
//     if (!order) {
//       return res.status(404).send("Order not found");
//     }
//     console.log(order);

//     const doc = new PDFDocument({ margin: 50 });

//     // Register fonts - ensure these files exist in your fonts folder
//     const regularFontPath = path.join(
//       __dirname,
//       "..",
//       "fonts",
//       "NotoSans-Regular.ttf"
//     );
//     const boldFontPath = path.join(
//       __dirname,
//       "..",
//       "fonts",
//       "NotoSans-Bold.ttf"
//     );
//     doc.registerFont("NotoSans", regularFontPath);
//     doc.registerFont("NotoSansBold", boldFontPath);
//     doc.font("NotoSans");

//     // Buffer chunks for output
//     const chunks = [];
//     doc.on("data", (chunk) => chunks.push(chunk));
//     doc.on("end", () => {
//       const pdfBuffer = Buffer.concat(chunks);
//       res.setHeader(
//         "Content-disposition",
//         `attachment; filename="order_${order._id}.pdf"`
//       );
//       res.setHeader("Content-type", "application/pdf");
//       res.send(pdfBuffer);
//     });

//     // --- Header Section ---
//     // Draw a colored rectangle as header background
//     doc.rect(50, 40, 500, 50).fill("#2980b9");
//     // Company Name in Bold White Text
//     doc
//       .fillColor("white")
//       .font("NotoSansBold")
//       .fontSize(20)
//       .text("Smart Solution Pvt. Ltd.", 60, 50, { align: "left" });
//     // Website in Regular White Text
//     // doc
//     //   .font("NotoSans")
//     //   .fontSize(12)
//     //   .text("www.smart-shop-kro.netlify.app", 60, 75, { align: "left" });
//     // Reset text color for body
//     doc.fillColor("black");

//     // Draw a light gray line under header
//     doc.moveTo(50, 100).lineTo(550, 100).stroke("#cccccc");

//     // --- Invoice Title ---
//     doc
//       .font("NotoSansBold")
//       .fontSize(16)
//       .fillColor("#2980b9")
//       .text(`Invoice for Order: ${order._id}`, 50, 110);
//     doc.fillColor("black");

//     // --- User & Order Info Section ---
//     let startY = 140;
//     // Draw a light gray rectangle background
//     doc.rect(50, startY, 500, 60).fill("#f2f2f2");
//     doc.fillColor("black").font("NotoSans").fontSize(12);
//     doc.text(`User: ${order.user.name}`, 60, startY + 10);
//     doc.text(`Email: ${order.user.email}`, 60, startY + 25);
//     doc.text(`Status: ${order.status}`, 300, startY + 10);
//     doc.text(
//       `Order Date: ${new Date(order.createdAt).toLocaleString()}`,
//       300,
//       startY + 25
//     );
//     startY += 80;

//     // --- Address Section (if exists) ---
//     if (order.address) {
//       doc
//         .font("NotoSansBold")
//         .fontSize(12)
//         .text("Delivery Address:", 50, startY);
//       startY += 15;
//       doc.font("NotoSans").fontSize(12).text(order.address.name, 50, startY);
//       startY += 15;
//       doc.text(order.address.address, 50, startY);
//       startY += 15;
//       doc.text(
//         `${order.address.locality}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
//         50,
//         startY
//       );
//       startY += 15;
//       doc.text(`Phone: ${order.address.phone}`, 50, startY);
//       if (order.address.landmark) {
//         startY += 15;
//         doc.text(`Landmark: ${order.address.landmark}`, 50, startY);
//       }
//       startY += 20;
//       doc.moveTo(50, startY).lineTo(550, startY).stroke("#cccccc");
//       startY += 10;
//     }

//     // --- Items Table Header ---
//     // Draw header background for table columns
//     doc.rect(50, startY, 500, 20).fill("#2980b9");
//     doc.fillColor("white").font("NotoSansBold").fontSize(12);
//     doc.text("Product", 55, startY + 5);
//     doc.text("Quantity", 250, startY + 5, { width: 60, align: "center" });
//     doc.text("Price", 330, startY + 5, { width: 70, align: "right" });
//     doc.text("Total", 410, startY + 5, { width: 70, align: "right" });
//     startY += 25;

//     // --- Items Table Rows ---
//     doc.fillColor("black").font("NotoSans").fontSize(12);
//     order.items.forEach((item) => {
//       doc.text(item.product.name, 55, startY);
//       doc.text(String(item.quantity), 250, startY, {
//         width: 60,
//         align: "center",
//       });
//       doc.text(`${item.product.price}/-`, 330, startY, {
//         width: 70,
//         align: "right",
//       });
//       doc.text(`${item.quantity * item.product.price}/-`, 410, startY, {
//         width: 70,
//         align: "right",
//       });
//       startY += 20;
//     });

//     // --- Totals Section ---
//     const subtotal = order.items.reduce(
//       (acc, item) => acc + item.product.price * item.quantity,
//       0
//     );
//     const totalAmount = order.totalAmount;
//     startY += 10;
//     doc.moveTo(50, startY).lineTo(550, startY).stroke("#cccccc");
//     startY += 10;
//     // Subtotal
//     doc.font("NotoSansBold").text("Subtotal:", 50, startY, { continued: true });
//     doc
//       .font("NotoSans")
//       .text(` ${subtotal}/-`, { align: "right", continued: true });
//     doc.text("", 450, startY);
//     startY += 15;
//     // Total Amount
//     doc
//       .font("NotoSansBold")
//       .text("Total Amount:", 50, startY, { continued: true });
//     doc
//       .font("NotoSans")
//       .text(` ${totalAmount}/-`, { align: "right", continued: true });
//     doc.text("", 450, startY);
//     startY += 30;

//     // --- Footer Section ---
//     // Draw a light gray rectangle for the footer background
//     doc.rect(50, startY, 500, 30).fill("#f2f2f2");
//     doc
//       .fillColor("black")
//       .font("NotoSans")
//       .fontSize(8)
//       .text(
//         "Terms and Conditions: All sales are final. No refunds.",
//         55,
//         startY + 10,
//         { align: "center", width: 490 }
//       );

//     doc.end();
//   } catch (error) {
//     res.status(500).send({ message: "Server Error", error: error.message });
//   }
// };

const getOrderPdf = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "items.product user address"
    );
    if (!order) {
      return res.status(404).send("Order not found");
    }
    console.log(order);

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Register fonts (ensure these font files exist)
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
    doc.font("NotoSans");

    // Buffer chunks for output
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

    // ---------------- Header Section ----------------
    // Draw a colored rectangle for header background with rounded corners
    doc.roundedRect(50, 30, 500, 70, 10).fill("#2980b9");
    // Optional: add company logo (adjust path as needed)
    const logoPath = path.join(__dirname, "..", "assets", "logo.png");
    // If logo exists, display it at top-left (uncomment if you have a logo)
    // doc.image(logoPath, 60, 35, { width: 50 });

    // Company Name & Website
    doc
      .fillColor("white")
      .font("NotoSansBold")
      .fontSize(22)
      .text("Smart Solution Pvt. Ltd.", 120, 40, { align: "left" });
    // doc
    //   .font("NotoSans")
    //   .fontSize(12)
    //   .text("www.smart-shop-kro.netlify.app", 120, 68, { align: "left" });
    doc.fillColor("black");

    // Divider below header
    doc.moveTo(50, 110).lineTo(550, 110).stroke("#cccccc");

    // ---------------- Invoice Title ----------------
    doc
      .font("NotoSansBold")
      .fontSize(18)
      .fillColor("#2980b9")
      .text(`Invoice for Order: ${order._id}`, 50, 120);
    doc.fillColor("black");

    // ---------------- Customer & Order Info ----------------
    let currentY = 150;
    // Background for info section
    doc.roundedRect(50, currentY, 500, 60, 5).fill("#f9f9f9");
    doc.fillColor("black").font("NotoSans").fontSize(12);
    doc.text(`User: ${order.user.name}`, 60, currentY + 10);
    doc.text(`Email: ${order.user.email}`, 60, currentY + 25);
    doc.text(`Status: ${order.status}`, 300, currentY + 10);
    doc.text(
      `Order Date: ${new Date(order.createdAt).toLocaleString()}`,
      300,
      currentY + 25
    );
    currentY += 80;

    // ---------------- Delivery Address ----------------
    if (order.address) {
      doc
        .font("NotoSansBold")
        .fontSize(12)
        .fillColor("#2980b9")
        .text("Delivery Address:", 50, currentY);
      currentY += 15;
      doc.font("NotoSans").fontSize(12).fillColor("black");
      doc.text(order.address.name, 50, currentY);
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
      doc.moveTo(50, currentY).lineTo(550, currentY).stroke("#cccccc");
      currentY += 10;
    }

    // ---------------- Items Table Header ----------------
    // Draw header background for table columns
    doc.roundedRect(50, currentY, 500, 20, 3).fill("#2980b9");
    doc.fillColor("white").font("NotoSansBold").fontSize(12);
    doc.text("Product", 55, currentY + 3);
    doc.text("Quantity", 250, currentY + 3, { width: 60, align: "center" });
    doc.text("Price", 330, currentY + 3, { width: 70, align: "right" });
    doc.text("Total", 410, currentY + 3, { width: 70, align: "right" });
    currentY += 25;

    // ---------------- Items Table Rows ----------------
    doc.font("NotoSans").fontSize(12).fillColor("black");
    order.items.forEach((item, index) => {
      // Alternate row background colors
      if (index % 2 === 0) {
        doc.rect(50, currentY - 2, 500, 20).fill("#f2f2f2");
      }
      doc.fillColor("black");
      doc.text(item.product.name, 55, currentY);
      doc.text(String(item.quantity), 250, currentY, {
        width: 60,
        align: "center",
      });
      doc.text(`${item.product.price}/-`, 330, currentY, {
        width: 70,
        align: "right",
      });
      doc.text(`${item.quantity * item.product.price}/-`, 410, currentY, {
        width: 70,
        align: "right",
      });
      currentY += 20;
    });

    // ---------------- Totals Section ----------------
    const subtotal = order.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    const totalAmount = order.totalAmount;
    currentY += 10;
    doc.moveTo(50, currentY).lineTo(550, currentY).stroke("#cccccc");
    currentY += 10;
    doc
      .font("NotoSansBold")
      .text("Subtotal:", 50, currentY, { continued: true });
    doc
      .font("NotoSans")
      .text(` ${subtotal}/-`, { align: "right", continued: true });
    doc.text("", 450, currentY);
    currentY += 15;
    doc
      .font("NotoSansBold")
      .text("Total Amount:", 50, currentY, { continued: true });
    doc
      .font("NotoSans")
      .text(` ${totalAmount}/-`, { align: "right", continued: true });
    doc.text("", 450, currentY);
    currentY += 30;

    // ---------------- Footer Section ----------------
    // Draw footer background
    doc.roundedRect(50, currentY, 500, 30, 5).fill("#f9f9f9");
    doc
      .fillColor("black")
      .font("NotoSans")
      .fontSize(10)
      .text(
        "Thank you for your business! Terms and Conditions: All sales are final. No refunds.",
        55,
        currentY + 8,
        { align: "center", width: 490 }
      );

    doc.end();
  } catch (error) {
    res.status(500).send({ message: "Server Error", error: error.message });
  }
};
module.exports = { GetOrder, showOrderSummary, getOrderPdf, PlaceOrder };
