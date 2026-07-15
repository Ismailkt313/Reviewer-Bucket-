import { RatingRepository } from "./rating.repository";
import { ReviewerRepository } from "../reviewers/reviewer.repository";
import { AppError } from "../../errors/app-error";

export class RatingService {
  private ratingRepository = new RatingRepository();
  private reviewerRepository = new ReviewerRepository();

  async submitRating(
    reviewerId: string,
    anonymousClientId: string,
    value: number
  ) {
    const reviewer = await this.reviewerRepository.findById(reviewerId);
    if (!reviewer) {
      throw new AppError(404, "Reviewer not found");
    }
    return await this.ratingRepository.upsert(reviewerId, anonymousClientId, value);
  }

  async getRatingSummary(reviewerId: string) {
    const reviewer = await this.reviewerRepository.findById(reviewerId);
    if (!reviewer) {
      throw new AppError(404, "Reviewer not found");
    }
    const summary = await this.ratingRepository.getAggregate(reviewerId);
    return {
      averageRating:
        summary.averageRating !== null ? Math.round(summary.averageRating * 10) / 10 : null,
      ratingCount: summary.ratingCount
    };
  }
}
