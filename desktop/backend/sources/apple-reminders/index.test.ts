// Run locally from desktop/: npm run test -- backend/sources/apple-reminders/index.test.ts

import { describe, expect, it } from 'vitest'
import {
  coreDataTimestampToDate,
  fetchReminders,
  isAppleRemindersAvailable,
} from './index'

describe('coreDataTimestampToDate', () => {
  it('returns null for null', () => {
    expect(coreDataTimestampToDate(null)).toBeNull()
  })

  it('returns null for zero', () => {
    expect(coreDataTimestampToDate(0)).toBeNull()
  })

  it('converts Core Data epoch (0-ish) to Jan 1, 2001', () => {
    // Core Data epoch is Jan 1, 2001 00:00:00 UTC
    // A timestamp of 1 second after epoch
    const date = coreDataTimestampToDate(1)
    expect(date).toBeInstanceOf(Date)
    expect(date!.toISOString()).toBe('2001-01-01T00:00:01.000Z')
  })

  it('converts a known date correctly', () => {
    // 2025-01-01T00:00:00Z = Unix 1735689600
    // Core Data = 1735689600 - 978307200 = 757382400
    const date = coreDataTimestampToDate(757382400)
    expect(date).toBeInstanceOf(Date)
    expect(date!.toISOString()).toBe('2025-01-01T00:00:00.000Z')
  })

  it('handles fractional timestamps', () => {
    const date = coreDataTimestampToDate(757382400.5)
    expect(date).toBeInstanceOf(Date)
    expect(date!.getTime()).toBe(new Date('2025-01-01T00:00:00.500Z').getTime())
  })
})

describe('fetchReminders (integration)', () => {
  it.skipIf(!isAppleRemindersAvailable())(
    'returns an array of reminders with expected shape',
    () => {
      const reminders = fetchReminders()

      expect(Array.isArray(reminders)).toBe(true)
      expect(reminders.length).toBeGreaterThan(0)

      for (const r of reminders) {
        expect(typeof r.id).toBe('string')
        expect(r.id.length).toBeGreaterThan(0)
        expect(typeof r.title).toBe('string')
        expect(typeof r.completed).toBe('boolean')
        expect(typeof r.flagged).toBe('boolean')
        expect(typeof r.priority).toBe('number')
        expect(r.notes === null || typeof r.notes === 'string').toBe(true)
        expect(r.listName === null || typeof r.listName === 'string').toBe(true)
        expect(r.dueDate === null || r.dueDate instanceof Date).toBe(true)
        expect(
          r.completionDate === null || r.completionDate instanceof Date,
        ).toBe(true)
        expect(
          r.creationDate === null || r.creationDate instanceof Date,
        ).toBe(true)
        expect(
          r.lastModifiedDate === null || r.lastModifiedDate instanceof Date,
        ).toBe(true)
      }

      if (reminders.length > 0) {
        console.log(`Fetched ${reminders.length} reminders`)
        console.log('Sample:', {
          id: reminders[0].id,
          title: reminders[0].title.slice(0, 60),
          completed: reminders[0].completed,
          listName: reminders[0].listName,
          priority: reminders[0].priority,
          creationDate: reminders[0].creationDate?.toISOString(),
        })
      }
    },
  )

  it.skipIf(!isAppleRemindersAvailable())(
    'completed reminders have completion dates',
    () => {
      const reminders = fetchReminders()
      const completed = reminders.filter((r) => r.completed)

      for (const r of completed) {
        expect(r.completionDate).toBeInstanceOf(Date)
      }
    },
  )

  it.skipIf(!isAppleRemindersAvailable())(
    'all reminders have creation dates',
    () => {
      const reminders = fetchReminders()

      for (const r of reminders) {
        expect(r.creationDate).toBeInstanceOf(Date)
      }
    },
  )

  it.skipIf(!isAppleRemindersAvailable())(
    'reminder dates are within a reasonable range',
    () => {
      const reminders = fetchReminders()
      const now = Date.now()
      const year2001 = new Date('2001-01-01').getTime()

      for (const r of reminders) {
        if (r.creationDate) {
          expect(r.creationDate.getTime()).toBeGreaterThan(year2001)
          expect(r.creationDate.getTime()).toBeLessThanOrEqual(now + 60_000)
        }
        if (r.dueDate) {
          expect(r.dueDate.getTime()).toBeGreaterThan(year2001)
        }
      }
    },
  )
})
