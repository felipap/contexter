import Database from 'better-sqlite3'
import { readdirSync, statSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const CORE_DATA_EPOCH_OFFSET = 978307200

export type AppleReminder = {
  id: string
  title: string
  notes: string | null
  listName: string | null
  completed: boolean
  flagged: boolean
  priority: number
  dueDate: Date | null
  completionDate: Date | null
  creationDate: Date | null
  lastModifiedDate: Date | null
}

export function coreDataTimestampToDate(ts: number | null): Date | null {
  if (ts === null || ts === undefined || ts === 0) {
    return null
  }
  return new Date((ts + CORE_DATA_EPOCH_OFFSET) * 1000)
}

function findRemindersDatabase(): string | null {
  const storesDir = join(
    homedir(),
    'Library/Group Containers/group.com.apple.reminders/Container_v1/Stores',
  )

  try {
    const entries = readdirSync(storesDir)
    const sqliteFiles = entries.filter((e) => e.endsWith('.sqlite'))

    if (sqliteFiles.length === 0) {
      return null
    }

    let largest = { path: '', size: 0 }
    for (const file of sqliteFiles) {
      const fullPath = join(storesDir, file)
      const stat = statSync(fullPath)
      if (stat.size > largest.size) {
        largest = { path: fullPath, size: stat.size }
      }
    }

    return largest.path || null
  } catch {
    return null
  }
}

export function isAppleRemindersAvailable(): boolean {
  return findRemindersDatabase() !== null
}

export function fetchReminders(): AppleReminder[] {
  const dbPath = findRemindersDatabase()
  if (!dbPath) {
    console.error('[apple-reminders] Could not find Reminders database')
    return []
  }

  const db = new Database(dbPath, { readonly: true })

  const rows = db
    .prepare(
      `
      SELECT
        hex(r.ZIDENTIFIER) as id,
        r.ZTITLE as title,
        r.ZNOTES as notes,
        r.ZCOMPLETED as completed,
        r.ZFLAGGED as flagged,
        r.ZPRIORITY as priority,
        r.ZDUEDATE as dueDate,
        r.ZCOMPLETIONDATE as completionDate,
        r.ZCREATIONDATE as creationDate,
        r.ZLASTMODIFIEDDATE as lastModifiedDate,
        bl.ZNAME as listName
      FROM ZREMCDREMINDER r
      LEFT JOIN ZREMCDBASELIST bl ON bl.Z_PK = r.ZLIST
      WHERE r.ZMARKEDFORDELETION = 0
        AND r.ZTITLE IS NOT NULL
      ORDER BY r.ZCREATIONDATE DESC
    `,
    )
    .all() as Array<{
    id: string
    title: string
    notes: string | null
    completed: number
    flagged: number
    priority: number
    dueDate: number | null
    completionDate: number | null
    creationDate: number | null
    lastModifiedDate: number | null
    listName: string | null
  }>

  const reminders: AppleReminder[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    notes: row.notes,
    listName: row.listName,
    completed: row.completed === 1,
    flagged: row.flagged === 1,
    priority: row.priority,
    dueDate: coreDataTimestampToDate(row.dueDate),
    completionDate: coreDataTimestampToDate(row.completionDate),
    creationDate: coreDataTimestampToDate(row.creationDate),
    lastModifiedDate: coreDataTimestampToDate(row.lastModifiedDate),
  }))

  db.close()

  return reminders
}
