# Table of Contents

- [Table of Contents](#table-of-contents)
- [Authentication](#authentication)
  - [Admin Dashboard](#admin-dashboard)
  - [Device Auth (Desktop App)](#device-auth-desktop-app)
  - [Access Tokens (API Read)](#access-tokens-api-read)
- [Server security](#server-security)
- [E2E Encryption](#e2e-encryption)
- [Encrypted Fields by Table](#encrypted-fields-by-table)
  - [Encryption Key Management](#encryption-key-management)
  - [Blind Indexing for Search](#blind-indexing-for-search)
- [Rate Limiting](#rate-limiting)

# Authentication

There are three auth flows: admin dashboard, device writes (Electron app), and API reads (access tokens).

## Admin Dashboard

A passphrase-based system. The passphrase is set via `DASHBOARD_SECRET` env var on the server.

1. User enters passphrase on login page
2. Server compares it to `DASHBOARD_SECRET`
3. If valid, sets an httpOnly cookie (`context_admin`) containing the passphrase
4. Cookie settings: httpOnly, secure in production, sameSite=lax, 1 year expiry
5. Subsequent requests check if cookie value matches `DASHBOARD_SECRET`

In development, if `DASHBOARD_SECRET` is unset, auth is bypassed entirely.

## Device Auth (Desktop App)

Devices authenticate via a shared secret:

1. Set `API_WRITE_SECRET` env var on the server
2. Enter the same secret in the desktop app settings
3. Desktop app sends it as `Authorization: Bearer <secret>` header
4. Server rejects requests where the token doesn't match

If `API_WRITE_SECRET` is unset on the server, device auth is bypassed (for development).

## Access Tokens (API Read)

API read endpoints are authenticated via DB-backed access tokens, managed in the dashboard settings page.

1. User creates a token in the dashboard (with optional expiration)
2. Server generates a `ctx_`-prefixed token, stores only its SHA-256 hash
3. The full token is shown once — the user must copy it
4. API consumers send it as `Authorization: Bearer ctx_...` header
5. Server hashes the token and looks it up in the `access_tokens` table
6. Tokens can be revoked from the dashboard (soft delete via `revoked_at`)
7. `last_used_at` is updated on each successful validation

# Server security

API read is actually more sensitive than write.

# E2E Encryption

Messages and screenshots are encrypted on the desktop before upload. The encryption key **never leaves your browser**.

- Desktop app encrypts data locally before sending to the server
- Server stores encrypted blobs (it cannot read your data)
- Web dashboard downloads encrypted data and decrypts it locally
- The encryption key is stored in browser `sessionStorage` (must not be sent anywhere)
- Decryption uses the Web Crypto API (`crypto.subtle`) in your browser

The server has no way to decrypt your data. If you lose your encryption key, your data is unrecoverable.

# Encrypted Fields by Table

Each table has a mix of encrypted fields (stored as `enc:v1:...` ciphertext) and plaintext fields the server can read. This section only covers the meaningful data fields — operational metadata like `createdAt`, `syncTime`, and `deviceId` are always plaintext but aren't listed since they don't represent user content.

**screenshots**

|           | Fields                                |
| --------- | ------------------------------------- |
| Encrypted | image data                            |
| Plaintext | dimensions (width, height), file size |

**imessages**

|           | Fields                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| Encrypted | text, subject                                                                                              |
| Plaintext | contact identifier, date, isFromMe, isRead, isSent, isDelivered, hasAttachments, service, chatId, chatName |

**imessage_attachments**

|           | Fields                        |
| --------- | ----------------------------- |
| Encrypted | file data                     |
| Plaintext | filename, mimeType, file size |

**contacts**

|           | Fields                                                  |
| --------- | ------------------------------------------------------- |
| Encrypted | firstName, lastName, organization, emails, phoneNumbers |
| Plaintext | contactId (source system ID)                            |

**locations**

|           | Fields              |
| --------- | ------------------- |
| Encrypted | latitude, longitude |
| Plaintext | timestamp, accuracy |

**whatsapp_messages**

|                | Fields                                                         |
| -------------- | -------------------------------------------------------------- |
| Encrypted      | text, chatName, senderName, senderPhoneNumber                  |
| Plaintext      | chatId, messageId, senderJid, timestamp, isFromMe, isGroupChat |
| Search Indices | chatName, senderName, senderPhoneNumber                        |

Search indices are blind indexes (HMAC) that support server-side exact-match search. See [Blind Indexing for Search](#blind-indexing-for-search).

The remaining tables (`write_logs`, `read_logs`, `access_tokens`, `login_attempts`) are operational — they don't store user content and have no encrypted fields.

## Encryption Key Management

**What we do now:**

- Single encryption key per user (passphrase-derived via PBKDF2)
- Encrypted values are prefixed with `enc:v1:` to self-identify as encrypted
- Some fields are encrypted (message text, lat/long), others are plaintext (timestamps, contact IDs) so the server can index/query
- No key identifier stored — we assume all data uses the same key
- The `v1` in `enc:v1:` indicates the encryption _format_ version, not which key was used

**What we could do (but don't):**

- **Key rotation with key IDs**: Format could become `enc:v1:key01:iv:tag:ciphertext` to track which key encrypted what. Would allow rotating keys without re-encrypting old data.
- **Per-table or per-field keys**: Different keys for messages vs locations. More complexity, unclear benefit.
- **Key escrow / recovery**: Store an encrypted backup of the key somewhere. Defeats zero-knowledge if done wrong.

**Trade-offs of zero-knowledge encryption:**

- Forget your key → data is permanently lost (feature, not a bug)
- Change your key → must re-encrypt everything
- Multiple devices → all need the same passphrase
- Server can't help you recover anything

**Open questions Felipe doesn't know the answer to:**

- Is PBKDF2 with 100k iterations still considered good? (Argon2 is "better" but more complex)
- Should we ever implement key rotation, or is "re-encrypt everything" fine for a personal tool?

## Blind Indexing for Search

The encryption uses random IVs, so the same plaintext encrypted twice produces different ciphertexts. This is a security feature (prevents pattern detection) but makes server-side search impossible.

**Solution: HMAC blind indexes**

For fields that need to be searchable, we store a deterministic HMAC alongside the encrypted value:

```
senderPhoneNumber: "enc:v1:..."      // encrypted (different every time)
senderPhoneNumberIndex: "a3f8c2..."  // HMAC (same input → same output)
```

The HMAC is computed using:

- HMAC-SHA256
- Key derived via PBKDF2 with a separate salt (`contexter-search-index-v1`)
- Same passphrase as encryption

**How search works:**

1. Client computes HMAC of search term using their passphrase
2. Client sends the HMAC to the server (not the plaintext)
3. Server matches against the index column

**Limitations:**

- Only exact matches work (no partial/fuzzy search)
- Phone numbers must be normalized consistently on both sides
- Adding a searchable field requires schema change + backfill from desktop app

**Currently indexed fields (WhatsApp):**

- `chatNameIndex`
- `senderNameIndex`
- `senderPhoneNumberIndex`

# Rate Limiting

Configure rate limiting in the Vercel dashboard under **Firewall → + New Rule**.

Recommended rule for API endpoints:

- **Name:** `api-rate-limit`
- **If:** Request Path starts with `/api`
- **Rate Limit:** Fixed Window, 300 seconds, 10 requests, Key: IP Address
- **Then:** Too Many Requests (429)

See [docs/firewall-example.png](./docs/firewall-example.png) for reference.
