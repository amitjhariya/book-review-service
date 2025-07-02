import { DatabaseService } from '@book-review/database';
import { QueueService, ReviewProcessor } from '@book-review/queue';
import { resolvers } from '../resolvers/resolvers';
import { ReviewInput } from '@book-review/shared';

describe('GraphQL Resolvers', () => {
  let database: DatabaseService;
  let queue: QueueService;
  let context: any;

  beforeEach(() => {
    database = new DatabaseService();
    queue = new QueueService(database);
    const reviewProcessor = new ReviewProcessor(database);
    queue.registerProcessor('process-review', reviewProcessor);

    context = { database, queue };
  });

  describe('Query.getBooks', () => {
    it('should return all books with their reviews', async () => {
      const books = await resolvers.Query.getBooks(null, {}, context);

      expect(books).toBeDefined();
      expect(Array.isArray(books)).toBe(true);
      expect(books.length).toBeGreaterThan(0);

      const firstBook = books[0];
      expect(firstBook).toHaveProperty('id');
      expect(firstBook).toHaveProperty('title');
      expect(firstBook).toHaveProperty('author');
      expect(firstBook).toHaveProperty('reviews');
      expect(Array.isArray(firstBook.reviews)).toBe(true);
    });
  });

  describe('Query.getBook', () => {
    it('should return a specific book when valid ID is provided', async () => {
      const book = await resolvers.Query.getBook(null, { id: '1' }, context);

      expect(book).toBeDefined();
      expect(book.id).toBe('1');
      expect(book).toHaveProperty('title');
      expect(book).toHaveProperty('author');
    });

    it('should throw error when book is not found', async () => {
      await expect(resolvers.Query.getBook(null, { id: 'nonexistent' }, context)).rejects.toThrow(
        'Failed to fetch book'
      );
    });

    it('should throw UserInputError for invalid book ID', async () => {
      await expect(resolvers.Query.getBook(null, { id: '' }, context)).rejects.toThrow();
    });
  });

  describe('Mutation.addReview', () => {
    const validReviewInput: ReviewInput = {
      reviewerName: 'Test Reviewer',
      rating: 5,
      comment: 'This is a great book with excellent storytelling.',
    };

    it('should successfully add a review for valid input', async () => {
      const result = await resolvers.Mutation.addReview(
        null,
        { bookId: '1', review: validReviewInput },
        context
      );

      expect(result.success).toBe(true);
      expect(result.review).toBeDefined();
      expect(result.review).not.toBeNull();
      if (result.review) {
        expect(result.review.reviewerName).toBe(validReviewInput.reviewerName);
        expect(result.review.rating).toBe(validReviewInput.rating);
        expect(result.review.comment).toBe(validReviewInput.comment);
        expect(result.review.processed).toBe(false);
      }
      expect(result.message).toContain('successfully');
    });

    it('should fail when book does not exist', async () => {
      const result = await resolvers.Mutation.addReview(
        null,
        { bookId: 'nonexistent', review: validReviewInput },
        context
      );

      expect(result.success).toBe(false);
      expect(result.review).toBeNull();
      expect(result.message).toContain('not found');
    });

    it('should fail validation for invalid review input', async () => {
      const invalidReview: ReviewInput = {
        reviewerName: '',
        rating: 6,
        comment: 'Short',
      };

      const result = await resolvers.Mutation.addReview(
        null,
        { bookId: '1', review: invalidReview },
        context
      );

      expect(result.success).toBe(false);
      expect(result.review).toBeNull();
      expect(result.message).toContain('Validation failed');
    });

    it('should enqueue a background job after adding review', async () => {
      // Spy on the queue.enqueue method
      const enqueueSpy = jest.spyOn(queue, 'enqueue');

      await resolvers.Mutation.addReview(null, { bookId: '1', review: validReviewInput }, context);

      expect(enqueueSpy).toHaveBeenCalledWith('process-review', {
        reviewId: expect.any(String),
        bookId: '1',
      });
    });
  });

  describe('Review.createdAt', () => {
    it('should format createdAt as ISO string', () => {
      const mockReview = {
        createdAt: new Date('2024-01-01T12:00:00Z'),
      };

      const result = resolvers.Review.createdAt(mockReview);
      expect(result).toBe('2024-01-01T12:00:00.000Z');
    });
  });
});
