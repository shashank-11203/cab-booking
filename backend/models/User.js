import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      unique: true,
      sparse: true,
      match: [/^\+?[0-9]{10,15}$/, "Please provide a valid phone number"],
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "corporate", "admin"],
      default: "user",
    },
    pincode: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    unverifiedCreatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.index(
  { unverifiedCreatedAt: 1 },
  { 
    expireAfterSeconds: 86400,
    partialFilterExpression: { isVerified: false } 
  }
);
userSchema.methods.isOtpExpired = function() {
  if (!this.otpExpiry) return true;
  return Date.now() > this.otpExpiry;
};

userSchema.methods.clearOtp = function() {
  this.otp = null;
  this.otpExpiry = null;
  return this.save();
};

export default mongoose.model("User", userSchema);