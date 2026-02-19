# Vaulty Server

The server component of Vaulty. Uses SQLite (via [libSQL](https://github.com/tursodatabase/libsql)) for storage.

## Deploy

### Docker (recommended for self-hosting)

1. Copy `.env` and fill in your secrets:

```sh
cp .env.example .env
```

2. Start the stack:

```sh
docker compose up -d
```

This starts two containers:

- **app** — The Next.js server (exposed on port 3030 by default). The SQLite database is stored in a persistent Docker volume.
- **cron** — A lightweight Alpine container that calls the cleanup endpoint every 5 minutes

The database schema is applied automatically on startup via `drizzle-kit push`.

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/felipap/vaulty&root-directory=server&env=DATABASE_URL,DATABASE_AUTH_TOKEN,DASHBOARD_SECRET,API_WRITE_SECRET,CRON_SECRET&envDescription=Required%20environment%20variables%20for%20Vaulty&envLink=https://github.com/felipap/vaulty/blob/main/server/README.md%23environment-variables)

When deploying to Vercel, you'll need a hosted libSQL database (e.g. [Turso](https://turso.tech)). Set `DATABASE_URL` to your `libsql://` URL and `DATABASE_AUTH_TOKEN` to your auth token.

## Environment Variables

### Required

- `DATABASE_URL` — libSQL connection string. Use `libsql://...` for Turso or `file:./local.db` for a local SQLite file.
- `DASHBOARD_SECRET` — Passphrase to access the web dashboard
- `API_WRITE_SECRET` — Secret for authenticating the Electron app when writing data
- `CRON_SECRET` — Secret used to authenticate the cleanup cron job

### Optional

- `DATABASE_AUTH_TOKEN` — Auth token for Turso (not needed for local SQLite)
- `DASHBOARD_IP_WHITELIST` — Comma-separated IPs allowed to access the dashboard
- `API_WRITE_IP_WHITELIST` — Comma-separated IPs allowed to write data
- `API_READ_IP_WHITELIST` — Comma-separated IPs allowed to read data
- `SCREENSHOT_RETENTION_HOURS` — Hours to keep screenshots before cleanup (default: 1)
- `IMESSAGE_RETENTION_HOURS` — Hours to keep iMessages (0 = no expiration)
- `WHATSAPP_RETENTION_HOURS` — Hours to keep WhatsApp messages (0 = no expiration)
- `CONTACT_RETENTION_HOURS` — Hours to keep contacts (0 = no expiration)
- `LOCATION_RETENTION_HOURS` — Hours to keep locations (0 = no expiration)
- `STICKIES_RETENTION_HOURS` — Hours to keep stickies (0 = no expiration)
- `LOG_RETENTION_HOURS` — Hours to keep logs (0 = no expiration)

### Access Tokens

API read access is authenticated via access tokens. Create and manage them in the dashboard settings page. Tokens are prefixed with `ctx_` and validated against the database.

### IP Whitelisting

All whitelists are optional. If not set, all IPs are allowed.

The IP detection works with common proxy setups (checks `X-Forwarded-For`, `X-Real-IP`, `CF-Connecting-IP` headers).

For rate limiting and other security considerations, see [SECURITY.md](../SECURITY.md).
