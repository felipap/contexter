// Run locally from desktop/: npm run test -- backend/sources/apple-notes/index.test.ts

import { gzipSync } from 'zlib'
import { describe, expect, it } from 'vitest'
import {
  coreDataTimestampToISO,
  decompressNoteBody,
  extractTextFromProtobuf,
  fetchNotes,
  isAppleNotesAvailable,
} from './index'

describe('coreDataTimestampToISO', () => {
  it('converts Core Data timestamp to ISO string', () => {
    // Core Data epoch is Jan 1, 2001 00:00:00 UTC
    // ts=0 should be 2001-01-01T00:00:00.000Z
    expect(coreDataTimestampToISO(0)).toBe('2001-01-01T00:00:00.000Z')
  })

  it('converts a known date correctly', () => {
    // 2025-01-01T00:00:00Z = Unix 1735689600
    // Core Data = 1735689600 - 978307200 = 757382400
    expect(coreDataTimestampToISO(757382400)).toBe('2025-01-01T00:00:00.000Z')
  })

  it('returns epoch for null', () => {
    expect(coreDataTimestampToISO(null)).toBe('1970-01-01T00:00:00.000Z')
  })
})

describe('extractTextFromProtobuf', () => {
  it('returns empty string for empty buffer', () => {
    expect(extractTextFromProtobuf(Buffer.alloc(0))).toBe('')
  })

  it('extracts a length-delimited string field', () => {
    // Protobuf wire format: field 1, wire type 2 (length-delimited)
    // Tag byte: (1 << 3) | 2 = 0x0a
    const text = 'Hello, Notes!'
    const textBytes = Buffer.from(text, 'utf-8')
    const buf = Buffer.concat([
      Buffer.from([0x0a, textBytes.length]),
      textBytes,
    ])
    expect(extractTextFromProtobuf(buf)).toContain('Hello, Notes!')
  })

  it('extracts multiple string fields', () => {
    const text1 = 'First line'
    const text2 = 'Second line'
    const b1 = Buffer.from(text1, 'utf-8')
    const b2 = Buffer.from(text2, 'utf-8')
    const buf = Buffer.concat([
      Buffer.from([0x0a, b1.length]),
      b1,
      Buffer.from([0x12, b2.length]), // field 2, wire type 2
      b2,
    ])
    const result = extractTextFromProtobuf(buf)
    expect(result).toContain('First line')
    expect(result).toContain('Second line')
  })

  it('skips binary data that is not valid text', () => {
    // Field with control characters should be skipped
    const binaryData = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04])
    const buf = Buffer.concat([
      Buffer.from([0x0a, binaryData.length]),
      binaryData,
    ])
    expect(extractTextFromProtobuf(buf)).toBe('')
  })

  it('skips single-byte strings', () => {
    const buf = Buffer.concat([
      Buffer.from([0x0a, 0x01]),
      Buffer.from('A'),
    ])
    expect(extractTextFromProtobuf(buf)).toBe('')
  })

  it('handles varint fields gracefully', () => {
    // Field 1, wire type 0 (varint), value 150 (two bytes: 0x96 0x01)
    // Then field 2, wire type 2, string "test"
    const text = 'test'
    const textBytes = Buffer.from(text)
    const buf = Buffer.concat([
      Buffer.from([0x08, 0x96, 0x01]), // varint
      Buffer.from([0x12, textBytes.length]), // string field
      textBytes,
    ])
    expect(extractTextFromProtobuf(buf)).toContain('test')
  })
})

describe('decompressNoteBody', () => {
  it('returns empty string for null', () => {
    expect(decompressNoteBody(null)).toBe('')
  })

  it('returns empty string for empty buffer', () => {
    expect(decompressNoteBody(Buffer.alloc(0))).toBe('')
  })

  it('decompresses gzipped protobuf data', () => {
    const text = 'Hello from gzip'
    const textBytes = Buffer.from(text, 'utf-8')
    const protobuf = Buffer.concat([
      Buffer.from([0x0a, textBytes.length]),
      textBytes,
    ])
    const gzipped = gzipSync(protobuf)
    expect(decompressNoteBody(gzipped)).toContain('Hello from gzip')
  })

  it('falls back to raw text for non-gzipped data', () => {
    const raw = Buffer.from('plain text fallback', 'utf-8')
    expect(decompressNoteBody(raw)).toBe('plain text fallback')
  })
})

describe('fetchNotes (integration)', () => {
  it('returns an array of notes with expected shape', () => {
    if (!isAppleNotesAvailable()) {
      console.log('Apple Notes database not found, skipping integration test')
      return
    }

    const notes = fetchNotes()

    expect(Array.isArray(notes)).toBe(true)
    for (const note of notes) {
      expect(typeof note.id).toBe('number')
      expect(typeof note.title).toBe('string')
      expect(typeof note.body).toBe('string')
      expect(typeof note.isPinned).toBe('boolean')
      expect(typeof note.createdAt).toBe('string')
      expect(typeof note.modifiedAt).toBe('string')
      // folderName and accountName can be null
      expect(
        note.folderName === null || typeof note.folderName === 'string',
      ).toBe(true)
      expect(
        note.accountName === null || typeof note.accountName === 'string',
      ).toBe(true)
    }

    if (notes.length > 0) {
      console.log(`Fetched ${notes.length} notes`)
      console.log('Sample:', {
        id: notes[0].id,
        title: notes[0].title.slice(0, 60),
        bodyPreview: notes[0].body.slice(0, 80) + (notes[0].body.length > 80 ? '…' : ''),
        folder: notes[0].folderName,
        isPinned: notes[0].isPinned,
        modifiedAt: notes[0].modifiedAt,
      })
    }
  })
})
