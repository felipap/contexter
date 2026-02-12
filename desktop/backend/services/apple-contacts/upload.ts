import { apiRequest } from '../../lib/contexter-api'
import { computeSearchIndex, encryptText } from '../../lib/encryption'
import {
  normalizeStringForSearch,
  normalizePhoneForSearch,
} from '../../lib/search-index-utils'
import { getDeviceId, getEncryptionKey } from '../../store'
import type { AppleContact } from '../../sources/icontacts'

type EncryptedContact = AppleContact & {
  firstNameIndex?: string
  lastNameIndex?: string
  phoneNumbersIndex?: string[]
}

function encryptContacts(
  contacts: AppleContact[],
  encryptionKey: string,
): EncryptedContact[] {
  return contacts.map((c) => {
    const normalizedFirst = c.firstName
      ? normalizeStringForSearch(c.firstName)
      : null
    const normalizedLast = c.lastName
      ? normalizeStringForSearch(c.lastName)
      : null

    return {
      ...c,
      firstName: c.firstName
        ? encryptText(c.firstName, encryptionKey)
        : c.firstName,
      lastName: c.lastName
        ? encryptText(c.lastName, encryptionKey)
        : c.lastName,
      firstNameIndex: normalizedFirst
        ? computeSearchIndex(normalizedFirst, encryptionKey)
        : undefined,
      lastNameIndex: normalizedLast
        ? computeSearchIndex(normalizedLast, encryptionKey)
        : undefined,
      organization: c.organization
        ? encryptText(c.organization, encryptionKey)
        : c.organization,
      emails: c.emails.map((e) => encryptText(e, encryptionKey)),
      phoneNumbers: c.phoneNumbers.map((p) => encryptText(p, encryptionKey)),
      phoneNumbersIndex: c.phoneNumbers
        .map((p) => normalizePhoneForSearch(p))
        .filter((p) => p.length > 0)
        .map((p) => computeSearchIndex(p, encryptionKey)),
    }
  })
}

const UPLOAD_BATCH_SIZE = 100

export async function uploadContacts(contacts: AppleContact[]): Promise<void> {
  if (contacts.length === 0) {
    return
  }

  const encryptionKey = getEncryptionKey()
  if (!encryptionKey) {
    return
  }
  const contactsToUpload = encryptContacts(contacts, encryptionKey)

  const syncTime = new Date().toISOString()
  const deviceId = getDeviceId()

  for (let i = 0; i < contactsToUpload.length; i += UPLOAD_BATCH_SIZE) {
    const batch = contactsToUpload.slice(i, i + UPLOAD_BATCH_SIZE)
    await apiRequest({
      path: '/api/icontacts',
      body: {
        contacts: batch,
        syncTime,
        deviceId,
      },
    })
  }

  console.log(`Uploaded ${contacts.length} contacts successfully`)
}
