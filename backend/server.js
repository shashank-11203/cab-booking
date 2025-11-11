import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import { sanitizeRequest } from "./middlewares/sanitizeMiddleware.js";

dotenv.config();
const app = express();
connectDB();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(sanitizeRequest);

// basic rate limiter
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
    })
);

//routes
app.get("/health", (req, res) => res.json({
    status: "ok", time: new Date().toISOString()
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});