import express from "express";
import type { Request, Response } from "express";
import "dotenv/config";
import createGraphQLServer from "./graphql/index.js";
import { expressMiddleware } from '@as-integrations/express5';
import cors from "cors";

async function startServer() {
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(cors());
    app.use(express.json());

    app.use("/graphql", expressMiddleware(await createGraphQLServer(), {
        context: async ({ req }: { req: Request }) => {
            // You can add any context you want to pass to your GraphQL resolvers here
            return { req };
        }
    }));
    app.listen(port, () => {
        console.log(`Server is running on port http://localhost:${port}/graphql`);
    });

}

startServer();

