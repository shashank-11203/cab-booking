import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    carId: {
      type: Number,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["sedan", "suv", "hatchback"],
      required: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },

    seats: Number,

    images: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    pricing: {
      localPrice: {
        type: Number,
        required: true,
      },

      outstationPrice: {
        type: Number,
        required: true,
      },

      oneWayPrice: {
        type: Number,
        required: true,
      },

      airportPrice: {
        type: Number,
      },
    },

    isReturning: {
      type: Boolean,
      default: false,
    },

    expectedReturnTime: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Car", carSchema);