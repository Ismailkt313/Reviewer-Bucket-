import { Document, Types } from "mongoose";

export interface ICommunityMessage {
  _id: string;
  content: string;
  color: string;
  replyTo?: string | Types.ObjectId | ICommunityMessage | null;
  anonymousClientId?: string;
  createdAt: Date;
}

export interface ICommunityMessageDoc extends Document {
  content: string;
  color: string;
  replyTo?: Types.ObjectId | ICommunityMessageDoc | null;
  anonymousClientId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InternalCommunityMessage {
  id: string;
  _id: string;
  content: string;
  message: string;
  color: string;
  replyTo?: {
    id: string;
    _id: string;
    content: string;
    message: string;
    color: string;
  } | null;
  createdAt: string;
  anonymousClientId?: string;
}

export interface PublicCommunityMessage {
  id: string;
  _id: string;
  content: string;
  message: string;
  color: string;
  replyTo?: {
    id: string;
    _id: string;
    content: string;
    message: string;
    color: string;
  } | null;
  createdAt: string;
  isMine: boolean;
}

export interface ClientToServerEvents {
  "community:message:send": (
    payload: { content?: string; message?: string; color: string; replyTo?: string | null },
    ack: (response: { success: boolean; message?: string; messageId?: string }) => void
  ) => void;
  "community:history:request": () => void;
  "community:online-count:request": () => void;
}

export interface ServerToClientEvents {
  "community:message:new": (message: PublicCommunityMessage) => void;
  "community:history": (payload: { messages: PublicCommunityMessage[] }) => void;
  "community:online-count": (payload: { count: number }) => void;
  "community:error": (payload: { message: string }) => void;
}
