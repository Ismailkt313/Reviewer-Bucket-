import { Types } from "mongoose";
import { ReviewerUpdateRequestModel, IReviewerUpdateRequestDoc } from "./reviewer-update-request.model";

export class ReviewerUpdateRequestRepository {
  async create(input: {
    reviewerId: string;
    proposedData: {
      name?: string;
      code?: string;
      stacks?: string[];
    };
  }): Promise<IReviewerUpdateRequestDoc> {
    return await ReviewerUpdateRequestModel.create({
      reviewerId: new Types.ObjectId(input.reviewerId),
      proposedData: input.proposedData,
      status: "PENDING"
    });
  }

  async findPendingByReviewerId(reviewerId: string): Promise<IReviewerUpdateRequestDoc | null> {
    return await ReviewerUpdateRequestModel.findOne({
      reviewerId: new Types.ObjectId(reviewerId),
      status: "PENDING"
    }).exec();
  }

  async findById(id: string): Promise<IReviewerUpdateRequestDoc | null> {
    return await ReviewerUpdateRequestModel.findById(id).exec();
  }

  async findAll(): Promise<IReviewerUpdateRequestDoc[]> {
    return await ReviewerUpdateRequestModel.find()
      .populate("reviewerId", "name code slug")
      .sort({ requestedAt: -1 })
      .exec();
  }

  async update(
    id: string,
    update: Partial<IReviewerUpdateRequestDoc>
  ): Promise<IReviewerUpdateRequestDoc | null> {
    return await ReviewerUpdateRequestModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }
}
