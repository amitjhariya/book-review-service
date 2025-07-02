import { ReviewInput } from '@book-review/shared';

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationService {
  static validateReviewInput(reviewInput: ReviewInput): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate reviewer name
    if (!reviewInput.reviewerName || reviewInput.reviewerName.trim().length === 0) {
      errors.push({
        field: 'reviewerName',
        message: 'Reviewer name is required',
      });
    } else if (reviewInput.reviewerName.trim().length < 2) {
      errors.push({
        field: 'reviewerName',
        message: 'Reviewer name must be at least 2 characters long',
      });
    } else if (reviewInput.reviewerName.trim().length > 100) {
      errors.push({
        field: 'reviewerName',
        message: 'Reviewer name must be less than 100 characters',
      });
    }

    // Validate rating
    if (reviewInput.rating === undefined || reviewInput.rating === null) {
      errors.push({ field: 'rating', message: 'Rating is required' });
    } else if (!Number.isInteger(reviewInput.rating)) {
      errors.push({ field: 'rating', message: 'Rating must be an integer' });
    } else if (reviewInput.rating < 1 || reviewInput.rating > 5) {
      errors.push({
        field: 'rating',
        message: 'Rating must be between 1 and 5',
      });
    }

    // Validate comment
    if (!reviewInput.comment || reviewInput.comment.trim().length === 0) {
      errors.push({ field: 'comment', message: 'Comment is required' });
    } else if (reviewInput.comment.trim().length < 10) {
      errors.push({
        field: 'comment',
        message: 'Comment must be at least 10 characters long',
      });
    } else if (reviewInput.comment.trim().length > 1000) {
      errors.push({
        field: 'comment',
        message: 'Comment must be less than 1000 characters',
      });
    }

    return errors;
  }

  static validateBookId(bookId: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!bookId || bookId.trim().length === 0) {
      errors.push({ field: 'bookId', message: 'Book ID is required' });
    } else if (!/^[a-zA-Z0-9-_]+$/.test(bookId)) {
      errors.push({
        field: 'bookId',
        message: 'Book ID contains invalid characters',
      });
    }

    return errors;
  }
}
