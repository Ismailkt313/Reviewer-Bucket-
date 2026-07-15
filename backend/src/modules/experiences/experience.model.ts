import { Schema, model } from "mongoose";
import type { IExperienceDoc } from "./experience.types";

const experienceSchema = new Schema<IExperienceDoc>(
  {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "Reviewer",
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const ExperienceModel = model<IExperienceDoc>("Experience", experienceSchema);
