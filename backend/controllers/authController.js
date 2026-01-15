import { asyncHandler } from "../middlewares/asyncHandler.js";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendEmailOtp } from "../utils/emailOtpService.js";
import { emailHasMX } from "../utils/validateEmailMX.js";

export const sendEmailOtpController = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, message: "Invalid email" });
  }

  const isValidDomain = await emailHasMX(email);
  if (!isValidDomain) {
    return res.status(400).json({
      success: false,
      message: "Email domain cannot receive messages",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    user = await User.create({
      email: email.toLowerCase(),
      otp: otp,
      otpExpiry: otpExpiry,
      isVerified: false,
      role: "user",
      unverifiedCreatedAt: new Date(),
    });

  } else {
    user.otp = otp;
    user.otpExpiry = otpExpiry;

    if (!user.isVerified) {
      user.unverifiedCreatedAt = new Date(); 
    }

    await user.save();
  }

  await sendEmailOtp(email, otp);

  res.json({
    success: true,
    message: "OTP sent to email",
  });
});

export const verifyEmailOtpController = asyncHandler(async (req, res) => {
  const { email, otp, role = "user" } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }


  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !user.otp) {
    return res.status(400).json({
      success: false,
      message: "OTP expired or not found"
    });
  }

  if (user.isOtpExpired()) {
    await user.clearOtp();
    return res.status(400).json({
      success: false,
      message: "OTP has expired. Please request a new one."
    });
  }

  if (user.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP"
    });
  }

  user.isVerified = true;

  if (!user.role || user.role === "user") {
    user.role = role;
  }

  user.unverifiedCreatedAt = null;
  await user.clearOtp();

  const token = generateToken(user._id);

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    user: {
      id: user._id,
      role: user.role,
      email: user.email,
      phone: user.phone || "",
      name: user.name || "",
      address: user.address || "",
      state: user.state || "",
      pincode: user.pincode || "",
    },
  });
});

export const updateProfileController = asyncHandler(async (req, res) => {
  try {
    const { name, phone, address, state, pincode } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, state, pincode },
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists. Please use another.",
      });
    }

    console.log("Update Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

export const getMeController = asyncHandler(async (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      phone: user.phone,
      name: user.name || "",
      email: user.email || "",
      pincode: user.pincode || "",
      state: user.state || "",
      address: user.address || "",
      role: user.role || ""
    }
  });
});

export const logoutController = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(0),
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});