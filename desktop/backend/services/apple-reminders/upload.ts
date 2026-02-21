import { apiRequest } from '../../lib/contexter-api'
import { getDeviceId, getEncryptionKey } from '../../store'
import type { AppleReminder } from '../../sources/apple-reminders'
import { encryptFields } from '../upload-utils'

const ENCRYPTED_FIELDS = ['title', 'notes', 'listName'] as const
const UPLOAD_BATCH_SIZE = 100

type SerializedReminder = {
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

function serializeReminders(reminders: AppleReminder[]): SerializedReminder[] {
  return reminders.map((r) => ({
    id: r.id,
    title: r.title,
    notes: r.notes,
    listName: r.listName,
    completed: r.completed,
    flagged: r.flagged,
    priority: r.priority,
    dueDate: r.dueDate?.toISOString() ?? null,
    completionDate: r.completionDate?.toISOString() ?? null,
    creationDate: r.creationDate?.toISOString() ?? null,
    lastModifiedDate: r.lastModifiedDate?.toISOString() ?? null,
  }))
}

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

  const serialized = serializeReminders(reminders)
  const encrypted = encryptFields(serialized, ENCRYPTED_FIELDS, encryptionKey)
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
