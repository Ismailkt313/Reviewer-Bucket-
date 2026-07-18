import { env } from "../../config/env";

type ValidationSuccess = {
  valid: true;
  content: string;
  color: string;
  replyTo: string | null;
};
type ValidationFailure = { valid: false; error: string };
type ValidationResult = ValidationSuccess | ValidationFailure;

export function validateMessageContent(
  content: unknown,
  color: unknown,
  replyTo: unknown
): ValidationResult {
  if (typeof content !== "string") {
    return { valid: false, error: "Message content must be a string" };
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length < 2) {
    return { valid: false, error: "Message must be at least 2 characters" };
  }

  if (trimmedContent.length > env.COMMUNITY_MESSAGE_MAX_LENGTH) {
    return {
      valid: false,
      error: `Message cannot exceed ${env.COMMUNITY_MESSAGE_MAX_LENGTH} characters`
    };
  }

  if (typeof color !== "string") {
    return { valid: false, error: "Color identity must be a string" };
  }

  const trimmedColor = color.trim();
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexColorRegex.test(trimmedColor)) {
    return { valid: false, error: "Color must be a valid hex color code" };
  }

  let validatedReplyTo: string | null = null;
  if (replyTo !== undefined && replyTo !== null) {
    if (typeof replyTo !== "string") {
      return { valid: false, error: "replyTo must be a string ID" };
    }
    const trimmedReply = replyTo.trim();
    if (trimmedReply) {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(trimmedReply)) {
        return { valid: false, error: "replyTo must be a valid 24-character hex ObjectId" };
      }
      validatedReplyTo = trimmedReply;
    }
  }

  return {
    valid: true,
    content: trimmedContent,
    color: trimmedColor,
    replyTo: validatedReplyTo
  };
}
