import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import session from "express-session";
import MongoStore from 'connect-mongo';

import connectDB from "./config/db.js";
import { sanitizeRequest } from "./middlewares/sanitizeMiddleware.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import distanceRoutes from "./routes/distanceRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import corporateRoutes from "./routes/corporateRoutes.js";
import adminCarRoutes from "./routes/adminCarRoutes.js";
import adminRideRoutes from "./routes/adminRideRoutes.js";
import adminCorporateRoutes from "./routes/adminCorporateRoutes.js";
import cloudinaryRoutes from "./routes/cloudinaryRoutes.js";
import carPublicRoutes from "./routes/carPublicRoutes.js";
import corporateRideRoutes from "./routes/corporateRideRoutes.js";
import adminCouponRoutes from "./routes/adminCouponRoutes.js";
import mongoose from "mongoose";

const app = express();
await mongoose.connect(process.env.MONGO_URI);
console.log('MongoDB Connected');

app.set('trust proxy', 1);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    env: process.env.NODE_ENV
  });
});

// Security & Performance
app.use(helmet());
app.use(compression());

// CORS
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : ['http://localhost:5173'],
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      ttl: 5 * 60,
      touchAfter: 24 * 3600,
      crypto: {
        secret: process.env.SESSION_SECRET
      }
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 5 * 60 * 1000
    }
  })
);

// Sanitization
app.use(sanitizeRequest);

// Rate limiting (skip health checks)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 350,
    skip: (req) => req.path === '/health',
  })
);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/location", locationRoutes);
app.use("/api/v1/distance", distanceRoutes);
app.use("/api/v1/rides", rideRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/corporate", corporateRoutes);
app.use("/api/v1/admin", adminCarRoutes);
app.use("/api/v1/admin/rides", adminRideRoutes);
app.use("/api/v1/admin/corporate", adminCorporateRoutes);
app.use("/api/v1/cloudinary", cloudinaryRoutes);
app.use("/api/v1/cars", carPublicRoutes);
app.use("/api/v1/corporate", corporateRideRoutes);
app.use("/api/v1/admin/coupons", adminCouponRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});

// ✅ Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});