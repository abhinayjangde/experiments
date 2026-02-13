import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import z, { string } from 'zod';
import { createAgent, tool, createMiddleware, modelCallLimitMiddleware } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogle } from "@langchain/google";
import { Ollama } from "ollama";


const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const client = new Ollama();

// web search tool
const search = tool(
    async ({ query }) => {
        const results = await client.webSearch({ query, maxResults: 3 });
        console.log("Search results:", results.results);
        return JSON.stringify(results, null, 2);
    },
    {
        name: "search",
        description: "Useful for searching the web for up-to-date information. Input should be a search query.",
        schema: z.object({
            query: string().describe("The search query to find relevant information.")
        })
    }
)


const chatGPT5 = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || "gpt-5-mini-2025-08-07"
});

const geminiFlash = new ChatGoogle("gemini-2.5-flash");


const dynamicModelSelection = createMiddleware({
    name: "DynamicModelSelection",
    wrapModelCall: (request, handler) => {
        // Choose model based on conversation complexity
        const queryLength = request.messages[0]?.content.length;

        return handler({
            ...request,
            model: queryLength && queryLength > 20 ? chatGPT5 : geminiFlash,
        });
    },
});

const agent = createAgent({
    model: "gpt-4.1-mini",
    middleware: [dynamicModelSelection],
    tools: [search]
})

app.post('/chat', async (req, res) => {
    const query = z.string().parse(req.body.query);

    const result = await agent.invoke({
        messages: [{ role: "user", content: query }],
    });

    res.status(200).json({
        query: query,
        output: result.messages[1]?.content,
        modelUsed: result.messages[1]?.response_metadata.model || result.messages[1]?.response_metadata.model_name || "unknown",

    });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
