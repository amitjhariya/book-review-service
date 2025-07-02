import { DatabaseService } from '@book-review/database';
import { QueueService } from '@book-review/queue';
import { ReviewInput } from '@book-review/shared';
import { ValidationService } from '../validation/validators';
import { UserInputError } from 'apollo-server-express';

export interface Context {
  database: DatabaseService;
  queue: QueueService;
}

export const resolvers = {
  Query: {
    getBooks: async (_: any, __: any, context: Context) => {
      try {
        return await context.database.getBooks();
      } catch (error) {
        console.error('Error fetching books:', error);
        throw new Error('Failed to fetch books');
      }
    },

    getBook: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        const bookIdErrors = ValidationService.validateBookId(id);
        if (bookIdErrors.length > 0) {
          throw new UserInputError('Invalid book ID', {
            validationErrors: bookIdErrors,
          });
        }

        const book = await context.database.getBookById(id);
        if (!book) {
          throw new Error(`Book with ID ${id} not found`);
        }
        return book;
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error;
        }
        console.error('Error fetching book:', error);
        throw new Error('Failed to fetch book');
      }
    },
  },

  Mutation: {
    addReview: async (
      _: any,
      { bookId, review }: { bookId: string; review: ReviewInput },
      context: Context
    ) => {
      try {
        // Validate inputs
        const bookIdErrors = ValidationService.validateBookId(bookId);
        const reviewErrors = ValidationService.validateReviewInput(review);
        const allErrors = [...bookIdErrors, ...reviewErrors];

        if (allErrors.length > 0) {
          return {
            success: false,
            review: null,
            message: `Validation failed: ${allErrors.map((e) => e.message).join(', ')}`,
          };
        }

        // Check if book exists
        const book = await context.database.getBookById(bookId);
        if (!book) {
          return {
            success: false,
            review: null,
            message: `Book with ID ${bookId} not found`,
          };
        }

        // Add review to database
        const newReview = await context.database.addReview(bookId, review);

        // Queue background job to process the review
        await context.queue.enqueue('process-review', {
          reviewId: newReview.id,
          bookId: bookId,
        });

        return {
          success: true,
          review: newReview,
          message: 'Review added successfully and queued for processing',
        };
      } catch (error) {
        console.error('Error adding review:', error);
        return {
          success: false,
          review: null,
          message: 'Failed to add review',
        };
      }
    },
  },

  Review: {
    createdAt: (review: any) => review.createdAt.toISOString(),
  },
};
