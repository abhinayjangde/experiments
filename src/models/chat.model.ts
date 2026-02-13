import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    title: { type: String, default: "New Chat" },
    createdAt: { type: Date, default: Date.now }
});



export const Chat = mongoose.model("Chat", chatSchema);
