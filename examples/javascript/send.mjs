const ROUTER_URL =
  process.env.ROUTER_URL ||
  "https://your-app.vercel.app/v1/notifications/send";
const API_KEY = process.env.API_KEY || "your-api-secret-key";

async function sendNotification(payload) {
  const response = await fetch(ROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const body = await response.json();
  console.log(`Status: ${response.status}`);
  console.log("Response:", JSON.stringify(body, null, 2));
  return response;
}

async function main() {
  const payload = {
    channels: ["telegram"],
    priority: "high",
    message: {
      title: "Build Failed",
      body: "Task execution failed on OpenCode instance #42.",
      parse_mode: "MarkdownV2"
    },
    metadata: {
      source_app: "opencode",
      timestamp: new Date().toISOString()
    }
  };

  const response = await sendNotification(payload);

  if (response.status >= 200 && response.status < 300) {
    console.log("Notification dispatched successfully.");
  } else {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
