export async function sendWebhook(message, metadata) {
  const url = process.env.WEBHOOK_URL;
  if (!url) {
    const error = new Error("WEBHOOK_URL must be configured");
    error.code = "SERVER_CONFIG";
    throw error;
  }

  const payload = {
    priority: metadata.priority,
    message,
    metadata
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok || response.status < 200 || response.status >= 300) {
    const errorBody = await response.text();
    const error = new Error(
      `Webhook rejected the request (${response.status}): ${errorBody}`
    );
    error.code = "DOWNSTREAM";
    error.status = response.status;
    throw error;
  }

  return { ok: true };
}
