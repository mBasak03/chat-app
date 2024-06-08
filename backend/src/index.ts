import express from "express"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import cookieParser from 'cookie-parser';

import dotenv from "dotenv";
import { env } from "process";
dotenv.config();
const app= express();

app.get("/", (req, res)=>{
    res.send("Welcome from serverhbhb")
})
app.use(express.json())
app.use(cookieParser());
app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)
app.listen(process.env.PORT, ()=>{
    console.log("App is running at "+process.env.PORT+".....")
})