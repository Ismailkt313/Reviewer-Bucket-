import { env } from "../../config/env";

type ValidationSuccess = { valid: true; content: string };
type ValidationFailure = { valid: false; error: string };
type ValidationResult = ValidationSuccess | ValidationFailure;

export function validateMessageContent(content: unknown): ValidationResult {
  if (typeof content !== "string") {
    return { valid: false, error: "Message content must be a string" };
  }

  const trimmed = content.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: "Message must be at least 2 characters" };
  }

  if (trimmed.length > env.COMMUNITY_MESSAGE_MAX_LENGTH) {
    return {
      valid: false,
      error: `Message cannot exceed ${env.COMMUNITY_MESSAGE_MAX_LENGTH} characters`
    };
  }

  return { valid: true, content: trimmed };
}
