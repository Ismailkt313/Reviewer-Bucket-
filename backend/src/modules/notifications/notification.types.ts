import { Document } from "mongoose";

export type NotificationType =
  | "new_experience"
  | "community_message"
  | "reviewer_approved"
  | "reviewer_update_approved";

export interface INotification {
  type: NotificationType;
  message: string;
  senderClientId?: string;
  experienceId?: string;
  reviewerUpdateId?: string;
  reviewerId?: string;
  reviewerSlug?: string;
  createdAt: Date;
}

export interface INotificationDoc extends INotification, Document {
  _id: any;
}

export interface PublicNotification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  isRead: boolean;
  experienceId?: string;
  reviewerUpdateId?: string;
  reviewerId?: string;
  reviewerSlug?: string;
}
