import express from "express";
import type { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.get("/api", (req: Request, res: Response) => {
    res.json({ message: "Hello from the API!" });
});

app.listen(9000, () => {
    console.log("Server is running on port 9000");
});