import { Document, Types } from "mongoose";

export type ExperienceStatus = "pending" | "approved" | "rejected";

export interface IExperience {
  _id: string;
  reviewerId: string;
  content: string;
  status: ExperienceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExperienceDoc extends Document {
  reviewerId: Types.ObjectId;
  content: string;
  status: ExperienceStatus;
  createdAt: Date;
  updatedAt: Date;
}
