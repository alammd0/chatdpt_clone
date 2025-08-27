import express from "express";
import prisma from "../db.js";
import { main } from "../chat.js";

const chatRouter = express.Router();

chatRouter.post("/chat", async (req, res) => {
  try {
    const userId = req.userId;
    const { message, conversationId } = req.body

    if(!message || !userId){
        return res.status(400).json({
            message: "Bad Request, Message or UserId is missing",
        });
    }

    // check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(400).json({
        message: "User does not exist",
      });
    };


    let conversation ; 
    if(!conversationId){
        conversation = await prisma.conversationalMessage.create({
            data : {
                text : message,
                userId : userId
            }
        });

        conversationId = conversation.id;
    } else {
        conversation = await prisma.conversationalMessage.findUnique({
            where : {
                id : conversationId
            }
        });

        if(!conversation){
            return res.status(400).json({
                message: "Conversation does not exist"
            });
        }

        if(conversation.userId !== userId){
            return res.status(400).json({
                message: "Conversation does not exist"
            });
        }
    }

    // also user message  
    const userMessage = await prisma.message.create({
        data : {
            text : message,
            sender : "user",
            conversationId : conversationId,
            userId : userId
        }
    })

    const result = await main(message, conversationId);


    // also save assistant message
    const assistantMessage = await prisma.message.create({
        data : {
            text : result,
            sender : "assistant",
            conversationId : conversationId,
            userId : userId
        }
    })

    return res.status(200).json({
      message : "Chat completed successfully",
      message : assistantMessage
    });

  } catch (error) {
    console.error("Error in /api/v1/chat:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default chatRouter;