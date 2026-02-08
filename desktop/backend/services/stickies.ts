import { startAnimating, stopAnimating } from '../tray/animate'
import { fetchStickies, uploadStickies } from '../sources/stickies'
import { createScheduledService } from './scheduler'

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(resolve)
  })
}

async function syncAndUpload(): Promise<void> {
  console.log('[macos-stickies] Syncing...')
  await yieldToEventLoop()

  const stickies = fetchStickies()
  if (stickies.length === 0) {
    console.log('[macos-stickies] No stickies to sync')
    return
  }

  console.log(`Fetched ${stickies.length} macOS stickies`)
  await yieldToEventLoop()

  startAnimating('vault-rotation')
  try {
    await uploadStickies(stickies)
  } finally {
    stopAnimating()
  }
}

export const macosStickiesService = createScheduledService({
  name: 'macos-stickies',
  configKey: 'macosStickiesSync',
  onSync: syncAndUpload,
})
