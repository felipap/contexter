import { createLogger } from '../lib/logger'
import { fetchStickies } from '../sources/stickies'
import { createScheduledService, type SyncResult } from './scheduler'
import { encryptAndUpload } from './upload-utils'

const log = createLogger('macos-stickies')

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(resolve)
  })
}

const FIELD_CONFIG = { encryptedFields: ['text'] } as const

async function syncAndUpload(): Promise<SyncResult> {
  log.info('Syncing...')
  await yieldToEventLoop()

  const stickies = fetchStickies()
  if (stickies.length === 0) {
    log.info('No stickies to sync')
    return { success: true }
  }

  log.info(`Fetched ${stickies.length} macOS stickies`)
  await yieldToEventLoop()

  const uploaded = await encryptAndUpload({
    items: stickies,
    config: FIELD_CONFIG,
    apiPath: '/api/macos-stickies',
    bodyKey: 'stickies',
  })
  if (!uploaded) {
    log.error('Encryption key not set, skipping upload')
    return { success: false }
  }
  log.info(`Uploaded ${stickies.length} macOS stickies`)
  return { success: true }
}

export const macosStickiesService = createScheduledService({
  name: 'macos-stickies',
  configKey: 'macosStickiesSync',
  onSync: syncAndUpload,
})
