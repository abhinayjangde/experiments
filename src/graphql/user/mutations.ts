export const mutations = `#graphql
    type Mutation {
        createUser(email: String!, name: String, password: String!): User!
    }
`;