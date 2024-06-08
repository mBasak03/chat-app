import z from "zod";
import prisma from "../db/prisma.js";
import bcryptjs from "bcryptjs";
import generateToken from "../utils/generateToken.js";
// creating sign-up functionality------------------------
const Gender = z.enum(["male", "female"]);
const signUpSchema = z.object({
    fullName: z.string().min(3, "Full name must be minimum of three letters"),
    username: z.string().min(3, "Username must be minimumm of three letters"),
    confirmPassword: z.string().min(3, "Username must be minimumm of three letters"),
    password: z.string().min(6, "Passwword must be minimum of 6 letters"),
    gender: Gender
});
export const signup = async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;
        const validation = signUpSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: validation.error.errors
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: "Passwords don't match"
            });
        }
        const user = await prisma.user.findUnique({ where: { username } });
        if (user)
            return res.status(400).json({
                success: false,
                error: "Username already taken"
            });
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        const genderRef = gender === "male" ? "boy" : "girl";
        const profilePic = `https://avatar.iran.liara.run/public/${genderRef}?username=${username}`;
        const newUser = await prisma.user.create({
            data: {
                fullName: validation.data.fullName,
                username: validation.data.username,
                password: hashedPassword,
                gender: validation.data.gender,
                profilePic: profilePic
            }
        });
        if (newUser) {
            // generate token
            generateToken(newUser.id, res);
            res.status(201).json({
                succcess: true,
                id: newUser.id,
                fullName: newUser.fullName,
                username: newUser.username,
                profilePic: newUser.profilePic
            });
        }
        else {
            return res.status(400).json({
                success: false,
                error: "Invalid user data"
            });
        }
    }
    catch (error) {
        console.log("Error while signing up: ", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};
// creating signin funcitonality---------------------------
const loginSchema = z.object({
    username: z.string(),
    password: z.string()
});
export const login = async (req, res) => {
    try {
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: validation.error.errors
            });
        }
        const user = await prisma.user.findUnique({
            where: { username: validation.data.username }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }
        const isPasswordCorrrect = await bcryptjs.compare(validation.data.password, user?.password);
        if (!user || !isPasswordCorrrect) {
            return res.status(400).json({
                success: false,
                error: "Incorrect username or password"
            });
        }
        generateToken(user.id, res);
        user ? user.password = "" : "";
        return res.status(200).json({
            success: false,
            id: user.id,
            fullname: user.fullName,
            username: user.username,
            profilePic: user.profilePic
        });
    }
    catch (error) {
        console.error("Error while Sign-in: ", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};
// logout controller-----------------------------------------------
export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        return res.status(200).json({
            success: true,
            message: "User logout successfully"
        });
    }
    catch (error) {
        console.error("Error while logging out: ", error.message);
        return res.status(500).json({
            success: false,
            error: "internal Server error"
        });
    }
};
// authorization end point-----------------------------------
export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (user) {
            return res.status(200).json({
                success: true,
                message: "User is already logged in",
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                profilePic: user.profilePic
            });
        }
        return res.status(400).json({
            success: false,
            error: "User not found"
        });
    }
    catch (error) {
        console.error("GetMe controller error: ", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};
