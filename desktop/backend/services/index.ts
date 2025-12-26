export type Service = {
  name: string
  start: () => Promise<void> | void
  stop: () => void
  restart: () => void
  isRunning: () => boolean
  runNow: () => Promise<void>
  getNextRunTime: () => Date | null
  getTimeUntilNextRun: () => number
}

import { screenshotsService } from './screenshots'
import { imessageService } from './imessage'
import { contactsService } from './contacts'

export const SERVICES: Service[] = [
  screenshotsService,
  imessageService,
  contactsService,
]

export function startAllServices(): void {
  for (const service of SERVICES) {
    service.start()
  }
}

export function stopAllServices(): void {
  for (const service of SERVICES) {
    service.stop()
  }
}

export function getService(name: string): Service | undefined {
  return SERVICES.find((s) => s.name === name)
}

export { screenshotsService, imessageService, contactsService }
