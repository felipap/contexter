import Database from 'better-sqlite3'
import { existsSync } from 'fs'
import { join } from 'path'

export type WinStickyNote = {
  id: string
  text: string
}

const PLUM_DB_PATH = join(
  process.env.LOCALAPPDATA || '',
  'Packages',
  'Microsoft.MicrosoftStickyNotes_8wekyb3d8bbwe',
  'LocalState',
  'plum.sqlite',
)

function stripHtml(html: string): string {
  // Windows Sticky Notes stores text as HTML-like content
  // e.g. "\id3\text content here" or "<p>text</p>"
  let out = html

  // Remove the \id prefix that Windows Sticky Notes prepends
  out = out.replace(/^\\id[^\s]*\s*/, '')

  // Remove HTML tags
  out = out.replace(/<[^>]+>/g, '')

  // Decode common HTML entities
  out = out.replace(/&amp;/g, '&')
  out = out.replace(/&lt;/g, '<')
  out = out.replace(/&gt;/g, '>')
  out = out.replace(/&quot;/g, '"')
  out = out.replace(/&#39;/g, "'")
  out = out.replace(/&nbsp;/g, ' ')

  return out.replace(/\s+/g, ' ').trim()
}

export function fetchWinStickyNotes(): WinStickyNote[] {
  if (process.platform !== 'win32') {
    return []
  }

  if (!existsSync(PLUM_DB_PATH)) {
    return []
  }

  const db = new Database(PLUM_DB_PATH, { readonly: true })
  try {
    const rows = db.prepare('SELECT Id, Text FROM Note WHERE IsOpen = 1 OR DeletedAt IS NULL').all() as {
      Id: string
      Text: string
    }[]

    return rows
      .filter((row) => row.Text)
      .map((row) => ({
        id: row.Id,
        text: stripHtml(row.Text),
      }))
  } finally {
    db.close()
  }
}
