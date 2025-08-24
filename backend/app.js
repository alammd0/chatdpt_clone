// import readline from 'node:readline/promises';
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    const completions = await groq.chat.completions.create({
        model : "llama-3.3-70b-versatile",
        temperature : 0,
        messages :[
            {
                role : 'system',
                content : `Your are the personal assistant who answer the asked question.
                You have used the following tools: 
                1. webSearch({ query }):{query : string} //Search the latest information and realtime data on the internet. Be sure that information is up-to-date and accurate.`
            },
            {
                role : 'user',
                content : 'when was the lunch Iphone 16?'
            }
        ],
        tools: [
            {
            type : "function",
            function: {
                name : "webSearch",
                description : "Search the latest information and realtime data on the internet. Be sure that information is up-to-date and accurate.",
                parameters : {
                    type: "object",
                    properties : {
                        query : {
                            type : "string",
                            description: "the search query to perform search on the internet"
                        }
                    },
                },
                required : ["query"]
            }
            }
        ],
        tool_choice : "auto"
    });

    const toolCalls = completions.choices[0].message.tool_calls;

    if (!toolCalls){
        console.log(`Assistant: ${completions.choices[0].message.content}`);
        return
    }

    for (const toolCall of toolCalls) {
        // console.log(toolCall);
        const functionName = toolCall.function.name;
        const parameters = toolCall.function.arguments;

        if (functionName === "webSearch") {
            const result = await webSearch(JSON.stringify(parameters));
            console.log(result);
        }
    }

    // console.log(JSON.stringify(completions.choices[0].message, null, 2));
}

main();

async function webSearch({ query }) {
    return "Hello world!"
}