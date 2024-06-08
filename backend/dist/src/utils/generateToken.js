import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "15d"
    });
    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true, //prevent XXs cross site scripting
        sameSite: "strict", // CSRF attack cross-site request forgrey
        secure: process.env.NODE_ENV !== "development" //HTTPS
    });
    return token;
};
export default generateToken;
