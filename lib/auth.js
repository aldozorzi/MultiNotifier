export function verifyApiKey(token) {
  const expected = process.env.API_SECRET_KEY;
  if (!expected) {
    const error = new Error("API_SECRET_KEY is not configured");
    error.code = "SERVER_CONFIG";
    throw error;
  }
  return typeof token === "string" && token.length > 0 && token === expected;
}
