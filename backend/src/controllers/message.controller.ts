import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { getRecieverSocketId, io } from "../socket/socket.js";

// send a message to other user

export const sendMessage= async(req: Request, res: Response)=>{
    try {
        const {message}= req.body;
        const {id: receiverId} = req.params;
        const senderId= req.user.id;

        

        // check they have any chat before
        let conversation= await prisma.conversation.findFirst({
            where: {
                participantIds: {
                    hasEvery: [senderId, receiverId]
                }
            }
        })

        // sender is sending message to reciever for the first time, create a new conversation
        if(!conversation){
            conversation= await prisma.conversation.create({
                data: {
                    participantIds: {
                        set: [senderId, receiverId]
                    }
                }
            })
        }

        // create a new message

        const newMessage= await prisma.message.create({
            data: {
                senderId: senderId,
                body: message,
                conversationId: conversation.id
            }
        })

        // update the conversation with the new message

        if(newMessage){
            conversation= await prisma.conversation.update({
                where: {
                    id: conversation.id
                },
                data: {
                    messages: {
                        connect: {
                            id: newMessage.id,
                        }
                    }
                }
            })
        }

        // socket io
        const recieverSocketId= getRecieverSocketId(receiverId)
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage", newMessage)
        }

        return res.status(201).json({
            success: true,
            newMessage
        })

    } catch (error: any) {
        console.error("Error to send message: ", error.message);
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}


// get all messages---------------------------------
export const getMessages= async(req: Request, res: Response)=>{
    try{
        const {id: userToChatId}= req.params;
        const senderId= req.user.id;

        const conversation= await prisma.conversation.findFirst({
            where: {
                participantIds: {
                    hasEvery: [senderId, userToChatId]
                }
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            }
        })

        if(!conversation){
            return res.status(200).json([]);
        }

        return res.status(200).json(conversation.messages)

    }catch(error:any){
        console.error("Error while fetching messages: ", error.message);

        return res.status(500).json({
            success: false,
            error: "Internal Server error"
        })
    }
}


// fetching usernames with whom client can chat for sidebar on FE----------


export const getUsersForSidebar= async(req: Request, res: Response)=>{
    try{
        const authUserId= req.user.id;

        const users= await prisma.user.findMany({
            where: {
                id: {
                    not: authUserId
                }
            },
            select: {
                id: true,
                fullName: true,
                profilePic: true
            }
        })

        return res.status(200).json(
            users
        )

    }catch(error: any){
        console.error("Error while fetching other users for chat: ", error.message);

        return res.status(500).json({
            success: false,
            error: "Internal Server error"
        })
    }
}
