import express from "express";
import type { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import agent from "../lib/model.js";

const router: Router = express.Router();


router.post("/", async (req, res) => {
    const message = req.body.message;
    console.log("Creating new chat with initial message:", message);
    const chat = await Chat.create({ title: message });
    res.status(200).json({
        title: chat.title,
        chatId: chat._id,
    });

});
router.post("/:chatId", async (req: Request, res: Response) => {
    const chatId = Array.isArray(req.params.chatId) ? req.params.chatId[0] : req.params.chatId;
    const message = req.body.message;

    const previousMessages = await Message.find({ chatId: new ObjectId(chatId) });

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
        role: "user",
        content: message,
    });
    const assistantContent = response.messages[1]?.content;
    const contentString = typeof assistantContent === "string" ? assistantContent : JSON.stringify(assistantContent || "");

    await Message.create({
        chatId: new ObjectId(chatId),
        role: "assistant",
        content: contentString,
    })

    await Chat.findByIdAndUpdate(chatId, { title: message });
    res.status(200).json({
        reply: response.messages[1]?.content,
    });


});

export default router;