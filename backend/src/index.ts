import express from "express"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import cookieParser from 'cookie-parser';

import dotenv from "dotenv";
dotenv.config();
const app= express();

app.get("/", (req, res)=>{
    res.send("Welcome from serverhbhb")
})
app.use(express.json())
app.use(cookieParser());
app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)
app.listen(5000, ()=>{
    console.log("App is running at 5000.....")
})