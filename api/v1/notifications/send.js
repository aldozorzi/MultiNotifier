import { verifyApiKey } from "../../../lib/auth.js";
import { validatePayload } from "../../../lib/validate.js";
import { getHandler } from "../../../lib/providers/index.js";
import { HTTP } from "../../../lib/constants.js";

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function extractApiKey(request) {
  const authorization = request.headers.get("authorization");
  if (authorization && typeof authorization === "string") {
    const parts = authorization.trim().split(/\s+/);
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      return parts[1];
    }
  }
  return request.headers.get("x-api-key");
}

export async function POST(request) {
  try {
    const apiKey = extractApiKey(request);
    if (!apiKey) {
      return jsonResponse(HTTP.UNAUTHORIZED, {
        error: "Unauthorized",
        message: "Missing API key. Provide it via Authorization: Bearer <API_KEY> or x-api-key header."
      });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse(HTTP.UNPROCESSABLE, {
        error: "Unprocessable Entity",
        message: "Request body must be valid JSON"
      });
    }

    let keyValid;
    try {
      keyValid = verifyApiKey(apiKey);
    } catch (err) {
      if (err && err.code === "SERVER_CONFIG") {
        return jsonResponse(HTTP.BAD_GATEWAY, {
          error: "Bad Gateway",
          message: err.message
        });
      }
      throw err;
    }
    if (!keyValid) {
      return jsonResponse(HTTP.UNAUTHORIZED, {
        error: "Unauthorized",
        message: "Invalid API key"
      });
    }

    const validationError = validatePayload(payload);
    if (validationError) {
      return jsonResponse(HTTP.UNPROCESSABLE, {
        error: "Unprocessable Entity",
        message: validationError
      });
    }

    const metadata = {
      ...(payload.metadata || {}),
      priority: payload.priority || "normal"
    };

    const failures = [];
    let dispatched = 0;

    for (const channel of payload.channels) {
      const handler = getHandler(channel);
      if (!handler) {
        failures.push({ channel, error: "unsupported channel" });
        continue;
      }
      try {
        await handler(payload.message, metadata);
        dispatched += 1;
      } catch (err) {
        if (err && err.code === "DOWNSTREAM") {
          failures.push({ channel, error: "downstream rejected" });
        } else {
          failures.push({ channel, error: "server configuration error" });
        }
      }
    }

    const responseBody = { accepted: true, dispatched };
    if (failures.length > 0) {
      responseBody.failures = failures;
    }

    return jsonResponse(HTTP.ACCEPTED, responseBody);
  } catch (err) {
    if (err && err.code === "SERVER_CONFIG") {
      return jsonResponse(HTTP.BAD_GATEWAY, {
        error: "Bad Gateway",
        message: err.message
      });
    }
    console.error("Unhandled error in /v1/notifications/send:", err);
    return jsonResponse(HTTP.BAD_GATEWAY, {
      error: "Bad Gateway",
      message: "Unexpected server error while dispatching notification"
    });
  }
}
