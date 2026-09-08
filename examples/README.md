# Notification Router Service — Integration Examples

This folder contains ready-to-run examples showing how a client application
(e.g., a Chrome extension or an automated coding agent like OpenCode) sends
notifications to the Router Service.

## Prerequisites

1. Provision the Router Service on Vercel and set the following environment
   variables:

   - `API_SECRET_KEY` — the shared secret all clients must send.
   - `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` — required for the `telegram`
     channel.

2. Set `ROUTER_URL` to your deployed endpoint, e.g.
   `https://your-app.vercel.app/v1/notifications/send`.

## JavaScript example

```bash
node javascript/send.mjs
```

Configure the script by setting these environment variables (or editing the
defaults at the top of the file):

| Variable    | Description                              |
| ----------- | ---------------------------------------- |
| `ROUTER_URL` | Full URL of the send endpoint           |
| `API_KEY`   | The shared secret (`API_SECRET_KEY`) value |

## Bash example

```bash
export ROUTER_URL="https://your-app.vercel.app/v1/notifications/send"
export API_KEY="your-super-secret-api-key"
bash bash/send.sh
```
