export const VALID_SCOPES = [
  "contacts",
  "imessages",
  "whatsapp",
  "screenshots",
  "locations",
  "macos-stickies",
] as const
export type Scope = (typeof VALID_SCOPES)[number]
