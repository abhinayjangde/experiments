import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogle } from "@langchain/google";

const chatgpt = new ChatOpenAI({ modelName: process.env.OPENAI_MODEL || "gpt-5-mini-2025-08-07" });
const gemini = new ChatGoogle("gemini-2.5-flash");


const agent = createAgent({
    model: chatgpt
})


export default agent