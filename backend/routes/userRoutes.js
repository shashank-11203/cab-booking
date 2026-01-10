import express from "express";
import {
  getAllUsers,
  createUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getAllUsers);
router.post("/", protect, adminOnly, createUser);
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;