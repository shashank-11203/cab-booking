import PDFDocument from "pdfkit";
import Ride from "../models/Ride.js";
import User from "../models/User.js";
import moment from "moment";

export const generateInvoice = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId).lean();
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    const user = await User.findById(ride.userId).lean();

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice_${rideId}.pdf`
    );

    doc.pipe(res);

    /* =========================
       HEADER
    ========================= */
    doc.fontSize(22).fillColor("#000").text("Durdarshan Travels");

    doc
      .fontSize(10)
      .fillColor("#444")
      .text("Raja complex, Vathan chowk,")
      .text("M.S.V. High School road, Navavas,")
      .text("Madhapar, Ta. Bhuj - Kutch")
      .moveDown();

    doc
      .fontSize(10)
      .fillColor("#666")
      .text(`Invoice ID: ${rideId}`)
      .text(`Invoice Date: ${moment().format("DD MMM YYYY, h:mm A")}`)
      .moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#ccc").moveDown();

    /* =========================
       CUSTOMER DETAILS
    ========================= */
    doc.fontSize(14).fillColor("#000").text("Customer Details", { underline: true }).moveDown(0.5);
    doc.fontSize(12).fillColor("#333");
    doc.text(`Name: ${user?.name || "-"}`);
    doc.text(`Email: ${user?.email || "-"}`);
    doc.text(`Phone: ${user?.phone || "-"}`);

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#ccc").moveDown();

    /* =========================
       RIDE DETAILS
    ========================= */
    doc.fontSize(14).fillColor("#000").text("Ride Details", { underline: true }).moveDown(0.5);
    doc.fontSize(12).fillColor("#333");
    doc.text(`From: ${ride.pickupName}`);
    doc.text(`To: ${ride.dropName}`);
    doc.text(`Date: ${ride.date}`);
    doc.text(`Time: ${ride.time}`);
    doc.text(`Distance: ${ride.distanceKm || "-"} km`);
    doc.text(`Car: ${ride.carName || "-"}`);

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#ccc").moveDown();

    /* =========================
       FARE CALCULATION (FIXED)
    ========================= */

    const finalTotal = Number(
      ride.finalFare || ride.fare || 0
    );

    const extraCharge = Number(
      ride.extraChargeStatus === "paid" ? ride.extraChargeAmount || 0 : 0
    );

    const baseFareWithGst = finalTotal - extraCharge;

    const gst = Number(((baseFareWithGst * 18) / 118).toFixed(2));

    const baseFareWithoutGst = Number(
      (baseFareWithGst - gst).toFixed(2)
    );


    /* =========================
       FARE SUMMARY
    ========================= */
    doc.fontSize(14).fillColor("#000").text("Fare Summary", { underline: true }).moveDown(0.8);
    doc.fontSize(12).fillColor("#333");

    doc.fontSize(14).fillColor("#000").text("Fare Summary", { underline: true }).moveDown(0.8);
    doc.fontSize(12).fillColor("#333");

    doc.text(`Base Fare (Excl. GST):      Rs. ${baseFareWithoutGst}`);
    doc.text(`GST (18%):                        Rs. ${gst}`);

    if (extraCharge > 0) {
      doc.text(`Extra Charge:                     Rs. ${extraCharge}`);
    }

    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#000").text(`Total Amount Paid: Rs. ${finalTotal + extraCharge}`);

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not generate invoice" });
  }
};