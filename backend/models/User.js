import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
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
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);