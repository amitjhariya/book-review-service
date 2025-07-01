import { Book, Review, ReviewInput, Job, JobStatus } from "@book-review/shared";
import { v4 as uuidv4 } from "uuid";

export class DatabaseService {
  private books: Map<string, Book> = new Map();
  private reviews: Map<string, Review> = new Map();
  private jobs: Map<string, Job> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    const books: Book[] = [
      {
        id: "1",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0-7432-7356-5",
        publishedYear: 1925,
        description: "A classic American novel set in the Jazz Age",
        reviews: [],
      },
      {
        id: "2",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "978-0-06-112008-4",
        publishedYear: 1960,
        description:
          "A gripping tale of racial injustice and childhood innocence",
        reviews: [],
      },
      {
        id: "3",
        title: "1984",
        author: "George Orwell",
        isbn: "978-0-452-28423-4",
        publishedYear: 1949,
        description: "A dystopian social science fiction novel",
        reviews: [],
      },
    ];

    books.forEach((book) => this.books.set(book.id, book));

    // Add some initial reviews
    const initialReviews: Review[] = [
      {
        id: uuidv4(),
        bookId: "1",
        reviewerName: "Alice Johnson",
        rating: 5,
        comment: "An absolute masterpiece of American literature.",
        createdAt: new Date("2024-01-15"),
        processed: true,
      },
      {
        id: uuidv4(),
        bookId: "2",
        reviewerName: "Bob Smith",
        rating: 4,
        comment: "Powerful and moving story.",
        createdAt: new Date("2024-01-20"),
        processed: true,
      },
    ];

    initialReviews.forEach((review) => {
      this.reviews.set(review.id, review);
      const book = this.books.get(review.bookId);
      if (book) {
        book.reviews.push(review);
      }
    });
  }

  async getBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBookById(id: string): Promise<Book | null> {
    return this.books.get(id) || null;
  }

  async addReview(bookId: string, reviewInput: ReviewInput): Promise<Review> {
    const book = this.books.get(bookId);
    if (!book) {
      throw new Error(`Book with id ${bookId} not found`);
    }

    const review: Review = {
      id: uuidv4(),
      bookId,
      reviewerName: reviewInput.reviewerName,
      rating: reviewInput.rating,
      comment: reviewInput.comment,
      createdAt: new Date(),
      processed: false,
    };

    this.reviews.set(review.id, review);
    book.reviews.push(review);

    return review;
  }

  async updateReview(
    reviewId: string,
    updates: Partial<Review>
  ): Promise<Review | null> {
    const review = this.reviews.get(reviewId);
    if (!review) {
      return null;
    }

    const updatedReview = { ...review, ...updates };
    this.reviews.set(reviewId, updatedReview);

    // Update the review in the book's reviews array
    const book = this.books.get(review.bookId);
    if (book) {
      const reviewIndex = book.reviews.findIndex((r) => r.id === reviewId);
      if (reviewIndex !== -1) {
        book.reviews[reviewIndex] = updatedReview;
      }
    }

    return updatedReview;
  }

  async getReviewById(id: string): Promise<Review | null> {
    return this.reviews.get(id) || null;
  }

  async addJob(type: string, payload: any): Promise<Job> {
    const job: Job = {
      id: uuidv4(),
      type,
      payload,
      status: JobStatus.PENDING,
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job);
    return job;
  }

  async updateJob(jobId: string, updates: Partial<Job>): Promise<Job | null> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return null;
    }

    const updatedJob = { ...job, ...updates };
    this.jobs.set(jobId, updatedJob);
    return updatedJob;
  }

  async getPendingJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.status === JobStatus.PENDING
    );
  }
}

