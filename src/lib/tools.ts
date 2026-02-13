import { Ollama } from "ollama";
import z from 'zod';
import { createAgent, tool, createMiddleware, modelCallLimitMiddleware } from "langchain";

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
            query: z.string().describe("The search query to find relevant information.")
        })
    }
)

export { search }
