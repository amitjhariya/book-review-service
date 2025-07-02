export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  description: string;
  reviews: Review[];
}

export interface Review {
  id: string;
  bookId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  processed: boolean;
}

export interface ReviewInput {
  reviewerName: string;
  rating: number;
  comment: string;
}

export interface JobPayload {
  reviewId: string;
  bookId: string;
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Job {
  id: string;
  type: string;
  payload: JobPayload;
  status: JobStatus;
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}
