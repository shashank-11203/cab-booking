import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
    return jwt.sign({ id: userId._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
}