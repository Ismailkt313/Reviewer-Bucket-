import { ExperienceRepository, serializeCursor } from "./experience.repository";
import { ReviewerRepository } from "../reviewers/reviewer.repository";
import { AppError } from "../../errors/app-error";

export class ExperienceService {
  private experienceRepository = new ExperienceRepository();
  private reviewerRepository = new ReviewerRepository();

  async submitExperience(reviewerId: string, content: string) {
    const reviewer = await this.reviewerRepository.findById(reviewerId);
    if (!reviewer) {
      throw new AppError(404, "Reviewer not found");
    }
    return await this.experienceRepository.create(reviewerId, content);
  }

  async getApprovedExperiences(reviewerId: string, limit: number, cursor?: string) {
    const reviewer = await this.reviewerRepository.findById(reviewerId);
    if (!reviewer) {
      throw new AppError(404, "Reviewer not found");
    }

    const list = await this.experienceRepository.findApproved(reviewerId, limit, cursor);
    const hasMore = list.length > limit;
    const sliced = hasMore ? list.slice(0, limit) : list;

    let nextCursor: string | null = null;
    if (sliced.length > 0) {
      const last = sliced[sliced.length - 1];
      nextCursor = hasMore ? serializeCursor(last.createdAt, last._id.toString()) : null;
    }

    const reversed = [...sliced].reverse();

    return {
      experiences: reversed,
      nextCursor,
      hasMore
    };
  }
}
