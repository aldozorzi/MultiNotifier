export async function sendTelegram(message, metadata) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    const error = new Error(
      "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be configured"
    );
    error.code = "SERVER_CONFIG";
    throw error;
  }

  const pieces = [];
  if (message.title) {
    pieces.push(message.title);
  }
  if (message.body) {
    pieces.push(message.body);
  }
  const text = pieces.join("\n");

  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown'
  };

  if (message.parse_mode) {
    payload.parse_mode = message.parse_mode;
  }

  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const error = new Error(
      `Telegram API rejected the request (${response.status}): ${errorBody}`
    );
    error.code = "DOWNSTREAM";
    error.status = response.status;
    throw error;
  }

  return response.json();
}
