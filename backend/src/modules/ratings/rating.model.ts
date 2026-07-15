import { Schema, model } from "mongoose";
import type { IRatingDoc } from "./rating.types";

const ratingSchema = new Schema<IRatingDoc>(
  {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "Reviewer",
      required: true,
      index: true
    },
    anonymousClientId: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

ratingSchema.index({ reviewerId: 1, anonymousClientId: 1 }, { unique: true });

export const RatingModel = model<IRatingDoc>("Rating", ratingSchema);
