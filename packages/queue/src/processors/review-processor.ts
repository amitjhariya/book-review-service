import { Job, JobPayload } from '@book-review/shared';
import { DatabaseService } from '@book-review/database';
import { JobProcessor } from '../queue-service';

export class ReviewProcessor implements JobProcessor {
  private static readonly APPEND_TEXT = ' [Verified Review]';

  constructor(private database: DatabaseService) {}

  async process(job: Job): Promise<void> {
    const payload = job.payload as JobPayload;

    if (!payload.reviewId) {
      throw new Error('Review ID is required in job payload');
    }

    const review = await this.database.getReviewById(payload.reviewId);
    if (!review) {
      throw new Error(`Review with ID ${payload.reviewId} not found`);
    }

    // Simulate some processing time
    await this.sleep(500);

    // Append the static string to the review comment
    const updatedComment = review.comment + ReviewProcessor.APPEND_TEXT;

    await this.database.updateReview(payload.reviewId, {
      comment: updatedComment,
      processed: true,
    });

    console.log(`Review ${payload.reviewId} processed and updated`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
