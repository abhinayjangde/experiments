
export const typeDefs = `#graphql
  type User {
    id: Int!
    email: String!
    name: String
    posts: [Post!]!
  }

  type Post {
    id: Int!
    title: String!
    content: String
    published: Boolean!
    author: User!
    createdAt: String!
  }
`;
