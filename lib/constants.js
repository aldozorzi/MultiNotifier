export const SUPPORTED_CHANNELS = new Set(["telegram", "webhook"]);

export const PRIORITIES = new Set(["low", "normal", "high"]);

export const PARSE_MODES = new Set(["MarkdownV2", "HTML", "Markdown"]);

export const HTTP = {
  ACCEPTED: 202,
  BAD_GATEWAY: 502,
  UNAUTHORIZED: 401,
  UNPROCESSABLE: 422
};
