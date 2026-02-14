import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import agent from './lib/agent.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;



app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

const config = {
    configurable: { thread_id: "1" },
    context: { user_id: "1" },
};

const normalizeContent = (content: unknown): string => {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content
            .map((part) => {
                if (typeof part === "string") return part;
                if (part && typeof part === "object" && "text" in part) {
                    const text = (part as { text?: unknown }).text;
                    return typeof text === "string" ? text : "";
                }
                return "";
            })
            .join("");
    }
    return "";
};

const extractChunkText = (chunk: unknown): string => {
    if (Array.isArray(chunk)) {
        const messageChunk = chunk[0] as { content?: unknown } | undefined;
        if (messageChunk && typeof messageChunk === "object") {
            return normalizeContent(messageChunk.content);
        }
    }

    if (!chunk || typeof chunk !== "object") return "";

    const streamChunk = chunk as {
        text?: unknown;
        content?: unknown;
        messages?: Array<{ content?: unknown }>;
        [key: string]: unknown;
    };

    if (typeof streamChunk.text === "string") return streamChunk.text;
    if (streamChunk.content !== undefined) return normalizeContent(streamChunk.content);

    if (Array.isArray(streamChunk.messages) && streamChunk.messages.length > 0) {
        const lastMessage = streamChunk.messages[streamChunk.messages.length - 1];
        return normalizeContent(lastMessage?.content);
    }

    for (const value of Object.values(streamChunk)) {
        if (!value || typeof value !== "object") continue;

        const nested = value as { messages?: Array<{ content?: unknown }> };
        if (Array.isArray(nested.messages) && nested.messages.length > 0) {
            const lastNestedMessage = nested.messages[nested.messages.length - 1];
            const nestedText = normalizeContent(lastNestedMessage?.content);
            if (nestedText) return nestedText;
        }
    }

    return "";
};

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json({ error: "Message is required" });
        }

        res.status(200);
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");
        res.setHeader("Cache-Control", "no-cache");

        if (typeof res.flushHeaders === "function") {
            res.flushHeaders();
        }

        const result = await agent.stream({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that provides concise and accurate answers to user queries."
                },
                { role: "user", content: message }
            ]
        }, {
            ...config,
            streamMode: "messages"
        });

        for await (const chunk of result) {
            const text = extractChunkText(chunk);
            if (text) {
                res.write(text);
            }
        }

        return res.end();
    } catch (error) {
        console.error("/api/chat error:", error);
        if (!res.headersSent) {
            return res.status(500).json({ error: "Failed to process chat request" });
        }
        res.write("\n\n[Stream interrupted]");
        return res.end();
    }
})

app.listen(port, () => {
    console.log(`running on port http://localhost:${port}`);
});
