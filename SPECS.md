# Notification Router Service Specification

## 1. Overview

The Notification Router Service acts as a centralized gateway wriiten in JavaScript for delivering notification messages from various client applications (e.g., Chrome extensions, automated coding agents like OpenCode) to multiple downstream notification providers (e.g., Telegram Bot API, Webhooks, email services).

Target platform is Vercel, with perstistence. If you need a database, use Turso, but if you can avoid, it's better.

## 2. Architecture & Design Principles

* **Decoupled Architecture:** Client applications interact exclusively with the Notification Router Service, isolating them from downstream provider API changes or replacements.
* **Unified Routing Engine:** Messages are dynamically routed to one or more configured channels based on payload metadata.
* **End-to-End Security:** Authentication relies on standard, secure token-based verification without compromising security mechanisms at the gateway level.

---

## 3. Authentication & Authorization

### 3.1 JSON Web Token (JWT) Verification

* Clients authenticate requests by passing a signed JWT in the HTTP Authorization header:
  `Authorization: Bearer <JWT_TOKEN>`
* Tokens must be signed using an asymmetric algorithm (`RS256` or `EdDSA`).
* The Router Service verifies the JWT signature using the public key corresponding to the registered client.

### 3.2 Token Payload Claims

Every JWT presented to the service must contain the following claims:

{
  "iss": "opencode-agent",
  "sub": "notification-client",
  "aud": "notification-router-service",
  "iat": 1788864000,
  "exp": 1788864300,
  "jti": "d3b07384-d113-42a4-959b-166160e1ef30"
}

* `iss` (Issuer): Client identifier.
* `aud` (Audience): Must equal `notification-router-service`.
* `exp` (Expiration Time): Short-lived validity (recommended maximum: 5 minutes).

---

## 4. API Interface Specification

### 4.1 Dispatch Notification Endpoint

* **Endpoint:** `POST /v1/notifications/send`
* **Content-Type:** `application/json`

#### Request Headers

| Header Name     | Type   | Description                          |
| --------------- | ------ | ------------------------------------ |
| `Authorization` | String | Bearer token format (`Bearer <JWT>`) |
| `Content-Type`  | String | Must be `application/json`           |

#### Request Payload

{
  "channels": ["telegram"],
  "priority": "high",
  "message": {
    "title": "Build Failed",
    "body": "Task execution failed on OpenCode instance #42.",
    "parse_mode": "MarkdownV2"
  },
  "metadata": {
    "source_app": "opencode",
    "timestamp": "2026-09-08T10:41:00Z"
  }
}

#### Field Definitions

* `channels` (Array of Strings): Required. List of downstream providers (e.g., `["telegram"]`, `["telegram", "webhook"]`).
* `priority` (String): Optional. Message priority (`low`, `normal`, `high`).
* `message.title` (String): Optional message title.
* `message.body` (String): Required message content.
* `message.parse_mode` (String): Optional text formatting mode (`MarkdownV2`, `HTML`).

---

## 5. Provider Integration Mechanics

### 5.1 Telegram Provider Handler

* **Downstream Target:** `https://api.telegram.org/bot<BOT_TOKEN>/sendMessage`
* **Credentials Storage:** Telegram Bot Tokens and target `chat_id` parameters are stored securely in environment variables or a secrets store accessible only by the Router Service.
* **Payload Transformation:** The Router Service maps incoming generic notification objects directly into Telegram API payload parameters:

{
  "chat_id": "YOUR_CHAT_ID",
  "text": "*Build Failed*\nTask execution failed on OpenCode instance #42.",
  "parse_mode": "MarkdownV2"
}

---

## 6. Response Codes & Error Handling

| HTTP Status Code           | Reason           | Description                                                          |
| -------------------------- | ---------------- | -------------------------------------------------------------------- |
| `202 Accepted`             | Processing       | The notification request was validated and queued for dispatch.      |
| `401 Unauthorized`         | Invalid Token    | Missing, expired, or improperly signed JWT.                          |
| `422 Unprocessable Entity` | Schema Error     | Request body missing required fields or target channels unsupported. |
| `502 Bad Gateway`          | Downstream Error | The destination provider API (e.g., Telegram) rejected the request.  |

## 7. Integration examples

Provide a folder examples with javascript and bash integrations.