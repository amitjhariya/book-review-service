import { gql } from "apollo-server-express";

export const typeDefs = gql`
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
    rating: Int!
    comment: String!
    createdAt: String!
    processed: Boolean!
  }

  input ReviewInput {
    reviewerName: String!
    rating: Int!
    comment: String!
  }

  type AddReviewResponse {
    success: Boolean!
    review: Review
    message: String
  }

  type Query {
    getBooks: [Book!]!
    getBook(id: ID!): Book
  }

  type Mutation {
    addReview(bookId: ID!, review: ReviewInput!): AddReviewResponse!
  }
`;
