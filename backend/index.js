// index.js (or main server file)
import express from 'express';
import cors from 'cors';
import { main } from './chat.js';
import prisma from './db.js';
import userRouter from './routes/auth.js';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/chat", chatRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
