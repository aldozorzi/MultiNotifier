import { sendTelegram } from "./telegram.js";
import { sendWebhook } from "./webhook.js";

const handlers = {
  telegram: sendTelegram,
  webhook: sendWebhook
};

export function getHandler(channel) {
  return handlers[channel] ?? null;
}
