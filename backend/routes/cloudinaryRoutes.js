import express from "express";
import cloudinary from "../utils/cloudinary.js";

const router = express.Router();

router.get("/signature", async (req, res) => {
    const timestamp = Math.round((new Date).getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder: "cab_cars" },
        process.env.CLOUDINARY_API_SECRET
    );

    res.json({
        timestamp,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: "cab_cars"
    });
});

export default router;
