
import Payment from "../models/Payment.js";
import Ride from "../models/Ride.js";
import CorporateRide from "../models/CorporateRides.js";

export async function createPaymentRecord({
    userId,
    referenceType, 
    referenceId,
    paymentType, 
    amount,
    rawAmount,
    razorpayOrderId = null,
    razorpayPaymentLinkId = null,
    rideData,
    metadata = {},
    parentPaymentId = null
}) {
    
    const rideDetails = {
        pickupName: rideData.pickupName,
        pickupLat: rideData.pickupLat,
        pickupLon: rideData.pickupLon,
        dropName: rideData.dropName,
        dropLat: rideData.dropLat,
        dropLon: rideData.dropLon,
        distanceKm: rideData.distanceKm,
        durationMinutes: rideData.durationMinutes,
        rideType: rideData.rideType,
        date: rideData.date,
        time: rideData.time,
        carName: rideData.carName || rideData.assignedCarName,
        carId: rideData.carId || rideData.assignedCarId,
        passengers: rideData.passengers,
        fare: rideData.fare || rideData.expectedFare,
        finalFare: rideData.finalFare,
        extraChargeAmount: rideData.extraChargeAmount,
        extraChargeReason: rideData.extraChargeReason,
        coupon: rideData.coupon,
        snapshotAt: new Date()
    };

    const payment = new Payment({
        userId,
        rideId: referenceType === "Ride" ? referenceId : null,
        referenceType,
        referenceId,
        paymentType,
        amount,
        rawAmount,
        razorpayOrderId,
        razorpayPaymentLinkId,
        rideDetails,
        metadata,
        parentPaymentId,
        status: "pending"
    });

    await payment.save();
    return payment;
}

export async function updatePaymentStatus({
    razorpayOrderId = null,
    razorpayPaymentId = null,
    razorpayPaymentLinkId = null,
    razorpaySignature = null,
    status
}) {
    const query = razorpayOrderId 
        ? { razorpayOrderId }
        : razorpayPaymentLinkId 
            ? { razorpayPaymentLinkId }
            : { razorpayPaymentId };

    const updateData = { status };
    
    if (razorpayPaymentId) updateData.razorpayPaymentId = razorpayPaymentId;
    if (razorpaySignature) updateData.razorpaySignature = razorpaySignature;

    const payment = await Payment.findOneAndUpdate(
        query,
        updateData,
        { new: true }
    );

    return payment;
}

export async function getRidePayments(referenceType, referenceId) {
    return await Payment.find({
        referenceType,
        referenceId
    }).sort({ createdAt: 1 });
}

export async function getPaymentByRazorpayId(razorpayOrderId = null, razorpayPaymentLinkId = null) {
    const query = razorpayOrderId 
        ? { razorpayOrderId }
        : { razorpayPaymentLinkId };
    
    return await Payment.findOne(query);
}