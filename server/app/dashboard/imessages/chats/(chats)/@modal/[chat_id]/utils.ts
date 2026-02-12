import { type ContactLookup } from "../../../actions"

export function resolveContactName(
  contact: string,
  contactLookup: ContactLookup
): string {
  if (contact.includes("@")) {
    const name = contactLookup[contact.toLowerCase().trim()]
    if (name) {
      return name
    }
    return contact
  }

  const normalizedPhone = contact.replace(/\D/g, "")
  const name = contactLookup[normalizedPhone]
  if (name) {
    return name
  }

  return formatContact(contact)
}

export function formatContact(contact: string): string {
  if (contact.includes("@")) {
    return contact
  }
  if (contact.startsWith("+")) {
    const digits = contact.slice(1)
    if (digits.length === 11 && digits.startsWith("1")) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }
    return contact
  }
  return contact
}
