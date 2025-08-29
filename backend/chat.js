import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";
import prisma from "./db.js";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function main(userMessage, conversationId = null , userId = null) {

  const systemPrompt = [
    {
      role: "system",
      content: `You are a smart personal assistant.
        - If you know the answer from your knowledge, answer it directly in clear, plain English. 
        - If the question requires real-time, local, or up-to-date information, or if you are unsure, use the available tools to find it. 
        - You have access to the following tool: webSearch(query: string): Use this to search the internet for current or unknown information. 
        - Decide when to use your own knowledge and when to use the tool. Do not mention the tool explicitly in your final answer. 
        
        Formatting rules: 
        - If the answer is code → format it inside Markdown code blocks with the correct language (e.g., \\\js ... \\\). 
        - If the answer is a comparison or structured info → format as a Markdown table. 
        - If the answer is a list of items or steps → use bullet points (-). 
        - If the answer is explanatory text → write in clear paragraphs (2-4 sentences max). 
        
        Tone & Style: 
        - Be professional yet approachable (like a helpful colleague). 
        - Use simple terms first, then add deeper technical details if needed. 
        - For code, always include comments and keep it neat. 
        - For lists or guides, make them easy to scan (bullets/steps). 
        - Stay concise — don't overload the user with unnecessary text. 
        
        Examples: 
          Q: What is the capital of France? 
          A: The capital of France is Paris.

          Q: What's the weather in Mumbai right now?
          A: (use the search tool internally and then give the latest weather) 

          Q: Who is the Prime Minister of India?
          A: The current Prime Minister of India is Narendra Modi. 

          Q: Tell me the latest IT news. 
          A: (use the search tool internally, then summarize the news in 3-4 bullet points) 

          Q: Write a JavaScript function to reverse a string. 
          A: \\\js 
             // Function to reverse a string in JavaScript
             function reverseString(str) {
               return str.split("").reverse().join(""); 
             } 
             \\\

          Q: Give me a table comparing HTML, CSS, and JavaScript. 
          A: | Language   | Purpose                        |
             |------------|--------------------------------|
             | HTML       | Structure of the webpage       |
             | CSS        | Styling and layout             |
             | JavaScript | Interactivity and logic        |
          
        Current date and time: ${new Date().toUTCString()}
      `,
    },
  ];

  // Load previous messages from the database
  let formattedPreviousMessages = [];
  if (conversationId){
     try {
      const previousMessages = await prisma.message.findMany({
        where : {
          conversationalMessageId : conversationId
        },
        orderBy : {
          createdAt : "asc"
        }
      });

      formattedPreviousMessages = previousMessages.map( (m) => {
        const role = m.sender === "user" ? "user" : m.sender === "assistant" ? "assistant" : "system";
        
        return {role, content : m.text};
      });
     }
     catch(error){
       console.log("fail to load previous message...")
     }
  }

  const message = [systemPrompt, ...formattedPreviousMessages, {role : "user", content : userMessage}]

  //  const MAX_TOOL_ITERATIONS = 3;

  while (true) {
    const completions = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: message,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description:
              "Search the latest information and realtime data on the internet",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query to perform search on.",
                },
              },
            },
            required: ["query"],
          },
        },
      ],
      tool_choice: "auto",
    });

    // message.push(completions.choices[0].message);

    
    // const toolCalls = completions.choices[0].message.tool_calls;
    // if (!toolCalls) {
    //    const aiMessage = completions.choices[0].message.content;
    //    return aiMessage;
    // }

    const choiceMsg = completions.choices[0]?.message ; 
    if(!choiceMsg){
      return "Sorry — no response from model."
    }


    const toolCalls = choiceMsg.tool_calls;

    if(!toolCalls || toolCalls.length === 0){
       const AIMessage = choiceMsg.content || ""
      //  TODO : Check Points 
       if(conversationId && user){
        try{
          await prisma.message.create({
            data : {
              text : AIMessage,
              sender : "assistant",
              conversationalMessageId : conversationId,
              userId : user.id
            }
          })
        }
        catch(error){
          console.log("Failed to save Assistant message : ", error)
        }
       }
       return AIMessage;
    }


    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const parameters = JSON.parse(toolCall.function.arguments);

      if (functionName === "webSearch") {
        const result = await webSearch(parameters);

        message.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: result,
        });
      }
    }
  }
}

async function webSearch({ query }) {
  console.log("WebSearch called...");
  const result = await tvly.search(query);

  const finalResult = result.results.map((result) => result.content).join("\n\n");

  return finalResult;
}
