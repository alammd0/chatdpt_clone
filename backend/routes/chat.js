import express from "express";
import prisma from "../db.js";

const chatRouter = express.Router();

chatRouter.post("/chat", async (req, res) => {
  try {
    const userId = req.userId;
    console.log(userId);
    const { message, conversationId } = req.body;

    if (!message || !conversationId) {
      return res.status(400).json({
        message: "Invalid request: message or conversationId is missing",
      });
    }

    // Check if any messages exist for this conversationId
    const conversation = await prisma.message.findMany({
      where: { conversationalMessageId: conversationId },
      orderBy: { createdAt: "asc" },
      take: 1,
    });

    if (conversation.length === 0) {
      await prisma.message.create({
        data: {
          text: "Conversation started",
          sender: "system",
          conversationalMessageId: conversationId,
        },
      });
    }

    await prisma.message.create({
      data: {
        text: message,
        sender: "user",
        conversationalMessageId: conversationId,
      },
    });

    // Call the chat logic which will read history and generate reply
    const result = await main(message, conversationId);

    // Save assistant response
    await prisma.message.create({
      data: {
        text: result,
        sender: "assistant",
        conversationalMessageId: conversationId,
      },
    });

    console.log("Assistant reply:", result);

    return res.status(200).json({
      message: result,
    });
  } catch (error) {
    console.error("Error in /api/v1/chat:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default chatRouter;
