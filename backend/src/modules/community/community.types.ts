import { Document } from "mongoose";

export interface ICommunityMessage {
  _id: string;
  content: string;
  createdAt: Date;
}

export interface ICommunityMessageDoc extends Document {
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicCommunityMessage {
  id: string;
  content: string;
  createdAt: string;
}

export interface ClientToServerEvents {
  "community:message:send": (
    payload: { content: string },
    ack: (response: { success: boolean; message?: string }) => void
  ) => void;
  "community:history:request": () => void;
}

export interface ServerToClientEvents {
  "community:message:new": (message: PublicCommunityMessage) => void;
  "community:history": (payload: { messages: PublicCommunityMessage[] }) => void;
  "community:online-count": (payload: { count: number }) => void;
  "community:error": (payload: { message: string }) => void;
}
