import { ReviewerRepository } from "./reviewer.repository";
import type { IReviewer } from "./reviewer.types";
import { AppError } from "../../errors/app-error";

export class ReviewerService {
  private reviewerRepository = new ReviewerRepository();

  async getAllReviewers(): Promise<IReviewer[]> {
    return await this.reviewerRepository.findAll();
  }

  async getReviewerBySlug(slug: string): Promise<IReviewer> {
    const reviewer = await this.reviewerRepository.findBySlug(slug);
    if (!reviewer) {
      throw new AppError(404, "Reviewer not found");
    }
    return reviewer;
  }
}
