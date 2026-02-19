# Vaulty Desktop

Menu bar app that reads your local data, encrypts it on-device, and syncs it to your Vaulty server on a schedule. Built with Electron + React (Vite).

## Development

```sh
npm install
npm run dev
```

This starts both the Electron main process and the Vite dev server for the settings window. Backend changes are watched and recompiled automatically.

## Building

```sh
npm run build
npm run pack            # Build distributable (unsigned)
npm run pack-local      # Build and install to /Applications
```

For signed/notarized builds, set `APPLE_TEAM_ID`, `APPLE_ID`, and `APPLE_APP_SPECIFIC_PASSWORD`. Skip notarization with `SKIP_NOTARIZE=true`.

## Configuration

All configuration is stored via `electron-store` in `~/Library/Application Support/Vaulty/data.json` (or `VaultyDev` in dev mode). Secrets are stored in the macOS Keychain.
