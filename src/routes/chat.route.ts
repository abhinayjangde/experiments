import express from "express";
import type { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import agent from "../lib/model.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router: Router = express.Router();

router.use(authenticateToken);

router.get("/", async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const chats = await Chat.find({ userId: new ObjectId(userId) })
            .sort({ updatedAt: -1 });
        
        res.status(200).json({
            success: true,
            data: { chats }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

router.post("/", async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        const userId = req.user?.userId;
        
        if (!message) {
            res.status(400).json({
                success: false,
                error: "Message is required"
            });
            return;
        }

        const chat = await Chat.create({ 
            title: message,
            userId: new ObjectId(userId) 
        });
        
        res.status(201).json({
            success: true,
            data: {
                title: chat.title,
                chatId: chat._id,
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

router.post("/:chatId", async (req: Request, res: Response) => {
    try {
        const chatId = Array.isArray(req.params.chatId) ? req.params.chatId[0] : req.params.chatId;
        const { message } = req.body;
        const userId = req.user?.userId;

        if (!message) {
            res.status(400).json({
                success: false,
                error: "Message is required"
            });
            return;
        }

        const chat = await Chat.findOne({ 
            _id: new ObjectId(chatId),
            userId: new ObjectId(userId)
        });
        
        if (!chat) {
            res.status(404).json({
                success: false,
                error: "Chat not found"
            });
            return;
        }

        const previousMessages = await Message.find({ 
            chatId: new ObjectId(chatId),
            userId: new ObjectId(userId)
        });

        const formatted = previousMessages
            .filter((msg) => msg.role && msg.content)
            .map((msg) => ({
                role: msg.role as string,
                content: msg.content as string,
            }));

        formatted.push({ role: "user", content: message });

        const response = await agent.invoke({ messages: formatted });

        await Message.create({
            chatId: new ObjectId(chatId),
            userId: new ObjectId(userId),
            role: "user",
            content: message,
        });
        
        const assistantContent = response.messages[1]?.content;
        const contentString = typeof assistantContent === "string" ? assistantContent : JSON.stringify(assistantContent || "");

        await Message.create({
            chatId: new ObjectId(chatId),
            userId: new ObjectId(userId),
            role: "assistant",
            content: contentString,
        });

        await Chat.findByIdAndUpdate(chatId, { 
            title: message,
            updatedAt: new Date()
        });
        
        res.status(200).json({
            success: true,
            data: {
                reply: response.messages[1]?.content,
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

export default router;
