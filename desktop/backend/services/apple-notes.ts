import { createLogger } from '../lib/logger'
import { fetchNotes } from '../sources/apple-notes'
import { createScheduledService, type SyncResult } from './scheduler'
import { encryptAndUpload } from './upload-utils'

const log = createLogger('apple-notes')

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(resolve)
  })
}

const FIELD_CONFIG = { encryptedFields: ['title', 'body'] } as const

async function syncAndUpload(): Promise<SyncResult> {
  log.info('Syncing...')
  await yieldToEventLoop()

  const notes = fetchNotes()
  if (notes.length === 0) {
    log.info('No notes to sync')
    return { success: true }
  }

  log.info(`Fetched ${notes.length} Apple Notes`)
  await yieldToEventLoop()

  const uploaded = await encryptAndUpload({
    items: notes,
    encryptedFields: ENCRYPTED_FIELDS,
    apiPath: '/api/apple-notes',
    bodyKey: 'notes',
  })
  if (!uploaded) {
    log.error('Encryption key not set, skipping upload')
    return { success: false }
  }
  log.info(`Uploaded ${notes.length} Apple Notes`)
  return { success: true }
}

export const appleNotesService = createScheduledService({
  name: 'apple-notes',
  configKey: 'appleNotesSync',
  onSync: syncAndUpload,
})
