import { Document, Types } from "mongoose";

export interface IRating {
  _id: string;
  reviewerId: string;
  anonymousClientId: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRatingDoc extends Document {
  reviewerId: Types.ObjectId;
  anonymousClientId: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}
