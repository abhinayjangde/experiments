import { Ollama } from "ollama";
import { tool } from "langchain"
import { z } from "zod";

const client = new Ollama();

export const webSearch = tool(
    async ({ query }: { query: string }) => {
        console.log("Tool: Web Search");

        const result = await client.webSearch({ query, maxResults: 3 })
        const context = result.results.map((r) => r.content).join("\n\n");
        return context;
    },
    {
        name: "web_search",
        description: "Search the web for a given query",
        schema: z.object({
            query: z.string().describe("The query to search for"),
        }),
    }
);