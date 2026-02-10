# vaulty

Sync your data to the cloud, where agents can read it.

### Supported syncs

The Vaulty client can sync the following data to your server:

| Sync                  | Description                               | Availability        |
| --------------------- | ----------------------------------------- | ------------------- |
| **Apple Messages**    | Message history and attachments           | Stable              |
| **WhatsApp (Sqlite)** | Message history via local SQLite database | Stable              |
| **Apple Contacts**    | From macOS AddressBook                    | Stable              |
| **Screenshots**       | Periodic screen captures                  | Beta                |
| **Locations**         | GPS coordinates via iOS app               | Beta, needs iOS app |

### Components

- **Desktop app** - Syncs data from your machine to the server
- **Server (Next.js)** - Stores the data and exposes it via API
- **iOS app** - For sharing realtime location

## Getting started

### Download the desktop client

Download the latest macOS desktop app from [GitHub Releases](https://github.com/felipap/vaulty/releases).

### Deploy the server

See [web/README.md](./web/README.md) for instructions.

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## License

MIT
