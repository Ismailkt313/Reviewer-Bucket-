import { Types } from "mongoose";
import { RatingModel } from "./rating.model";
import type { IRating } from "./rating.types";
import { AppError } from "../../errors/app-error";

export class RatingRepository {
  async upsert(
    reviewerId: string,
    anonymousClientId: string,
    value: number
  ): Promise<IRating> {
    const filter = {
      reviewerId: new Types.ObjectId(reviewerId),
      anonymousClientId
    };
    const update = {
      $set: { value }
    };
    const options = {
      upsert: true,
      new: true,
      runValidators: true
    };
    try {
      return (await RatingModel.findOneAndUpdate(filter, update, options).lean<IRating>()) as IRating;
    } catch (error) {
      const err = error as { code?: number };
      if (err && err.code === 11000) {
        throw new AppError(409, "Duplicate rating submission detected");
      }
      throw error;
    }
  }

  async getAggregate(reviewerId: string) {
    const stats = await RatingModel.aggregate([
      {
        $match: {
          reviewerId: new Types.ObjectId(reviewerId)
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$value" },
          ratingCount: { $sum: 1 }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        averageRating: null,
        ratingCount: 0
      };
    }

    return {
      averageRating: Number(stats[0].averageRating),
      ratingCount: Number(stats[0].ratingCount)
    };
  }
}
