// import readline from 'node:readline/promises';
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function main(userMessage) {
  // const rl = readline.createInterface({input: process.stdin, output: process.stdout});

  const message = [
    {
      role: "system",
      content: `You are a smart personal assistant.
                        If you know the answer to a question, answer it directly in plain English.
                        If the answer requires real-time, local, or up-to-date information, or if you don’t know the answer, use the available tools to find it.
                        You have access to the following tool:
                        webSearch(query: string): Use this to search the internet for current or unknown information.
                        Decide when to use your own knowledge and when to use the tool.
                        Do not mention the tool unless needed.

                        Examples:
                        Q: What is the capital of France?
                        A: The capital of France is Paris.

                        Q: What's the weather in Mumbai right now?
                        A: (use the search tool to find the latest weather)

                        Q: Who is the Prime Minister of India?
                        A: The current Prime Minister of India is Narendra Modi.

                        Q: Tell me the latest IT news.
                        A: (use the search tool to get the latest news)

                        current date and time: ${new Date().toUTCString()}`,
    },
  ];

  message.push({
    role: "user",
    content: userMessage,
  });

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

    message.push(completions.choices[0].message);

    const toolCalls = completions.choices[0].message.tool_calls;

    if (!toolCalls) {
      // console.log(`Assistant: ${completions.choices[0].message.content}`);
      return completions.choices[0].message.content;
      break;
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
  const finalResult = result.results
    .map((result) => result.content)
    .join("\n\n");
  return finalResult;
}
