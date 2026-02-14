import { createAgent } from "langchain";
import { webSearch } from "./tools.js"
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();



const agent = createAgent({
    model: "gpt-5.2-2025-12-11",
    tools: [webSearch],
    checkpointer
})


export default agent;
