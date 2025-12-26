import { IMessageSDK } from '@photon-ai/imessage-kit'
import { store, addRequestLog, getDeviceId, getDeviceSecret } from '../store'
import { startAnimating, stopAnimating } from '../tray/animate'
import {
  createIMessageSDK,
  fetchMessages,
  type Message,
} from '../sources/imessage'
import type { Service } from './index'

async function uploadMessages(messages: Message[]): Promise<void> {
  if (messages.length === 0) {
    return
  }

  const serverUrl = store.get('serverUrl')
  const deviceId = getDeviceId()
  const deviceSecret = getDeviceSecret()
  const path = '/api/messages'
  const uploadUrl = `${serverUrl}${path}`

  const startTime = Date.now()

  let response: Response
  try {
    response = await fetch(uploadUrl, {
      method: 'POST',
      body: JSON.stringify({ messages }),
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
        Authorization: `Bearer ${deviceSecret}`,
      },
    })
  } catch (error) {
    addRequestLog({
      timestamp: startTime,
      method: 'POST',
      path,
      status: 'error',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Network error',
    })
    throw error
  }

  const duration = Date.now() - startTime

  if (!response.ok) {
    addRequestLog({
      timestamp: startTime,
      method: 'POST',
      path,
      status: 'error',
      statusCode: response.status,
      duration,
      error: `${response.status} ${response.statusText}`,
    })
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
  }

  addRequestLog({
    timestamp: startTime,
    method: 'POST',
    path,
    status: 'success',
    statusCode: response.status,
    duration,
  })

  console.log(`Uploaded ${messages.length} messages successfully`)
}

let sdk: IMessageSDK | null = null
let exportInterval: NodeJS.Timeout | null = null
let nextExportTime: Date | null = null
let lastExportedMessageDate: Date | null = null

async function exportAndUpload(): Promise<void> {
  console.log('[imessage] Exporting messages...')

  if (!sdk) {
    return
  }

  const since =
    lastExportedMessageDate || new Date(Date.now() - 24 * 60 * 60 * 1000)
  const messages = await fetchMessages(sdk, since)

  if (messages.length === 0) {
    console.log('[imessage] No new messages to export')
    return
  }

  const latestDate = messages.reduce(
    (max, msg) => (msg.date > max ? msg.date : max),
    messages[0].date,
  )

  startAnimating('old')
  try {
    await uploadMessages(messages)
    lastExportedMessageDate = latestDate
  } catch (error) {
    console.error('[imessage] Failed to upload messages:', error)
  } finally {
    stopAnimating()
  }
}

function scheduleNextExport(): void {
  const config = store.get('imessageExport')
  const intervalMs = config.intervalMinutes * 60 * 1000

  nextExportTime = new Date(Date.now() + intervalMs)

  exportInterval = setTimeout(async () => {
    await exportAndUpload()
    scheduleNextExport()
  }, intervalMs)
}

async function start(): Promise<void> {
  if (exportInterval) {
    console.log('[imessage] Already running')
    return
  }

  const config = store.get('imessageExport')
  if (!config.enabled) {
    console.log('[imessage] Disabled')
    return
  }

  console.log('[imessage] Starting...')

  sdk = createIMessageSDK()

  // Do initial export, but don't let failures prevent scheduling
  try {
    await exportAndUpload()
  } catch (error) {
    console.error('[imessage] Initial export failed:', error)
  }

  scheduleNextExport()
}

function stop(): void {
  if (exportInterval) {
    clearTimeout(exportInterval)
    exportInterval = null
    nextExportTime = null
    console.log('[imessage] Stopped')
  }

  if (sdk) {
    sdk.close()
    sdk = null
  }
}

function restart(): void {
  stop()
  start()
}

function isRunning(): boolean {
  return exportInterval !== null
}

async function runNow(): Promise<void> {
  if (!sdk) {
    sdk = createIMessageSDK()
  }
  await exportAndUpload()
}

function getNextRunTime(): Date | null {
  return nextExportTime
}

function getTimeUntilNextRun(): number {
  if (!nextExportTime) {
    return 0
  }
  return Math.max(0, nextExportTime.getTime() - Date.now())
}

export const imessageService: Service = {
  name: 'imessage',
  start,
  stop,
  restart,
  isRunning,
  runNow,
  getNextRunTime,
  getTimeUntilNextRun,
}
