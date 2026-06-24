import { ApolloServer } from '@apollo/server';

async function createGraphQLServer() {
    const server = new ApolloServer({
        typeDefs: /* GraphQL */ `
            type Query {
                hello: String
            }
        `,
        resolvers: {
            Query: {
                hello: () => 'Hello, World!',
            },
        },
    });

    await server.start();

    return server;
}

export default createGraphQLServer;