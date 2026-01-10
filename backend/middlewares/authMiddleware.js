import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.token) {
      token = req.cookies.token;
    }
    else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userId).select("-__v");

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const corporateOnly = (req, res, next) => {
  if (req.user?.role !== "corporate") {
    return res.status(403).json({
      success: false,
      code: "NOT_CORPORATE",
    });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};