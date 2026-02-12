import { createLogger } from '../../lib/logger'
import { startAnimating, stopAnimating } from '../../tray/animate'
import { fetchContacts } from '../../sources/icontacts'
import { uploadContacts } from './upload'
import { createScheduledService } from '../scheduler'

const log = createLogger('icontacts-service')

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(resolve)
  })
}

async function syncAndUpload(): Promise<void> {
  log.info('Syncing...')
  await yieldToEventLoop()

  const contacts = fetchContacts()
  if (contacts.length === 0) {
    log.info('No contacts to sync')
    return
  }

  log.info(`Fetched ${contacts.length} contacts`)
  await yieldToEventLoop()

  startAnimating('vault-rotation')
  try {
    await uploadContacts(contacts)
  } finally {
    stopAnimating()
  }
}

export const iContactsService = createScheduledService({
  name: 'icontacts',
  configKey: 'icontactsSync',
  onSync: syncAndUpload,
})
