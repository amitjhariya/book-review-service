import "reflect-metadata"; // Safe to include if you're using TypeORM or decorators
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";


const typeDefs = gql`
  type Query {
    hello: String!
  }
`;


const resolvers = {
  Query: {
    hello: () => "Hello from Apollo Server with Express!",
  },
};

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  server.applyMiddleware({ app });

  const PORT = 4000;

  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
