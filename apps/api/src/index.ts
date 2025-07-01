import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { DatabaseService } from "@book-review/database";
import { QueueService, ReviewProcessor } from "@book-review/queue";
import { typeDefs } from "./schema/schema";
import { resolvers } from "./resolvers/resolvers";

async function startServer() {
  // Initialize services
  const database = new DatabaseService();
  const queue = new QueueService(database);

  // Register job processors
  const reviewProcessor = new ReviewProcessor(database);
  queue.registerProcessor("process-review", reviewProcessor);

  // Start the queue service
  queue.start().catch(console.error);

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      database,
      queue,
    }),
    introspection: true,
    csrfPrevention: true,
  });

  await server.start();

  // Create Express app
  const app = express();

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Apply Apollo GraphQL middleware
  server.applyMiddleware({ app, path: "/graphql" });

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    queue.stop();
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully");
    queue.stop();
    process.exit(0);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
