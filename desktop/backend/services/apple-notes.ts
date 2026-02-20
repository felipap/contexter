import { createLogger } from '../lib/logger'
import { apiRequest } from '../lib/contexter-api'
import { fetchNotes, type AppleNote } from '../sources/apple-notes'
import { createScheduledService, type SyncResult } from './scheduler'

const log = createLogger('apple-notes')

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(resolve)
  })
}

async function uploadNotes(notes: AppleNote[]): Promise<void> {
  await apiRequest({
    path: '/api/apple-notes',
    body: { notes },
  })
  log.info(`Uploaded ${notes.length} Apple Notes`)
}

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

  await uploadNotes(notes)
  return { success: true }
}

export const appleNotesService = createScheduledService({
  name: 'apple-notes',
  configKey: 'appleNotesSync',
  onSync: syncAndUpload,
})
