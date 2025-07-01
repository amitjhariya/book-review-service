import { Job, JobStatus, JobPayload } from "@book-review/shared";
import { DatabaseService } from "@book-review/database";

export interface JobProcessor {
  process(job: Job): Promise<void>;
}

export class QueueService {
  private processors: Map<string, JobProcessor> = new Map();
  private isProcessing = false;
  private pollInterval = 1000; // 1 second

  constructor(private database: DatabaseService) {}

  registerProcessor(jobType: string, processor: JobProcessor): void {
    this.processors.set(jobType, processor);
  }

  async enqueue(jobType: string, payload: JobPayload): Promise<Job> {
    return this.database.addJob(jobType, payload);
  }

  async start(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    console.log("Queue service started");

    while (this.isProcessing) {
      try {
        await this.processPendingJobs();
        await this.sleep(this.pollInterval);
      } catch (error) {
        console.error("Error processing jobs:", error);
        await this.sleep(this.pollInterval);
      }
    }
  }

  stop(): void {
    this.isProcessing = false;
    console.log("Queue service stopped");
  }

  private async processPendingJobs(): Promise<void> {
    const pendingJobs = await this.database.getPendingJobs();

    for (const job of pendingJobs) {
      await this.processJob(job);
    }
  }

  private async processJob(job: Job): Promise<void> {
    const processor = this.processors.get(job.type);
    if (!processor) {
      console.warn(`No processor found for job type: ${job.type}`);
      await this.database.updateJob(job.id, {
        status: JobStatus.FAILED,
        error: `No processor found for job type: ${job.type}`,
        processedAt: new Date(),
      });
      return;
    }

    try {
      await this.database.updateJob(job.id, {
        status: JobStatus.PROCESSING,
        processedAt: new Date(),
      });

      await processor.process(job);

      await this.database.updateJob(job.id, {
        status: JobStatus.COMPLETED,
        processedAt: new Date(),
      });

      console.log(`Job ${job.id} completed successfully`);
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      await this.database.updateJob(job.id, {
        status: JobStatus.FAILED,
        error: error instanceof Error ? error.message : "Unknown error",
        processedAt: new Date(),
      });
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
