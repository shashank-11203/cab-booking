import mongoose from "mongoose";

const corporateRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    companyName: {
      type: String,
      required: true
    },

    travelRoute: {
      type: String,
      default: ""
    },

    message: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    adminNote: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("CorporateRequest", corporateRequestSchema);