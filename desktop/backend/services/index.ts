export type SyncStatus = 'success' | 'error' | null

export type Service = {
  name: string
  start: () => Promise<void>
  stop: () => void
  restart: () => void
  isRunning: () => boolean
  isEnabled: () => boolean
  runNow: () => Promise<void>
  getNextRunTime: () => Date | null
  getTimeUntilNextRun: () => number
  getLastSyncStatus: () => SyncStatus
  getLastFailedSyncId: () => string | null
}

import { createLogger } from '../lib/logger'
import { screenshotsService } from './screenshots'
import { imessageService } from './imessage'
import { iContactsService } from './apple-contacts'
import { whatsappSqliteService } from './whatsapp'
import { macosStickiesService } from './stickies'

const log = createLogger('services')

export const SERVICES: Service[] = [
  imessageService,
  screenshotsService,
  iContactsService,
  whatsappSqliteService,
  macosStickiesService,
]

export async function startAllServices(): Promise<void> {
  log.info('Starting all services...')

  for (const service of SERVICES) {
    log.debug(`Will start service ${service.name}`)
    await service.start()
  }
  log.info('All services started')
}

export function stopAllServices(): void {
  for (const service of SERVICES) {
    service.stop()
  }
}

export function getService(name: string): Service | undefined {
  return SERVICES.find((s) => s.name === name)
}

export {
  screenshotsService,
  imessageService,
  iContactsService as contactsService,
  whatsappSqliteService,
  macosStickiesService,
}
