import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    role: { type: String, enum: ["user", "assistant"] },
    content: String,
    createdAt: { type: Date, default: Date.now }
});

export const Message = mongoose.model("Message", messageSchema);
