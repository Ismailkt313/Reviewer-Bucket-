import { ReviewerModel } from "./reviewer.model";
import { RatingModel } from "../ratings/rating.model";
import { ExperienceModel } from "../experiences/experience.model";
import type { IReviewer } from "./reviewer.types";

export class ReviewerRepository {
  async findAll(): Promise<IReviewer[]> {
    return await ReviewerModel.find().sort({ name: 1 }).lean<IReviewer[]>();
  }

  async findAllWithStats(): Promise<any[]> {
    // 1. Fetch all reviewers sorted by name with strict projections
    const reviewers = await ReviewerModel.find()
      .select({ name: 1, code: 1, slug: 1, stacks: 1 })
      .sort({ name: 1 })
      .lean();

    // 2. Perform stats aggregation queries in parallel
    const [ratingStats, experienceStats] = await Promise.all([
      RatingModel.aggregate([
        {
          $group: {
            _id: "$reviewerId",
            averageRating: { $avg: "$value" },
            ratingCount: { $sum: 1 }
          }
        }
      ]),
      ExperienceModel.aggregate([
        {
          $group: {
            _id: "$reviewerId",
            experienceCount: { $sum: 1 },
            lastUpdated: { $max: "$createdAt" }
          }
        }
      ])
    ]);

    // 3. Build lookup maps for O(1) matching
    const ratingMap = new Map(ratingStats.map((r) => [r._id.toString(), r]));
    const experienceMap = new Map(experienceStats.map((e) => [e._id.toString(), e]));

    // 4. Assemble the decorated reviewers array
    return reviewers.map((r) => {
      const rIdStr = r._id.toString();
      const rStat = ratingMap.get(rIdStr);
      const eStat = experienceMap.get(rIdStr);

      return {
        ...r,
        stats: {
          averageRating: rStat ? Number(rStat.averageRating) : null,
          ratingCount: rStat ? Number(rStat.ratingCount) : 0,
          experienceCount: eStat ? Number(eStat.experienceCount) : 0,
          lastUpdated: eStat ? eStat.lastUpdated : null
        }
      };
    });
  }

  async findBySlug(slug: string): Promise<IReviewer | null> {
    return await ReviewerModel.findOne({ slug })
      .select({ name: 1, code: 1, slug: 1, stacks: 1 })
      .lean<IReviewer | null>();
  }

  async findById(id: string): Promise<IReviewer | null> {
    return await ReviewerModel.findById(id)
      .select({ name: 1, code: 1, slug: 1, stacks: 1 })
      .lean<IReviewer | null>();
  }

  async findByCode(code: string): Promise<IReviewer | null> {
    return await ReviewerModel.findOne({ code })
      .select({ name: 1, code: 1, slug: 1, stacks: 1 })
      .lean<IReviewer | null>();
  }

  async findByCodeExcluding(code: string, id: string): Promise<IReviewer | null> {
    return await ReviewerModel.findOne({ code, _id: { $ne: id } })
      .select({ name: 1, code: 1, slug: 1, stacks: 1 })
      .lean<IReviewer | null>();
  }

  async create(data: { name: string; code: string; slug: string; stacks: string[] }): Promise<IReviewer> {
    const doc = await ReviewerModel.create(data);
    return doc.toObject() as unknown as IReviewer;
  }

  async update(id: string, data: { name: string; code: string; slug: string; stacks: string[] }): Promise<IReviewer | null> {
    return await ReviewerModel.findByIdAndUpdate(id, data, { new: true }).lean<IReviewer | null>();
  }
}

