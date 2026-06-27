import { prisma } from "../../lib/db.js";
import type { IUser } from "../../services/user.js";
import { UserService } from "../../services/user.js";

export const resolvers = {
    queries: {
        posts: async () => {
            const posts = await prisma.post.findMany({
                include: {
                    author: true
                }
            });
            return posts;
        },
        users: async () => {
            const users = await prisma.user.findMany({
                include: {
                    posts: true
                }
            });
            return users;
        },
    },
    mutations: {
        createUser: async (_: any, args: IUser) => {
            return await UserService.createUser(args);
        },
    }
}