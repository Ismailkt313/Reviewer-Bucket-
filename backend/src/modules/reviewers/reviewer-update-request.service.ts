import { ReviewerUpdateRequestRepository } from "./reviewer-update-request.repository";
import { ReviewerRepository } from "./reviewer.repository";
import { ReviewerService } from "./reviewer.service";
import { AppError } from "../../errors/app-error";
import type { IReviewerUpdateRequestDoc } from "./reviewer-update-request.model";

export class ReviewerUpdateRequestService {
  private requestRepository = new ReviewerUpdateRequestRepository();
  private reviewerRepository = new ReviewerRepository();
  private reviewerService = new ReviewerService();

  async getAllRequests(): Promise<IReviewerUpdateRequestDoc[]> {
    return await this.requestRepository.findAll();
  }

  async getRequestById(id: string): Promise<IReviewerUpdateRequestDoc> {
    const request = await this.requestRepository.findById(id);
    if (!request) {
      throw new AppError(404, "Update request not found.");
    }
    return request;
  }

  async submitUpdateRequest(input: {
    reviewerId: string;
    name: string;
    code: string;
    stacks: string[];
  }): Promise<IReviewerUpdateRequestDoc> {
    // 1. Verify target reviewer exists
    const targetReviewer = await this.reviewerRepository.findById(input.reviewerId);
    if (!targetReviewer) {
      throw new AppError(404, "Reviewer not found.");
    }

    // 2. Check if a pending update request already exists for this reviewer
    const pendingRequest = await this.requestRepository.findPendingByReviewerId(input.reviewerId);
    if (pendingRequest) {
      throw new AppError(409, "An update request for this reviewer is already under review.");
    }

    // 3. Compute proposed changes (only edited fields)
    const proposedData: {
      name?: string;
      code?: string;
      stacks?: string[];
    } = {};

    const normalizedName = input.name.trim().replace(/\s+/g, " ");
    const normalizedCode = input.code.replace(/[\s-]/g, "").toUpperCase();
    const normalizedStacks = input.stacks.map((s) => s.trim()).filter(Boolean);

    let hasChanges = false;

    if (normalizedName !== targetReviewer.name) {
      proposedData.name = normalizedName;
      hasChanges = true;
    }

    if (normalizedCode !== targetReviewer.code) {
      proposedData.code = normalizedCode;
      hasChanges = true;
    }

    // Compare stacks arrays
    const currentStacks = targetReviewer.stacks || [];
    const stacksChanged =
      normalizedStacks.length !== currentStacks.length ||
      normalizedStacks.some((stack, idx) => stack !== currentStacks[idx]);

    if (stacksChanged) {
      proposedData.stacks = normalizedStacks;
      hasChanges = true;
    }

    if (!hasChanges) {
      throw new AppError(400, "No changes were detected in the requested update.");
    }

    // 4. Create the update request
    return await this.requestRepository.create({
      reviewerId: input.reviewerId,
      proposedData
    });
  }

  async approveUpdateRequest(id: string, reviewedBy?: string): Promise<IReviewerUpdateRequestDoc> {
    const request = await this.getRequestById(id);
    if (request.status !== "PENDING") {
      throw new AppError(400, "This update request has already been reviewed.");
    }

    const targetReviewer = await this.reviewerRepository.findById(request.reviewerId.toString());
    if (!targetReviewer) {
      // Auto-reject request if the reviewer was deleted in the meantime
      await this.requestRepository.update(id, {
        status: "REJECTED",
        rejectionReason: "Target reviewer no longer exists.",
        reviewedAt: new Date(),
        reviewedBy: reviewedBy || "Admin"
      });
      throw new AppError(404, "Target reviewer not found.");
    }

    // Merge proposed changes into the existing reviewer
    const mergedName = request.proposedData.name !== undefined ? request.proposedData.name : targetReviewer.name;
    const mergedCode = request.proposedData.code !== undefined ? request.proposedData.code : targetReviewer.code;
    const mergedStacks = request.proposedData.stacks !== undefined ? request.proposedData.stacks : targetReviewer.stacks;

    // Apply via ReviewerService (handles duplicate code validation and updates slug)
    await this.reviewerService.updateReviewer(request.reviewerId.toString(), {
      name: mergedName,
      code: mergedCode,
      stacks: mergedStacks
    });

    const oldCode = targetReviewer.code;
    const oldName = targetReviewer.name;

    // Mark request as approved
    const updated = await this.requestRepository.update(id, {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedBy: reviewedBy || "Admin"
    });

    if (!updated) {
      throw new AppError(500, "Failed to update the request status.");
    }

    // Trigger reviewer update approved notification asynchronously
    import("../notifications/notification.service.js")
      .then(({ notificationService }) => {
        notificationService.createNotification(
          "reviewer_update_approved",
          `Reviewer updated: ${oldCode} - ${oldName} → ${mergedCode} - ${mergedName}`,
          undefined,
          {
            reviewerUpdateId: request._id.toString(),
            reviewerId: targetReviewer._id.toString(),
            reviewerSlug: targetReviewer.slug
          }
        );
      })
      .catch((err) => {
        console.error("Failed to create reviewer update approved notification:", err);
      });

    return updated;
  }

  async rejectUpdateRequest(
    id: string,
    rejectionReason?: string,
    reviewedBy?: string
  ): Promise<IReviewerUpdateRequestDoc> {
    const request = await this.getRequestById(id);
    if (request.status !== "PENDING") {
      throw new AppError(400, "This update request has already been reviewed.");
    }

    const updated = await this.requestRepository.update(id, {
      status: "REJECTED",
      rejectionReason: rejectionReason || undefined,
      reviewedAt: new Date(),
      reviewedBy: reviewedBy || "Admin"
    });

    if (!updated) {
      throw new AppError(500, "Failed to update the request status.");
    }

    return updated;
  }
}
