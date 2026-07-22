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

  async getRecentMessages(
    limit: number = 30,
    beforeId?: string
  ): Promise<{ messages: InternalCommunityMessage[]; hasMore: boolean }> {
    const query: any = {};
    if (beforeId && Types.ObjectId.isValid(beforeId)) {
      query._id = { $lt: new Types.ObjectId(beforeId) };
    }

    // Fetch one extra item to check if there are more older messages
    const docs = await CommunityMessageModel.find(query)
      .populate({
        path: "replyTo",
        select: "content color _id"
      })
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = docs.length > limit;
    const resultDocs = hasMore ? docs.slice(0, limit) : docs;
    const reversed = resultDocs.reverse();

    const messages = reversed.map((doc: any) => ({
      id: doc._id.toString(),
      _id: doc._id.toString(),
      content: doc.content,
      message: doc.content,
      color: doc.color || "#808080",
      replyTo: doc.replyTo
        ? {
            id: doc.replyTo._id.toString(),
            _id: doc.replyTo._id.toString(),
            content: doc.replyTo.content,
            message: doc.replyTo.content,
            color: doc.replyTo.color || "#808080"
          }
        : null,
      createdAt: doc.createdAt.toISOString(),
      anonymousClientId: doc.anonymousClientId
    }));

    return { messages, hasMore };
  }
}
