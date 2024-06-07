import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"
import prisma from "../db/prisma.js";
dotenv.config();

interface DecodedToken extends JwtPayload{
    userId: string
}

// resolving the req.user problem as by default there is nor user in req exists

declare global{
    namespace Express{
        export interface Request{
            user: {
                id: string
            }
        }
    }
}
const protectRoute= async(req:Request, res:Response, next:NextFunction)=>{
    try{
        
        const token= req.cookies.jwt;
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided"
            })
        }

        const decoded= jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

        if(!decoded){
            return res.status(401).json({
                success: false,
                error: "Unauthorized: Invalid token"
            })
        }

        const user= await prisma.user.findUnique({
            where: {id: decoded.userId},
            select: {
                id: true,
                username: true,
                fullName: true,
                profilePic: true
            }
        })
        if(!user){
            return res.status(404).json({
                success: false,
                error: "User not found"
            })
        }

        req.user= user;
        next();
    }catch(error:any){
        console.error("Error in protected route for user: ", error.message)
        return res.status(500).json({
            success: false,
            error: "Internal Server error"
        })
    }

}

export default protectRoute;