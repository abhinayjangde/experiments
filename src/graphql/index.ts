import { ApolloServer } from '@apollo/server';
import { User } from "./user/index.js"

const typeDefs = `#graphql
    ${User.typeDefs}
    ${User.queries}
    ${User.mutations}
`;

const resolvers = {
    Query: {
        ...User.resolvers.queries
    },
    Mutation: {
        ...User.resolvers.mutations
    }
}

async function createGraphQLServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers
    });

    await server.start();

    return server;
}

export default createGraphQLServer;