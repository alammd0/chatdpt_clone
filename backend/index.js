// index.js (or main server file)
import express from 'express';
import cors from 'cors';
import { main } from './chat.js';
import prisma from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// chat 
// app.post("/api/v1/chat", async (req, res) => {
//   try {
//     const { message, conversationId } = req.body;

//     if (!message || !conversationId) {
//       return res.status(400).json({
//         message: "Invalid request: message or conversationId is missing"
//       });
//     }

//     // Check if any messages exist for this conversationId
//     const conversation = await prisma.message.findMany({
//       where: { conversationalMessageId: conversationId },
//       orderBy: { createdAt: "asc" },
//       take: 1
//     });

//     // If no conversation exists, create an initial system marker message
//     // (prevents rejecting clients that want to start a new conversation)
//     if (conversation.length === 0) {
//       await prisma.message.create({
//         data: {
//           text: "Conversation started",
//           sender: "system",
//           conversationalMessageId: conversationId
//         }
//       });
//     }

//     // Save user's message to DB (we keep message saving in the endpoint)
//     // so 'main' doesn't duplicate the save.
//     await prisma.message.create({
//       data: {
//         text: message,
//         sender: "user",
//         conversationalMessageId: conversationId
//       }
//     });

//     // Call the chat logic which will read history and generate reply
//     const result = await main(message, conversationId);

//     // Save assistant response
//     await prisma.message.create({
//       data: {
//         text: result,
//         sender: "assistant",
//         conversationalMessageId: conversationId
//       }
//     });

//     console.log("Assistant reply:", result);

//     return res.status(200).json({
//       message: result
//     });
//   } catch (error) {
//     console.error("Error in /api/v1/chat:", error);
//     return res.status(500).json({
//       message: "Internal Server Error"
//     });
//   }
// });

app.post("/api/v1/chat", async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    if (!message || !conversationId) {
      return res.status(400).json({ message: "message, conversationId and userId are required" });
    }

    // create message and ensure conversation exists
    await prisma.message.create({
      data: {
        text: message,
        sender: "user",
        // user: { connect: { id: userId } },
        conversationalMessage: {
          connectOrCreate: {
            where: { id: conversationId },
            create: { id: conversationId, text: "Conversation started" }
          }
        }
      }
    });

    const result = await main(message, conversationId);

    console.log("Assistant reply:", result);

    await prisma.message.create({
      data: {
        text: result,
        sender: "assistant",
        // user: { connect: { id: userId } },
        conversationalMessage: { connect: { id: conversationId } }
      }
    });

    return res.status(200).json({ message: result });

  } catch (error) {
    console.error("Error in /api/v1/chat:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
