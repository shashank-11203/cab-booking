import User from "../models/User.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-optMeta");
    res.status(200).json({
        success: true,
        count: users.length,
        users
    });
});

export const createUser = asyncHandler(async (req, res) => {
    const { name, phone, address, state, role } = req.body;

    if(!phone) {
     return res.status(400).json({
        success:false,
        message: "Phone number is required"
     });   
    }

    const existingUser = await User.findOne({phone});
    if(existingUser) {
        return res.status(400).json({
            success:false,
            message: "User with this phone number already exists"
        });
    }

    const user = await User.create({
        name,phone,address,state,role
    });
    res.status(201).json({
        success: true,
        message: "User created successfully",
        user
    });
})

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});