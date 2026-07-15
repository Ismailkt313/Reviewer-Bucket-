import { Types, FilterQuery } from "mongoose";
import { ExperienceModel } from "./experience.model";
import type { IExperience, IExperienceDoc } from "./experience.types";

export function serializeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}_${id}`).toString("base64");
}

export function deserializeCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    const [dateStr, id] = decoded.split("_");
    const date = new Date(dateStr);
    if (!isNaN(date.getTime()) && id) {
      return { createdAt: date, id };
    }
    return null;
  } catch {
    return null;
  }
}

export class ExperienceRepository {
  async create(reviewerId: string, content: string): Promise<IExperience> {
    const doc = await ExperienceModel.create({
      reviewerId: new Types.ObjectId(reviewerId),
      content,
      status: "pending"
    });
    const obj = doc.toObject();
    return {
      _id: obj._id.toString(),
      reviewerId: obj.reviewerId.toString(),
      content: obj.content,
      status: obj.status,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    };
  }

  async findApproved(
    reviewerId: string,
    limit: number,
    cursor?: string
  ): Promise<IExperience[]> {
    const query: FilterQuery<IExperienceDoc> = {
      reviewerId: new Types.ObjectId(reviewerId),
      status: "approved"
    };

    if (cursor) {
      const parsed = deserializeCursor(cursor);
      if (parsed) {
        query.$or = [
          { createdAt: { $lt: parsed.createdAt } },
          {
            createdAt: parsed.createdAt,
            _id: { $lt: new Types.ObjectId(parsed.id) }
          }
        ];
      }
    }

    return await ExperienceModel.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean<IExperience[]>();
  }
}
