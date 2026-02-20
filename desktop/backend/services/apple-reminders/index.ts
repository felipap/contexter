import { createLogger } from '../../lib/logger'
import { fetchReminders } from '../../sources/apple-reminders'
import { uploadReminders } from './upload'
import { createScheduledService, type SyncResult } from '../scheduler'

const log = createLogger('apple-reminders-service')

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(resolve)
  })
}

async function syncAndUpload(): Promise<SyncResult> {
  log.info('Syncing...')
  await yieldToEventLoop()

  const reminders = fetchReminders()
  if (reminders.length === 0) {
    log.info('No reminders to sync')
    return { success: true }
  }

  log.info(`Fetched ${reminders.length} reminders`)
  await yieldToEventLoop()

  await uploadReminders(reminders)
  return { success: true }
}

export const appleRemindersService = createScheduledService({
  name: 'apple-reminders',
  configKey: 'appleRemindersSync',
  onSync: syncAndUpload,
})
