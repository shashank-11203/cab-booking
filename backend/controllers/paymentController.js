import { razorpay } from "../utils/razorpay.js";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Ride from "../models/Ride.js";
import User from "../models/User.js";
import { sendBookingConfirmationEmail } from "../utils/bookingEmailService.js";
import CorporateRide from "../models/CorporateRides.js";
import Coupon from "../models/Coupon.js";
import { createPaymentRecord, updatePaymentStatus } from "../utils/paymentHelper.js";
import { makeUTCStartTime } from "../utils/dateUtils.js";

export const createOrder = async (req, res) => {
  try {
    const { amount, userId, rideDetails } = req.body;

    if (!amount || !userId || !rideDetails) {
      return res.json({ success: false, message: "Amount, userId & rideDetails required" });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `order_${Date.now()}`
    });

    await createPaymentRecord({
      userId,
      referenceType: "Ride",
      referenceId: null,
      paymentType: "initial_payment",
      amount: amount / 100,
      rawAmount: amount,
      razorpayOrderId: order.id,
      rideData: {
        pickupName: rideDetails.pickup.name,
        pickupLat: rideDetails.pickup.lat,
        pickupLon: rideDetails.pickup.lon,
        dropName: rideDetails.drop.name,
        dropLat: rideDetails.drop.lat,
        dropLon: rideDetails.drop.lon,
        distanceKm: rideDetails.distanceKm,
        durationMinutes: rideDetails.durationMinutes,
        rideType: rideDetails.rideType,
        date: rideDetails.date,
        time: rideDetails.time,
        passengers: rideDetails.passengers,
        carName: rideDetails.carName,
        carId: rideDetails.carId,
        fare: rideDetails.fare,
        finalFare: rideDetails.finalFare,
        coupon: rideDetails.coupon
      },
      metadata: {
        isExtraCharge: false,
        isCorporate: false
      }
    });

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.log("Order Error:", err);
    res.json({ success: false, message: "Could not create payment order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    console.log("=== VERIFY PAYMENT REQUEST ===");
    console.log("Request body:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log("Missing Razorpay response fields");
      return res.json({
        success: false,
        message: "Missing payment details"
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({ success: false, message: "Invalid signature" });
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

    if (!payment) {
      return res.json({ success: false, message: "Payment record not found" });
    }

    if (!payment.rideDetails) {
      return res.json({ success: false, message: "Ride details not found" });
    }

    const startTime = makeUTCStartTime(
      payment.rideDetails.date,
      payment.rideDetails.time
    );

    const ride = await Ride.create({
      userId: payment.userId,
      pickupName: payment.rideDetails.pickupName,
      pickupLat: payment.rideDetails.pickupLat,
      pickupLon: payment.rideDetails.pickupLon,
      dropName: payment.rideDetails.dropName,
      dropLat: payment.rideDetails.dropLat,
      dropLon: payment.rideDetails.dropLon,
      distanceKm: payment.rideDetails.distanceKm,
      durationMinutes: payment.rideDetails.durationMinutes,
      fare: payment.rideDetails.fare,
      finalFare: payment.rideDetails.finalFare,
      rideType: payment.rideDetails.rideType,
      date: payment.rideDetails.date,
      time: payment.rideDetails.time,
      startTime: startTime,
      passengers: payment.rideDetails.passengers,
      carName: payment.rideDetails.carName,
      carId: payment.rideDetails.carId,
      paymentStatus: "paid",
      rideStatus: "upcoming",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      coupon: payment.rideDetails.coupon || null,
    });

    if (payment.rideDetails.coupon?.code) {
      const { code, discountAmount } = payment.rideDetails.coupon;

      await Coupon.findOneAndUpdate(
        { code },
        {
          $inc: {
            usedCount: 1,
            totalDiscountAmount: discountAmount,
          },
        }
      );
    }

    payment.status = "paid";
    payment.referenceId = ride._id;
    payment.rideId = ride._id;
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    res.json({
      success: true,
      message: "Payment Verified & Ride Created",
      rideId: ride._id
    });

    (async () => {
      try {
        const savedRide = await Ride.findById(ride._id);
        if (!savedRide) {
          console.log("Email skipped: Ride not found in DB yet");
          return;
        }

        const user = await User.findById(userId);
        if (!user?.email) {
          console.log("Email skipped: User email not found");
          return;
        }

        await sendBookingConfirmationEmail(user.email, {
          rideId: savedRide._id,
          pickupName: savedRide.pickupName,
          dropName: savedRide.dropName,
          date: savedRide.date,
          time: savedRide.time,
          carName: savedRide.carName,
          distanceKm: savedRide.distanceKm,
          finalFare: savedRide.finalFare,
        });

      } catch (err) {
        console.log("Email sending failed:", err);
      }
    })();
  } catch (err) {
    console.error("Error stack:", err.stack);
    res.json({
      success: false,
      message: "Payment verification failed",
      error: err.message
    });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ status: "failed" });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log("🔔 Webhook event received:", event);
    /* ====================================================== */
    /*                  PAYMENT AUTHORIZED                    */
    /* ====================================================== */
    if (event === "payment.authorized") {
      const paymentEntity = payload.payment.entity;
      const paymentId = paymentEntity.id;
      const orderId = paymentEntity.order_id;
      const paymentLinkId = paymentEntity.payment_link_id;

      let paymentRecord = null;

      if (orderId) {
        paymentRecord = await Payment.findOne({ razorpayOrderId: orderId });
      }

      if (!paymentRecord && paymentLinkId) {
        paymentRecord = await Payment.findOne({ razorpayPaymentLinkId: paymentLinkId });
      }

      if (paymentRecord) {
        paymentRecord.status = "authorized";
        paymentRecord.razorpayPaymentId = paymentId;
        await paymentRecord.save();
      } else {
        console.log("⚠️ Payment record not found for authorization:");
      }
    }

    /* ====================================================== */
    /*                  PAYMENT CAPTURED                      */
    /* ====================================================== */
    if (event === "payment.captured") {
      const paymentEntity = payload.payment.entity;
      const paymentId = paymentEntity.id;
      const orderId = paymentEntity.order_id;
      const paymentLinkId = paymentEntity.payment_link_id;
      const notes = paymentEntity.notes || {};

      let paymentRecord = null;

      if (orderId) {
        paymentRecord = await Payment.findOne({ razorpayOrderId: orderId });
      }

      if (!paymentRecord && paymentLinkId) {
        paymentRecord = await Payment.findOne({ razorpayPaymentLinkId: paymentLinkId });
      }

      if (!paymentRecord && paymentId) {
        paymentRecord = await Payment.findOne({ razorpayPaymentId: paymentId });
      }

      if (!paymentRecord && notes.type === "corporate" && notes.corporateRideId) {
        paymentRecord = await Payment.findOne({
          referenceId: notes.corporateRideId,
          referenceType: "CorporateRide",
          status: { $in: ["pending", "authorized"] }
        }).sort({ createdAt: -1 });
      }

      if (!paymentRecord && (notes.purpose === "extra_charge" || notes.type === "extra_charge") && notes.rideId) {
        const referenceType = notes.rideModel === "corporate" ? "CorporateRide" : "Ride";

        paymentRecord = await Payment.findOne({
          referenceId: notes.rideId,
          referenceType: referenceType,
          paymentType: "extra_charge",
          status: { $in: ["pending", "authorized"] }
        }).sort({ createdAt: -1 });
      }

      if (paymentRecord) {
        paymentRecord.status = "captured";
        paymentRecord.razorpayPaymentId = paymentId;

        if (orderId && !paymentRecord.razorpayOrderId) {
          paymentRecord.razorpayOrderId = orderId;
        }

        if (paymentLinkId && !paymentRecord.razorpayPaymentLinkId) {
          paymentRecord.razorpayPaymentLinkId = paymentLinkId;
        }

        await paymentRecord.save();
      } else {
        console.log("⚠️Payment record NOT FOUND !");
      }

      if (notes.type === "corporate" && notes.corporateRideId) {
        const corporateRide = await CorporateRide.findByIdAndUpdate(
          notes.corporateRideId,
          {
            status: "paid",
            paymentStatus: "paid",
            razorpayPaymentId: paymentId
          },
          { new: true }
        );
      }

      if (notes.purpose === "extra_charge" || notes.type === "extra_charge") {
        const rideId = notes.rideId;
        const rideModel = notes.rideModel;

        if (rideId && rideModel) {
          const RideModel = rideModel === "corporate" ? CorporateRide : Ride;

          const updatedRide = await RideModel.findByIdAndUpdate(
            rideId,
            {
              extraChargeStatus: "paid",
              extraChargeRazorpayPaymentId: paymentId
            },
            { new: true }
          );

          if (updatedRide) {
            console.log("✅ Extra charge marked PAID for ride:", rideId);
          } else {
            console.log("❌ Ride not found with ID:", rideId);
          }
        }
      }
    }

    /* ====================================================== */
    /*                  PAYMENT FAILED                        */
    /* ====================================================== */
    if (event === "payment.failed") {
      const paymentEntity = payload.payment.entity;
      const paymentId = paymentEntity.id;
      const orderId = paymentEntity.order_id;
      const paymentLinkId = paymentEntity.payment_link_id;

      console.log("❌ Payment failed event");

      let paymentRecord = null;

      if (orderId) {
        paymentRecord = await Payment.findOne({ razorpayOrderId: orderId });
      }

      if (!paymentRecord && paymentLinkId) {
        paymentRecord = await Payment.findOne({ razorpayPaymentLinkId: paymentLinkId });
      }

      if (!paymentRecord && paymentId) {
        paymentRecord = await Payment.findOne({ razorpayPaymentId: paymentId });
      }

      if (paymentRecord) {
        paymentRecord.status = "failed";
        paymentRecord.razorpayPaymentId = paymentId;
        await paymentRecord.save();
      } else {
        console.log("⚠️ Payment record not found ");
      }
    }

    /* ====================================================== */
    /*                  REFUND CREATED                        */
    /* ====================================================== */
    if (event === "refund.created") {
      const refund = payload.refund.entity;
      const paymentId = refund.payment_id;
      const refundId = refund.id;
      const refundAmount = refund.amount / 100;

      const paymentRecord = await Payment.findOneAndUpdate(
        {
          razorpayPaymentId: paymentId,
          refundStatus: { $in: ['none', null] }
        },
        {
          $set: {
            refundId: refundId,
            refundStatus: "pending",
            refundAmount: refundAmount
          }
        },
        { new: true }
      );

      if (!paymentRecord) {
        return res.json({ status: "ok" });
      }

      if (paymentRecord.referenceId && paymentRecord.referenceType) {
        const RideModel = paymentRecord.referenceType === "Ride" ? Ride : CorporateRide;

        const ride = await RideModel.findOneAndUpdate(
          {
            _id: paymentRecord.referenceId,
            refundStatus: { $in: ['none', 'pending_approval', 'rejected', null] }
          },
          {
            $set: {
              refundStatus: "pending",
              refundAmount: refundAmount
            }
          },
          { new: true }
        );
      } else {
        console.log("⚠️ No referenceId or referenceType in payment record");
      }
    }

    /* ====================================================== */
    /*                  REFUND PROCESSED                      */
    /* ====================================================== */
    if (event === "refund.processed") {
      const refund = payload.refund.entity;
      const paymentId = refund.payment_id;
      const refundId = refund.id;
      const refundAmount = refund.amount / 100;

      const paymentRecord = await Payment.findOneAndUpdate(
        { razorpayPaymentId: paymentId },
        {
          $set: {
            refundId: refundId,
            refundStatus: "processed",
            refundAmount: refundAmount
          }
        },
        { new: true }
      );

      if (!paymentRecord) {
        return res.json({ status: "ok" });
      }

      if (paymentRecord.referenceId && paymentRecord.referenceType) {
        const RideModel = paymentRecord.referenceType === "Ride" ? Ride : CorporateRide;

        const ride = await RideModel.findByIdAndUpdate(
          paymentRecord.referenceId,
          {
            $set: {
              refundStatus: "processed",
              refundAmount: refundAmount
            }
          },
          { new: true }
        );

      } else {
        console.log("⚠️ No referenceId or referenceType in payment record");
      }
    }

    return res.json({ status: "ok" });
  } catch (err) {
    console.error("webhook error:", err.stack);
    res.status(500).json({ status: "error", message: err.message });
  }
};