// Defines which columns in each table can be encrypted
// This helps the API routes and frontend know which fields to expect encryption on

export const SCREENSHOT_ENCRYPTABLE_COLUMNS = ["data"] as const

export const IMESSAGE_ENCRYPTABLE_COLUMNS = ["text", "subject"] as const

export const ATTACHMENT_ENCRYPTABLE_COLUMNS = ["dataBase64"] as const

export const CONTACT_ENCRYPTABLE_COLUMNS = [
  "firstName",
  "lastName",
  "organization",
  "emails",
  "phoneNumbers",
] as const
