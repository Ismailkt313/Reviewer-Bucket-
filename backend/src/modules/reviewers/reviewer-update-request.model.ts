import { Schema, model, Document, Types } from "mongoose";

export interface IReviewerUpdateRequestDoc extends Document {
  reviewerId: Types.ObjectId;
  proposedData: {
    name?: string;
    code?: string;
    stacks?: string[];
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewerUpdateRequestSchema = new Schema<IReviewerUpdateRequestDoc>(
  {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "Reviewer",
      required: true,
      index: true
    },
    proposedData: {
      name: {
        type: String,
        trim: true,
        maxlength: 100
      },
      code: {
        type: String,
        trim: true
      },
      stacks: {
        type: [String],
        default: undefined
      }
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true
    },
    reviewedAt: {
      type: Date,
      required: false
    },
    reviewedBy: {
      type: String,
      required: false,
      trim: true
    },
    rejectionReason: {
      type: String,
      required: false,
      trim: true
    }
  },
  {
    timestamps: { createdAt: "requestedAt", updatedAt: true }
  }
);

export const ReviewerUpdateRequestModel = model<IReviewerUpdateRequestDoc>(
  "ReviewerUpdateRequest",
  reviewerUpdateRequestSchema,
  "reviewerUpdateRequests" // enforce specific collection name requested by the user
);
