import { CommunityRepository } from "./community.repository";
import { validateMessageContent } from "./community.validation";
import { env } from "../../config/env";
import type { InternalCommunityMessage } from "./community.types";

export class CommunityService {
  private repository = new CommunityRepository();

  async submitMessage(
    content: unknown,
    color: unknown,
    replyTo: unknown,
    anonymousClientId?: string
  ): Promise<
    | { success: true; message: InternalCommunityMessage }
    | { success: false; error: string }
  > {
    const validation = validateMessageContent(content, color, replyTo);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const message = await this.repository.create(
        validation.content,
        validation.color,
        validation.replyTo,
        anonymousClientId
      );
      return { success: true, message };
    } catch (err: any) {
      console.error("[COMMUNITY_SERVICE] Error saving message:", err);
      return { success: false, error: "Failed to save message" };
    }
  }

  async getRecentHistory(): Promise<InternalCommunityMessage[]> {
    return this.repository.getRecentMessages(env.COMMUNITY_HISTORY_LIMIT);
  }
}
