import { prisma } from "../../lib/db.js";
import type { IUser } from "../../services/user.js";
import { UserService } from "../../services/user.js";

export const resolvers = {
    queries: {
        users: async () => {
            const users = await prisma.user.findMany();
            return users;
        },
    },
    mutations: {
        createUser: async (_: any, args: IUser) => {
            return await UserService.createUser(args);
        },
    }
}