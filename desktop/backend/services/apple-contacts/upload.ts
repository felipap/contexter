import { apiRequest } from '../../lib/contexter-api'
import { computeSearchIndex, encryptText } from '../../lib/encryption'
import {
  normalizeStringForSearch,
  normalizePhoneForSearch,
} from '../../lib/search-index-utils'
import { getDeviceId, getEncryptionKey } from '../../store'
import type { AppleContact } from '../../sources/icontacts'
import { encryptFields } from '../upload-utils'

const ENCRYPTED_FIELDS = ['firstName', 'lastName', 'organization'] as const
const UPLOAD_BATCH_SIZE = 100

type ContactWithIndexes = AppleContact & {
  firstNameIndex?: string
  lastNameIndex?: string
  phoneNumbersIndex?: string[]
}

function addSearchIndexesAndEncryptArrays(
  contacts: AppleContact[],
  encryptionKey: string,
): ContactWithIndexes[] {
  return contacts.map((c) => {
    const normalizedFirst = c.firstName
      ? normalizeStringForSearch(c.firstName)
      : null
    const normalizedLast = c.lastName
      ? normalizeStringForSearch(c.lastName)
      : null

    return {
      ...c,
      firstNameIndex: normalizedFirst
        ? computeSearchIndex(normalizedFirst, encryptionKey)
        : undefined,
      lastNameIndex: normalizedLast
        ? computeSearchIndex(normalizedLast, encryptionKey)
        : undefined,
      emails: c.emails.map((e) => encryptText(e, encryptionKey)),
      phoneNumbers: c.phoneNumbers.map((p) => encryptText(p, encryptionKey)),
      phoneNumbersIndex: c.phoneNumbers
        .map((p) => normalizePhoneForSearch(p))
        .filter((p) => p.length > 0)
        .map((p) => computeSearchIndex(p, encryptionKey)),
    }
  })
}

export async function uploadContacts(contacts: AppleContact[]): Promise<void> {
  if (contacts.length === 0) {
    return
  }

  const encryptionKey = getEncryptionKey()
  if (!encryptionKey) {
    return
  }

  const withIndexes = addSearchIndexesAndEncryptArrays(contacts, encryptionKey)
  const encrypted = encryptFields(withIndexes, ENCRYPTED_FIELDS, encryptionKey)

  const syncTime = new Date().toISOString()
  const deviceId = getDeviceId()

  for (let i = 0; i < encrypted.length; i += UPLOAD_BATCH_SIZE) {
    const batch = encrypted.slice(i, i + UPLOAD_BATCH_SIZE)
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
