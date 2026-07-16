import { Document, Types } from "mongoose";

export interface IExperience {
  _id: string;
  reviewerId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExperienceDoc extends Document {
  reviewerId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
