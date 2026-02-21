import { apiRequest } from '../../lib/contexter-api'
import { log } from './index'
import {
  encryptBinaryToString,
  computeSearchIndex,
} from '../../lib/encryption'
import { normalizeContactForSearch } from '../../lib/search-index-utils'
import { type Message, type Attachment } from '../../sources/imessage'
import { getDeviceId, getEncryptionKey } from '../../store'
import { encryptFields } from '../upload-utils'

const ENCRYPTED_FIELDS = ['text', 'contact'] as const

function encryptAttachment(
  attachment: Attachment,
  encryptionKey: string,
): Attachment {
  if (!attachment.dataBase64) {
    return attachment
  }
  const buffer = Buffer.from(attachment.dataBase64, 'base64')
  return {
    ...attachment,
    dataBase64: encryptBinaryToString(buffer, encryptionKey),
  }
}

function addSearchIndexesAndEncryptAttachments(
  messages: Message[],
  encryptionKey: string,
): Message[] {
  return messages.map((msg) => ({
    ...msg,
    contactIndex: computeSearchIndex(
      normalizeContactForSearch(msg.contact),
      encryptionKey,
    ),
    attachments: msg.attachments.map((att) =>
      encryptAttachment(att, encryptionKey),
    ),
  }))
}

export async function uploadMessages(
  messages: Message[],
): Promise<{ error: string } | {}> {
  if (messages.length === 0) {
    return {}
  }

  const encryptionKey = getEncryptionKey()
  if (!encryptionKey) {
    return { error: 'Encryption key not set' }
  }

  const withIndexes = addSearchIndexesAndEncryptAttachments(messages, encryptionKey)
  const encrypted = encryptFields(withIndexes, ENCRYPTED_FIELDS, encryptionKey)

  const res = await apiRequest({
    path: '/api/imessages',
    body: {
      messages: encrypted,
      syncTime: new Date().toISOString(),
      deviceId: getDeviceId(),
      messageCount: messages.length,
    },
  })
  if ('error' in res) {
    const errorStr = typeof res.error === 'string' ? res.error : JSON.stringify(res.error)
    log.error('apiRequest to /api/imessages failed:', errorStr.slice(0, 1000))
    return { error: res.error }
  }

  log.info(`Uploaded ${messages.length} messages successfully`)
  return {}
}
