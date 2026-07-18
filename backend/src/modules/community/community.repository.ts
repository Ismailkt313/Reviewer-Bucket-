import { Types } from "mongoose";
import { CommunityMessageModel } from "./community-message.model";
import type { InternalCommunityMessage } from "./community.types";

export class CommunityRepository {
  async create(
    content: string,
    color: string,
    replyTo: string | null,
    anonymousClientId?: string
  ): Promise<InternalCommunityMessage> {
    const doc = await CommunityMessageModel.create({
      content,
      color,
      replyTo: replyTo ? new Types.ObjectId(replyTo) : null,
      anonymousClientId
    });

    const populated = await doc.populate({
      path: "replyTo",
      select: "content color _id"
    });

    const obj = populated.toObject();
    const replyToObj = obj.replyTo as any;

    return {
      id: obj._id.toString(),
      _id: obj._id.toString(),
      content: obj.content,
      message: obj.content,
      color: obj.color,
      replyTo: replyToObj ? {
        id: replyToObj._id.toString(),
        _id: replyToObj._id.toString(),
        content: replyToObj.content,
        message: replyToObj.content,
        color: replyToObj.color || "#808080"
      } : null,
      createdAt: obj.createdAt.toISOString(),
      anonymousClientId: obj.anonymousClientId
    };
  }

  async getRecentMessages(limit: number): Promise<InternalCommunityMessage[]> {
    const docs = await CommunityMessageModel.find()
      .populate({
        path: "replyTo",
        select: "content color _id"
      })
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .lean();

    const reversed = docs.reverse();

    return reversed.map((doc: any) => ({
      id: doc._id.toString(),
      _id: doc._id.toString(),
      content: doc.content,
      message: doc.content,
      color: doc.color || "#808080",
      replyTo: doc.replyTo ? {
        id: doc.replyTo._id.toString(),
        _id: doc.replyTo._id.toString(),
        content: doc.replyTo.content,
        message: doc.replyTo.content,
        color: doc.replyTo.color || "#808080"
      } : null,
      createdAt: doc.createdAt.toISOString(),
      anonymousClientId: doc.anonymousClientId
    }));
  }
}
