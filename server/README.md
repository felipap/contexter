# Vaulty Server

The Vaulty server. A Next.js app using SQLite (via [libSQL](https://github.com/tursodatabase/libsql)) for storage.

## API

Vaulty exposes a REST API for reading synced data.

### Access Tokens

API read access is authenticated via access tokens. Create and manage them in
the dashboard settings page. Tokens are prefixed with `vault_` and validated
against the database.

### IP Whitelisting

You may choose to whitelist specific IPs to access the API. All whitelists are
optional. If not set, all IPs are allowed.

On Vercel, IP detection works automatically. When self-hosting behind a reverse
proxy (nginx, Caddy, Cloudflare, etc), set `TRUSTED_PROXY=true` so the server
trusts forwarded headers like `X-Real-IP` and `X-Forwarded-For`. Without a
trusted proxy, these headers are trivially spoofable by clients and IP
whitelisting can be bypassed.

For rate limiting and other security considerations, see [SECURITY.md](../SECURITY.md).

## Deploy

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/felipap/vaulty&root-directory=server&env=DATABASE_URL,DATABASE_AUTH_TOKEN,DASHBOARD_SECRET,API_WRITE_SECRET,CRON_SECRET&envDescription=Required%20environment%20variables%20for%20Vaulty&envLink=https://github.com/felipap/vaulty/blob/main/server/README.md%23environment-variables)

When deploying to Vercel, you'll need a hosted libSQL database (e.g.
[Turso](https://turso.tech)). Set `DATABASE_URL` to your `libsql://` URL and
`DATABASE_AUTH_TOKEN` to your auth token.

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

## Environment Variables

### Required

- `DATABASE_URL` — libSQL connection string. Use `libsql://...` for Turso or `file:./local.db` for a local SQLite file.
- `DATABASE_AUTH_TOKEN` — Auth token (not needed for local SQLite)
- `DASHBOARD_SECRET` — Passphrase to access the web dashboard
- `API_WRITE_SECRET` — Secret for authenticating the Electron app when writing data
- `CRON_SECRET` — Secret used to authenticate the cleanup cron job

### Optional

- `DASHBOARD_IP_WHITELIST` — Comma-separated IPs allowed to access the dashboard
- `API_WRITE_IP_WHITELIST` — Comma-separated IPs allowed to write data
- `API_READ_IP_WHITELIST` — Comma-separated IPs allowed to read data
- `TRUSTED_PROXY` — Set to `true` if behind a reverse proxy that sets forwarded headers. Required for IP whitelisting to work when self-hosting.
- `LOG_RETENTION_HOURS` — Hours to keep logs (0 = no expiration)

Each source type also supports a `<source>_RETENTION_HOURS` environment variable
to control how long to keep data before cleanup. See `.env.example` for the
complete list.
