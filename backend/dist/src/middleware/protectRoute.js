import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../db/prisma.js";
dotenv.config();
const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided"
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized: Invalid token"
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                fullName: true,
                profilePic: true
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Error in protected route for user: ", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server error"
        });
    }
};
export default protectRoute;
