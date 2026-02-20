export const VALID_SCOPES = [
  "contacts",
  "imessages",
  "whatsapp",
  "screenshots",
  "locations",
  "macos-stickies",
  "win-sticky-notes",
  "apple-notes",
  "apple-reminders",
] as const
export type Scope = (typeof VALID_SCOPES)[number]
