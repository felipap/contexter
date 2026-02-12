import { createLogger } from '../../lib/logger'
import { startAnimating, stopAnimating } from '../../tray/animate'
import { captureScreen } from '../../sources/screenshots'
import { uploadScreenshot } from './upload'
import { createScheduledService } from '../scheduler'

const log = createLogger('screenshots')

async function captureAndUpload(): Promise<void> {
  log.info('Capturing screen...')

  const imageBuffer = await captureScreen()
  if (!imageBuffer) {
    throw new Error('Failed to capture screen')
  }

  startAnimating('vault-rotation')
  try {
    await uploadScreenshot(imageBuffer)
  } finally {
    stopAnimating()
  }
}

export const screenshotsService = createScheduledService({
  name: 'screenshots',
  configKey: 'screenCapture',
  onSync: captureAndUpload,
})
