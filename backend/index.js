import express from 'express';
import cors from 'cors';
import { main } from './chat.js';

const app = express();

const PORT = 5000;


app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


// chat 
app.post("/api/v1/chat", async (req, res) => {
    try{
        const { message } = req.body;

        if(!message){
            return res.status(400).json({
                message: "Message is required"
            })
        };

        console.log(message);

        const result = await main(message);

        return res.status(200).json({
            message: result
        });
    }
    catch(error){
        console.log(error);
    }
})

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});