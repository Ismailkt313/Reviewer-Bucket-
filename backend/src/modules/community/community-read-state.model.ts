import { Schema, model, Document } from "mongoose";

export interface ICommunityReadState extends Document {
  clientId: string;
  lastReadAt: Date;
}

const communityReadStateSchema = new Schema<ICommunityReadState>({
  clientId: { type: String, required: true, unique: true },
  lastReadAt: { type: Date, default: () => new Date() }
});

communityReadStateSchema.index({ clientId: 1 });

export const CommunityReadStateModel = model<ICommunityReadState>("CommunityReadState", communityReadStateSchema);
