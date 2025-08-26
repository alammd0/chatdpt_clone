// chat.js
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";
import prisma from "./db.js";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function main(userMessage, conversationId) {
  // load existing history from db (including the most recent user message saved by the endpoint)
  const previousMessages = await prisma.message.findMany({
    where: { conversationalMessageId: conversationId },
    orderBy: { createdAt: "asc" }
  });

  // map DB senders to chat roles; handle 'system' or unknown senders
  const formattedPreviousMessages = previousMessages.map((message) => {
    let role = "system";
    if (message.sender === "user") role = "user";
    else if (message.sender === "assistant") role = "assistant";
    return {
      role,
      content: message.text
    };
  });

  const systemPrompt = [
    {
      role: "system",
      content: `You are a smart personal assistant.
        - If you know the answer from your knowledge, answer it directly in clear, plain English.
        - If the question requires real-time, local, or up-to-date information, or if you are unsure, use the available tools to find it.
        - You have access to the following tool:
            webSearch(query: string): Use this to search the internet for current or unknown information.
        - Decide when to use your own knowledge and when to use the tool. Do not mention the tool explicitly in your final answer.

        Formatting rules:
        - If the answer is code → format it inside Markdown code blocks with the correct language.
        - If the answer is a comparison or structured info → format as a Markdown table.
        - If the answer is a list of items or steps → use bullet points (-).
        - If the answer is explanatory text → write in clear paragraphs (2–4 sentences max).
        - Always keep answers concise, professional, and easy to read.

        Tone & Style: professional yet approachable.

        Current date and time: ${new Date().toUTCString()}`
    }
  ];

  // Build messages array: system + previous history + the latest user message
  // Note: the endpoint already saved the user message, and it will be present in previousMessages.
  const messages = [...systemPrompt, ...formattedPreviousMessages];

  // Main loop: allow model to call tool(s) and then continue until model returns content without tool_calls
  while (true) {
    const completions = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description: "Search the latest information and realtime data on the internet",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "The search query to perform search on." }
              },
              required: ["query"]
            }
          }
        }
      ],
      tool_choice: "auto"
    });

    const assistantMessage = completions.choices[0].message;
    // push assistant's message (may be a tool call or final content)
    messages.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls;

    // If no tool calls, we have final content
    if (!toolCalls || toolCalls.length === 0) {
      const aiMessage = assistantMessage.content || "";
      // Return final assistant text (caller will save it)
      return aiMessage;
    }

    // Process each tool call (e.g., webSearch)
    for (const toolCall of toolCalls) {
      try {
        const functionName = toolCall.function.name;
        const rawArgs = toolCall.function.arguments;
        const parameters = rawArgs ? JSON.parse(rawArgs) : {};

        if (functionName === "webSearch") {
          const result = await webSearch(parameters);
          messages.push({
            role: "tool",
            name: functionName,
            content: result,
            tool_call_id: toolCall.id
          });
        } else {
          // unknown tool → push an explanatory message
          messages.push({
            role: "tool",
            name: functionName,
            content: `Tool ${functionName} is not implemented on the server.`
          });
        }
      } catch (err) {
        // If tool processing fails, push an error content back to the model so it can continue gracefully
        console.error("Error processing tool call:", err);
        messages.push({
          role: "tool",
          name: toolCall.function?.name || "unknown",
          content: `Tool call failed: ${err?.message || "unknown error"}`
        });
      }
    }

    // loop will continue and call the model again with the tool outputs
  }
}

async function webSearch({ query }) {
  console.log("WebSearch called with query:", query);
  if (!query) return "No query provided to webSearch.";

  try {
    const result = await tvly.search(query);
    if (!result || !result.results || result.results.length === 0) {
      return `No search results found for query: ${query}`;
    }

    const finalResult = result.results
      .map((r) => r.content || r.snippet || "")
      .filter(Boolean)
      .join("\n\n");

    return finalResult || `No useful content found for query: ${query}`;
  } catch (err) {
    console.error("webSearch error:", err);
    return `webSearch failed: ${err?.message || "unknown error"}`;
  }
}
