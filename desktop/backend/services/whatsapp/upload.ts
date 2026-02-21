import { apiRequest } from '../../lib/contexter-api'
import { computeSearchIndex } from '../../lib/encryption'
import {
  normalizeStringForSearch,
  normalizePhoneForSearch,
} from '../../lib/search-index-utils'
import { getDeviceId, getEncryptionKey } from '../../store'
import { log } from './index'
import type { WhatsAppMessage } from './types'
import { encryptFields } from '../upload-utils'

const ENCRYPTED_FIELDS = ['text', 'chatName', 'senderName', 'senderPhoneNumber'] as const

type WhatsAppMessageWithIndexes = WhatsAppMessage & {
  chatNameIndex?: string
  senderNameIndex?: string
  senderPhoneNumberIndex?: string
}

function addSearchIndexes(
  messages: WhatsAppMessage[],
  encryptionKey: string,
): WhatsAppMessageWithIndexes[] {
  return messages.map((msg) => ({
    ...msg,
    chatNameIndex: msg.chatName
      ? computeSearchIndex(normalizeStringForSearch(msg.chatName), encryptionKey)
      : undefined,
    senderNameIndex: msg.senderName
      ? computeSearchIndex(normalizeStringForSearch(msg.senderName), encryptionKey)
      : undefined,
    senderPhoneNumberIndex: msg.senderPhoneNumber
      ? computeSearchIndex(normalizePhoneForSearch(msg.senderPhoneNumber), encryptionKey)
      : undefined,
  }))
}

export async function uploadWhatsAppMessages(
  messages: WhatsAppMessage[],
  source: 'sqlite',
): Promise<{ error: string } | object> {
  if (messages.length === 0) {
    return {}
  }

  const encryptionKey = getEncryptionKey()
  if (!encryptionKey) {
    return { error: 'Encryption key not set' }
  }

  const withIndexes = addSearchIndexes(messages, encryptionKey)
  const encrypted = encryptFields(withIndexes, ENCRYPTED_FIELDS, encryptionKey)

  const res = await apiRequest({
    path: '/api/whatsapp/messages',
    body: {
      messages: encrypted,
      source,
      syncTime: new Date().toISOString(),
      deviceId: getDeviceId(),
      messageCount: messages.length,
    },
  })

  if ('error' in res) {
    return { error: res.error }
  }

  log.info(`Uploaded ${messages.length} messages successfully`)
  return {}
}
