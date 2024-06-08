
import { Server } from "socket.io";
import http from "http"
import express from "express"


// create a http/ socket server

// 1. create a express instance
const app= express();
// 2. create a http server of the express instance using http instance
const server= http.createServer(app)
// 3. initiate websocket to this http server
const io= new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"]
    }
});



// doing socket functionality

const userSocketMap:{[key: string]: string}={}

// get recievers Id

export const getRecieverSocketId= (recieverId: string)=>{
    return userSocketMap[recieverId];
}
io.on("connection", (socket)=>{
    // when a new client is connected, save the client's id to userSocketMap as socket.Id
    const userId= socket.handshake.query.userId as string;
    if(userId){
        userSocketMap[userId]= socket.id
    }

    // broadcasting sockerId's of all online clients to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    // when one client is disconnected, we want to notify other clients that the client is disconnected and storing rest of online users socket.id
    socket.on("disconnect", ()=>{
        console.log("User disconnected: ", socket.id)
        delete userSocketMap[userId]

        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })

})


export {app, io, server}

