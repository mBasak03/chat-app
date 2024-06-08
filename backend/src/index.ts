import express from "express"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import cookieParser from 'cookie-parser';

import dotenv from "dotenv";
import { env } from "process";
import { app, server } from "./socket/socket.js";
dotenv.config();


app.get("/", (req, res)=>{
    res.send("Welcome from serverhbhb")
})
app.use(express.json())
app.use(cookieParser());
app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)
server.listen(process.env.PORT, ()=>{
    console.log("App is running at "+process.env.PORT+".....")
})