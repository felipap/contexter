// Run with: npm run build:backend && npx electron dist/backend/lib/logger.test.js

import { app } from 'electron'
import { createLogger } from './logger'

app.whenReady().then(() => {
  const log = createLogger('test')

  // Test circular reference (would crash without maxDepth transform)
  const circular: Record<string, unknown> = { name: 'test' }
  circular.self = circular
  log.info('Circular:', circular)

  console.log('✓ Circular reference handled')
  app.quit()
})
