import { Schema, model, Document } from "mongoose";

export interface INotificationRead extends Document {
  notificationId: Schema.Types.ObjectId;
  clientId: string;
  createdAt: Date;
}

const notificationReadSchema = new Schema<INotificationRead>({
  notificationId: { type: Schema.Types.ObjectId, ref: "Notification", required: true },
  clientId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 7800 } // TTL: 130 minutes (7800 seconds)
});

// Compound index for fast lookup and uniqueness
notificationReadSchema.index({ clientId: 1, notificationId: 1 }, { unique: true });
notificationReadSchema.index({ createdAt: -1 });

export const NotificationReadModel = model<INotificationRead>("NotificationRead", notificationReadSchema);
