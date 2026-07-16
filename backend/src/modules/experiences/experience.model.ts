import { Schema, model } from "mongoose";
import type { IExperienceDoc } from "./experience.types.js";

const experienceSchema = new Schema<IExperienceDoc>(
  {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "Reviewer",
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

experienceSchema.index({ reviewerId: 1, createdAt: -1, _id: -1 });

export const ExperienceModel = model<IExperienceDoc>("Experience", experienceSchema);
