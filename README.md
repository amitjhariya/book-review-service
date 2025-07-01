# Book Review Microservice

A GraphQL-based microservice for managing book reviews with asynchronous background processing, built with TypeScript and Node.js in a monorepo structure.

## Architecture

The project is structured as a monorepo with the following packages:

```
├── apps/
│   └── api/                 # GraphQL API server
├── packages/
│   ├── shared/              # Shared types and utilities
│   ├── database/            # Database layer (in-memory storage)
│   └── queue/               # Background job processing
```
