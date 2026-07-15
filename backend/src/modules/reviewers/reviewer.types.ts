import { Document } from "mongoose";

export interface IReviewer {
  _id: string;
  name: string;
  code: string;
  slug: string;
  stacks: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewerDoc extends Document {
  name: string;
  code: string;
  slug: string;
  stacks: string[];
  createdAt: Date;
  updatedAt: Date;
}
