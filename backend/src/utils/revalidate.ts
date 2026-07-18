import { env } from "../config/env";

export async function triggerRevalidate(tag: string): Promise<void> {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    console.warn("[REVALIDATION] Skipping webhook; REVALIDATION_SECRET environment variable is not defined.");
    return;
  }

  const url = `${env.CLIENT_URL}/api/revalidate?tag=${tag}`;
  
  // Asynchronous non-blocking fetch trigger
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-secret": secret,
    },
  })
    .then((res) => {
      if (!res.ok) {
        console.error(`[REVALIDATION] Webhook returned status code ${res.status}`);
      } else {
        console.log(`[REVALIDATION] Successfully purged cache tag: ${tag}`);
      }
    })
    .catch((err) => {
      console.error("[REVALIDATION] Webhook connection error:", err);
    });
}
