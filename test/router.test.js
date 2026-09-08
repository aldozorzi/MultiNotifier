import { test } from "node:test";
import assert from "node:assert/strict";
import { validatePayload } from "../lib/validate.js";
import { verifyApiKey } from "../lib/auth.js";

test("validatePayload accepts a valid payload", () => {
  const payload = {
    channels: ["telegram"],
    priority: "high",
    message: {
      title: "Build Failed",
      body: "Task execution failed.",
      parse_mode: "MarkdownV2"
    },
    metadata: {}
  };
  assert.equal(validatePayload(payload), null);
});

test("validatePayload rejects missing body", () => {
  const payload = {
    channels: ["telegram"],
    message: { title: "No body here" }
  };
  assert.match(validatePayload(payload), /message.body is required/);
});

test("validatePayload rejects empty channels", () => {
  const payload = { channels: [], message: { body: "hi" } };
  assert.match(validatePayload(payload), /channels/);
});

test("validatePayload rejects unsupported channel", () => {
  const payload = { channels: ["slack"], message: { body: "hi" } };
  assert.match(validatePayload(payload), /Unsupported channel/);
});

test("validatePayload rejects bad priority", () => {
  const payload = { channels: ["telegram"], priority: "urgent", message: { body: "hi" } };
  assert.match(validatePayload(payload), /priority/);
});

test("verifyApiKey accepts a matching key", () => {
  process.env.API_SECRET_KEY = "super-secret-key";
  assert.equal(verifyApiKey("super-secret-key"), true);
  delete process.env.API_SECRET_KEY;
});

test("verifyApiKey rejects a wrong key", () => {
  process.env.API_SECRET_KEY = "super-secret-key";
  assert.equal(verifyApiKey("wrong-key"), false);
  delete process.env.API_SECRET_KEY;
});

test("verifyApiKey throws when not configured", () => {
  delete process.env.API_SECRET_KEY;
  assert.throws(() => verifyApiKey("anything"), (err) => err.code === "SERVER_CONFIG");
});
