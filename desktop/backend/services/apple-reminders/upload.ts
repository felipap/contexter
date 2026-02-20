import { apiRequest } from '../../lib/contexter-api'
import { encryptText } from '../../lib/encryption'
import { getDeviceId, getEncryptionKey } from '../../store'
import type { AppleReminder } from '../../sources/apple-reminders'

type EncryptedReminder = {
  id: string
  title: string
  notes: string | null
  listName: string | null
  completed: boolean
  flagged: boolean
  priority: number
  dueDate: string | null
  completionDate: string | null
  creationDate: string | null
  lastModifiedDate: string | null
}

function encryptReminders(
  reminders: AppleReminder[],
  encryptionKey: string,
): EncryptedReminder[] {
  return reminders.map((r) => ({
    id: r.id,
    title: encryptText(r.title, encryptionKey),
    notes: r.notes ? encryptText(r.notes, encryptionKey) : null,
    listName: r.listName ? encryptText(r.listName, encryptionKey) : null,
    completed: r.completed,
    flagged: r.flagged,
    priority: r.priority,
    dueDate: r.dueDate?.toISOString() ?? null,
    completionDate: r.completionDate?.toISOString() ?? null,
    creationDate: r.creationDate?.toISOString() ?? null,
    lastModifiedDate: r.lastModifiedDate?.toISOString() ?? null,
  }))
}

const UPLOAD_BATCH_SIZE = 100

export async function uploadReminders(
  reminders: AppleReminder[],
): Promise<void> {
  if (reminders.length === 0) {
    return
  }

  const encryptionKey = getEncryptionKey()
  if (!encryptionKey) {
    return
  }

  const encrypted = encryptReminders(reminders, encryptionKey)
  const syncTime = new Date().toISOString()
  const deviceId = getDeviceId()

  for (let i = 0; i < encrypted.length; i += UPLOAD_BATCH_SIZE) {
    const batch = encrypted.slice(i, i + UPLOAD_BATCH_SIZE)
    await apiRequest({
      path: '/api/apple-reminders',
      body: {
        reminders: batch,
        syncTime,
        deviceId,
      },
    })
  }

  console.log(`Uploaded ${reminders.length} reminders successfully`)
}
