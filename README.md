# Notification Router Service

A centralized gateway written in JavaScript that delivers notification messages
from various client applications (Chrome extensions, automated coding agents
like OpenCode) to multiple downstream notification providers (Telegram Bot API,
Webhooks, email services).

The service is designed to run on **Vercel** with no database required.

## Features

- **API key authentication** — clients authenticate with a shared secret.
- **Unified routing** — dispatch to one or more channels per request.
- **Decoupled architecture** — clients are isolated from downstream provider changes.
- **Providers** — `telegram` and `webhook` included; easily extensible.

## Architecture

```
Client (OpenCode, extension)  --API Key-->  Router Service  --routes-->  Telegram / Webhook / ...
```

## Deployment

1. Install the Vercel CLI and link the project:
   
   ```bash
   npm i -g vercel
   vercel
   ```

2. Configure environment variables in the Vercel dashboard (see `.env.example`):
   
   | Variable             | Required     | Description                                |
   | -------------------- | ------------ | ------------------------------------------ |
   | `API_SECRET_KEY`     | Yes          | Shared secret used to authenticate clients |
   | `TELEGRAM_BOT_TOKEN` | For Telegram | Telegram bot token                         |
   | `TELEGRAM_CHAT_ID`   | For Telegram | Target chat/group id                       |
   | `WEBHOOK_URL`        | For Webhook  | Downstream webhook URL                     |

3. Deploy:
   
   ```bash
   vercel --prod
   ```

## API

### `POST /v1/notifications/send`

Request headers:

| Header          | Type   | Description            |
| --------------- | ------ | ---------------------- |
| `Authorization` | String | `Bearer <API_KEY>`     |
| `x-api-key`     | String | Alternative: `API_KEY` |
| `Content-Type`  | String | `application/json`     |

Request body:

```json
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
```

Response codes:

| Status | Reason        | Description                                                      |
| ------ | ------------- | ---------------------------------------------------------------- |
| `202`  | Accepted      | Validated and dispatched                                         |
| `401`  | Unauthorized  | Missing or invalid API key                                       |
| `422`  | Unprocessable | Invalid body or unsupported channel                              |
| `502`  | Bad Gateway   | Downstream provider rejected the request or server misconfigured |

## Authenticating Clients

Clients authenticate by sending the shared secret (the value of the
`API_SECRET_KEY` environment variable) in the `Authorization` header:

```
Authorization: Bearer <API_KEY>
```

Or, alternatively, via the `x-api-key` header:

```
x-api-key: <API_KEY>
```

The server accepts the request only if the presented key exactly matches
`API_SECRET_KEY`. Keep the key secret and rotate it periodically.

## Examples

Ready-to-run JavaScript and Bash integrations live in the [`examples`](./examples)
folder. See [`examples/README.md`](./examples/README.md) for usage.

## Extension

To extend multinotifier and to add a new notification channel, simply ask your agent ;)

## Local Development

```bash
npm install
vercel dev
```

Run tests:

```bash
npm test
```
