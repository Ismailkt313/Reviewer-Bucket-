const STORAGE_KEY = "reviewerBucket:anonymousClientId";

export function getAnonymousClientId(): string {
  if (typeof window === "undefined") return "";

  try {
    let clientId = localStorage.getItem(STORAGE_KEY);
    if (!clientId) {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        clientId = crypto.randomUUID();
      } else {
        clientId = "anon_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      }
      localStorage.setItem(STORAGE_KEY, clientId);
    }
    return clientId;
  } catch {
    return "anonymous_fallback_client";
  }
}
