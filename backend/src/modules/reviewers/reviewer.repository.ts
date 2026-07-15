import { ReviewerModel } from "./reviewer.model";
import type { IReviewer } from "./reviewer.types";

export class ReviewerRepository {
  async findAll(): Promise<IReviewer[]> {
    return await ReviewerModel.find().lean<IReviewer[]>();
  }

  async findBySlug(slug: string): Promise<IReviewer | null> {
    return await ReviewerModel.findOne({ slug }).lean<IReviewer | null>();
  }

  async findById(id: string): Promise<IReviewer | null> {
    return await ReviewerModel.findById(id).lean<IReviewer | null>();
  }
}
