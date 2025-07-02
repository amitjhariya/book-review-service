# Book Review Microservice

A GraphQL-based microservice for managing book reviews with asynchronous background processing, built with TypeScript and Node.js in a monorepo structure.

## Features

- **GraphQL API** with queries and mutations for books and reviews
- **Background Job Processing** with queued review processing
- **Monorepo Structure** using pnpm workspaces
- **Input Validation** and comprehensive error handling
- **Docker Support** with multi-stage builds for production
- **TypeScript** throughout the entire codebase
- **Testing** with Jest for unit and integration tests
- **CI/CD Pipeline** with GitHub Actions
- **Code Quality** with ESLint and Prettier

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

### Design Decisions

1. **Monorepo with pnpm**: Chosen for better dependency management and code sharing between packages
2. **In-Memory Database**: Used for simplicity, but designed with interfaces that can easily be swapped for real databases
3. **Background Job Queue**: Implemented with a simple polling mechanism, can be easily replaced with Redis/Bull
4. **GraphQL**: Provides type-safe API with introspection and good developer experience
5. **TypeScript**: Ensures type safety across the entire application
6. **Docker Multi-stage Build**: Optimized for production with minimal image size

## API Schema

### Queries

```graphql
# Get all books with their reviews
getBooks: [Book!]!

# Get a specific book by ID
getBook(id: ID!): Book
```

### Mutations

```graphql
# Add a review for a book (triggers background processing)
addReview(bookId: ID!, review: ReviewInput!): AddReviewResponse!
```

### Types

```graphql
type Book {
  id: ID!
  title: String!
  author: String!
  isbn: String!
  publishedYear: Int!
  description: String!
  reviews: [Review!]!
}

type Review {
  id: ID!
  bookId: ID!
  reviewerName: String!
  rating: Int! # 1-5 scale
  comment: String!
  createdAt: String!
  processed: Boolean! # Indicates if background processing is complete
}

input ReviewInput {
  reviewerName: String!
  rating: Int! # Must be 1-5
  comment: String! # Minimum 10 characters
}
```

## Setup & Installation

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (optional, for containerized deployment)

### Development Setup

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd book-review-microservice
pnpm install
```

2. **Build all packages:**

```bash
pnpm run build
```

3. **Start development server:**

```bash
pnpm run dev
```

The GraphQL server will be available at `http://localhost:4000/graphql`

### Production Setup

#### Using Docker (Recommended)

1. **Build the Docker image:**

```bash
docker build -t book-review-service .
```

2. **Run the container:**

```bash
docker run -p 4000:4000 book-review-service
```

#### Manual Production Build

1. **Build for production:**

```bash
pnpm run build
```

2. **Start the production server:**

```bash
cd apps/api
pnpm start
```

## Usage Examples

### GraphQL Queries

**Get all books:**

```graphql
query {
  getBooks {
    id
    title
    author
    reviews {
      reviewerName
      rating
      comment
      processed
    }
  }
}
```

**Add a review:**

```graphql
mutation {
  addReview(
    bookId: "1"
    review: {
      reviewerName: "John Doe"
      rating: 5
      comment: "Absolutely fantastic book! Highly recommend it to everyone."
    }
  ) {
    success
    message
    review {
      id
      comment
      processed
    }
  }
}
```

### Background Processing

When a review is added, it's automatically queued for background processing. The system:

1. Validates the review input
2. Stores the review in the database
3. Queues a background job
4. Returns immediately to the client
5. Processes the job asynchronously (appends " [Verified Review]" to the comment)
6. Updates the review's `processed` status

## Testing

Run the test suite:

```bash
# Run all tests
pnpm run test

# Run tests for a specific package
pnpm --filter @book-review/api test
```

### Test Coverage

The project includes:

- Unit tests for resolvers
- Integration tests for the GraphQL API
- Validation testing
- Background job processing tests

## Available Scripts

```bash
# Development
pnpm run dev          # Start all services in development mode
pnpm run build        # Build all packages
pnpm run test         # Run all tests

# Code Quality
pnpm run lint         # Run ESLint
pnpm run format       # Format code with Prettier

# Docker
pnpm run docker:build # Build Docker image
pnpm run docker:run   # Run Docker container
```

## Health Monitoring

The service exposes a health check endpoint:

```bash
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Environment Variables

| Variable   | Description | Default       |
| ---------- | ----------- | ------------- |
| `PORT`     | Server port | `4000`        |
| `NODE_ENV` | Environment | `development` |

## Future Improvements

### Short-term Enhancements

1. **Database Integration**
   - Replace in-memory storage with PostgreSQL/MongoDB
   - Add database migrations and connection pooling
   - Implement proper database indexing

2. **Authentication & Authorization**
   - Add JWT-based authentication
   - Implement role-based access control
   - Rate limiting for API endpoints

3. **Enhanced Queue System**
   - Replace simple polling with Redis/Bull queues
   - Add job retry mechanisms and dead letter queues
   - Implement job priority and scheduling

4. **Monitoring & Observability**
   - Add structured logging with Winston
   - Implement metrics collection (Prometheus)
   - Add distributed tracing (OpenTelemetry)

### Long-term Enhancements

1. **Scalability**
   - Horizontal scaling support
   - Database read replicas
   - Caching layer (Redis)
   - Load balancing strategies

2. **Advanced Features**
   - Real-time subscriptions for review updates
   - Advanced search and filtering
   - Review moderation system
   - Email notifications

3. **DevOps & Infrastructure**
   - Kubernetes deployment manifests
   - Terraform infrastructure as code
   - Multi-environment deployment pipeline
   - Automated security scanning

4. **Performance Optimization**
   - Database query optimization
   - GraphQL query complexity analysis
   - Response caching strategies
   - CDN integration for static assets

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `pnpm run test`
5. Check code quality: `pnpm run lint && pnpm run format`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
