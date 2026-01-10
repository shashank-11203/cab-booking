import qs from "querystring";
import CorporateRequest from "../models/CorporateRequest.js";
import User from "../models/User.js";
import CorporateRide from "../models/CorporateRides.js"

export const sendCorporateWhatsapp = async (req, res) => {
  try {
    const { name, phone, message } = req.body;

    if (!name || !phone) {
      return res.json({ success: false, message: "Missing fields" });
    }

    const text = `
📌 *Corporate Inquiry*  
👤 Name: ${name}  
📞 Phone: ${phone}  
💬 Message: ${message || "N/A"}  
    `;

    const encoded = qs.escape(text);

    const url = `https://wa.me/${process.env.ADMIN_WHATSAPP}?text=${encoded}`;

    return res.json({ success: true, url });
  } catch (err) {
    console.log("WhatsApp Error:", err);
    res.json({ success: false, message: "Server error" });
  }
};

export const createCorporateRequest = async (req, res) => {
  try {
    const { companyName, travelRoute, message } = req.body;

    const existing = await CorporateRequest.findOne({
      user: req.user._id,
      status: "pending"
    });

    if (existing) {
      return res.json({ success: false, message: "Request already pending, contact admin" });
    }

    const newReq = await CorporateRequest.create({
      user: req.user._id,
      companyName,
      travelRoute,
      message
    });

    return res.status(200).json({ success: true, message: "Request Submitted", request: newReq });
  } catch (err) {
    console.error("Corporate request create error: ", err);
    return res.status(500).json({ success: false, message: "error while creating request, try again later" });
  }
}

export const getCorporateRequests = async (req, res) => {
  try {
    const requests = await CorporateRequest.find({}).populate("user", "name email phone");
    return res.status(200).json({ success: true, requests });
  }
  catch (err) {
    console.error("fetch corporate request error: ", err);
    return res.status(500).json({ success: false });
  }
}

export const updateCorporateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const action = req.path.includes("approve") ? "approve" : "reject";

    const request = await CorporateRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false });

    if (action == "approve") {
      request.status = "approved";
      await User.findByIdAndUpdate(request.user, { role: "corporate" });
    }
    else if (action == "reject") {
      request.status = "rejected";
    }

    await request.save();

    return res.status(200).json({ success: true, request });
  } catch (err) {
    console.error("update corporate request error: ", err);
    return res.status(500).json({ success: false, message: "error while update user" });
  }
}

export const getCorporateUsers = async (req, res) => {
  try {
    const corporates = await User.find({ role: "corporate" }).select("name email phone address");

    return res.status(200).json({ success: true, corporates })

  } catch (err) {
    console.log("fetching corporate users error:", err);
    return res.status(500).json({ success: true, message: "fetching corporate users error" });
  }
}

export const getMyCorporateRides = async (req, res) => {
  try {
    const rides = await CorporateRide.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, rides });
  } catch (err) {
    console.log("fetch my corporate ride error: ", err)
    res.status(500).json({ success: false });
  }
};

export const getLatestCorporateRide = async (req, res) => {
  try {
    const ride = await CorporateRide.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 }).lean();

    return res.json({ success: true, ride });
  } catch (err) {
    console.log("corporate ride fetch ", err)
    return res.status(500).json({ success: false });
  }
};
