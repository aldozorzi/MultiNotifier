import { SUPPORTED_CHANNELS, PRIORITIES, PARSE_MODES } from "./constants.js";

export function validatePayload(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object";
  }

  if (!Array.isArray(body.channels) || body.channels.length === 0) {
    return "channels must be a non-empty array";
  }

  for (const channel of body.channels) {
    if (typeof channel !== "string" || !SUPPORTED_CHANNELS.has(channel)) {
      return `Unsupported channel: ${String(channel)}`;
    }
  }

  if (body.priority !== undefined) {
    if (typeof body.priority !== "string" || !PRIORITIES.has(body.priority)) {
      return "priority must be one of: low, normal, high";
    }
  }

  const message = body.message;
  if (message === null || typeof message !== "object" || Array.isArray(message)) {
    return "message must be an object";
  }

  const bodyText = message.body;
  if (typeof bodyText !== "string" || bodyText.length === 0) {
    return "message.body is required and must be a non-empty string";
  }

  if (message.title !== undefined) {
    if (typeof message.title !== "string") {
      return "message.title must be a string";
    }
  }

  if (message.parse_mode !== undefined) {
    if (typeof message.parse_mode !== "string" || !PARSE_MODES.has(message.parse_mode)) {
      return "message.parse_mode must be one of: MarkdownV2, HTML, Markdown";
    }
  }

  return null;
}
