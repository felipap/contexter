import { createLogger } from '../lib/logger'
import { fetchWinStickyNotes } from '../sources/win-sticky-notes'
import { createScheduledService, type SyncResult } from './scheduler'
import { encryptAndUpload } from './upload-utils'

const log = createLogger('win-sticky-notes')

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(resolve)
  })
}

const FIELD_CONFIG = { encryptedFields: ['text'] } as const

async function syncAndUpload(): Promise<SyncResult> {
  log.info('Syncing...')
  await yieldToEventLoop()

  const notes = fetchWinStickyNotes()
  if (notes.length === 0) {
    log.info('No sticky notes to sync')
    return { success: true }
  }

  log.info(`Fetched ${notes.length} Windows sticky notes`)
  await yieldToEventLoop()

  const uploaded = await encryptAndUpload({
    items: notes,
    config: FIELD_CONFIG,
    apiPath: '/api/win-sticky-notes',
    bodyKey: 'stickies',
  })
  if (!uploaded) {
    log.error('Encryption key not set, skipping upload')
    return { success: false }
  }
  log.info(`Uploaded ${notes.length} Windows sticky notes`)
  return { success: true }
}

export const winStickyNotesService = createScheduledService({
  name: 'win-sticky-notes',
  configKey: 'winStickyNotesSync',
  onSync: syncAndUpload,
})
