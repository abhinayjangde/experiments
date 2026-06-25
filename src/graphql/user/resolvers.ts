import { prisma } from "../../lib/db.js";


export const resolvers = {
    queries: {
        users: async () => {
            const users = await prisma.user.findMany();
            return users;
        },
    },
    mutations: {
        createUser: async (_: any, args: any) => {
            const { email, name, password } = args;
            const user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password,
                },
            });
            return user;
        },
    }
}