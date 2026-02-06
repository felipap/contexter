// Run this with:
// `npx electron node_modules/vitest/vitest.mjs run backend/sources/whatsapp-sqlite/index.test.ts`
// if you get sqlite3 incompatibility issues.

import { describe, expect, it } from 'vitest'
import {
  openWhatsAppDatabase,
  fetchChats,
  fetchMessages,
  fetchMessagesBatch,
  getChatCount,
  getMessageCount,
  getMessageCountSince,
  getWhatsAppDatabasePath,
  isWhatsAppInstalled,
} from './index'
import type { WhatsappSqliteMessage } from './types'

describe('whatsapp-sqlite', () => {
  it('should find WhatsApp database path', () => {
    const path = getWhatsAppDatabasePath()
    expect(path).toContain('WhatsApp.shared/ChatStorage.sqlite')
  })

  it('should detect WhatsApp installation', () => {
    const installed = isWhatsAppInstalled()
    // This will be true if WhatsApp Desktop is installed
    console.log('WhatsApp Desktop installed:', installed)
    expect(typeof installed).toBe('boolean')
  })

  // These tests only run if WhatsApp is installed
  describe.skipIf(!isWhatsAppInstalled())('with WhatsApp installed', () => {
    it('should open database and get counts', () => {
      const db = openWhatsAppDatabase()
      try {
        const chatCount = getChatCount(db)
        const messageCount = getMessageCount(db)

        console.log(`Found ${chatCount} chats and ${messageCount} messages`)

        expect(chatCount).toBeGreaterThan(0)
        expect(messageCount).toBeGreaterThan(0)
      } finally {
        db.close()
      }
    })

    it('should fetch chats', () => {
      const db = openWhatsAppDatabase()
      try {
        const chats = fetchChats(db)

        console.log(`Fetched ${chats.length} chats`)
        if (chats.length > 0) {
          console.log('First chat:', chats[0])
        }

        expect(chats.length).toBeGreaterThan(0)
        expect(chats[0]).toHaveProperty('id')
        expect(chats[0]).toHaveProperty('jid')
        expect(chats[0]).toHaveProperty('name')
      } finally {
        db.close()
      }
    })

    it('should fetch recent messages', () => {
      const db = openWhatsAppDatabase()
      try {
        // Fetch messages from last 7 days to catch more messages
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const messages = fetchMessages(db, since)
        // sort by timestamp descending (most recent first)
        messages.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )

        console.log(`Fetched ${messages.length} messages from last 24 hours`)

        // Focus on individual (non-group) chat messages
        const individualChatMessages = messages.filter(
          (m) => !m.chatIsGroupChat,
        )
        console.log(
          `Individual chat messages: ${individualChatMessages.length}`,
        )

        // Show first few individual chat messages
        for (let i = 0; i < Math.min(6, individualChatMessages.length); i++) {
          const message = individualChatMessages[i]
          console.log(`Individual Message N-${i}:`, message)
        }

        // Check phone numbers in individual chats specifically
        const individualWithPhone = individualChatMessages.filter(
          (m) => m.senderPhoneNumber !== null,
        )
        console.log(
          `Individual chat messages with phone numbers: ${individualWithPhone.length}`,
        )
        
        // Check individual incoming messages (where phone lookup should work)
        const incomingIndividual = individualChatMessages.filter(
          (m) => !m.isFromMe,
        )
        console.log(`Incoming individual messages: ${incomingIndividual.length}`)
        const incomingWithPhone = incomingIndividual.filter(
          (m) => m.senderPhoneNumber !== null,
        )
        console.log(
          `Incoming individual with phone: ${incomingWithPhone.length}`,
        )

        // Test specific chat: 554599551968@s.whatsapp.net
        const targetChatMessages = individualChatMessages.filter(
          (m) => m.chatId === '554599551968@s.whatsapp.net',
        )
        console.log(
          `Messages from 554599551968@s.whatsapp.net: ${targetChatMessages.length}`,
        )
        for (const msg of targetChatMessages.slice(0, 3)) {
          console.log('Target chat message:', msg)
        }

        expect(Array.isArray(messages)).toBe(true)
        if (messages.length > 0) {
          expect(messages[0]).toHaveProperty('id')
          expect(messages[0]).toHaveProperty('chatId')
          expect(messages[0]).toHaveProperty('chatIsGroupChat')
          expect(messages[0]).toHaveProperty('timestamp')
          expect(messages[0]).toHaveProperty('senderPhoneNumber')
        }
      } finally {
        db.close()
      }
    })

    it('fetchMessagesBatch yields same messages as fetchMessages when iterated (streaming)', () => {
      const db = openWhatsAppDatabase()
      try {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const allAtOnce = fetchMessages(db, since)

        const batchSize = 50
        const batched: WhatsappSqliteMessage[] = []
        let nextAfterDate: number | undefined = undefined
        let nextAfterId: number | undefined = undefined
        for (;;) {
          const { messages, nextAfterMessageDate, nextAfterId: nextId } =
            fetchMessagesBatch(db, since, batchSize, nextAfterDate, nextAfterId)
          batched.push(...messages)
          if (nextAfterMessageDate === null) {
            break
          }
          nextAfterDate = nextAfterMessageDate
          nextAfterId = nextId ?? undefined
        }

        expect(batched.length).toBe(allAtOnce.length)
        expect(batched.map((m) => m.id)).toEqual(allAtOnce.map((m) => m.id))
      } finally {
        db.close()
      }
    })

    it('getMessageCountSince matches fetchMessages length', () => {
      const db = openWhatsAppDatabase()
      try {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const count = getMessageCountSince(db, since)
        const messages = fetchMessages(db, since)
        expect(count).toBe(messages.length)
      } finally {
        db.close()
      }
    })

    it('fetchMessagesBatch respects limit and returns nextAfter for pagination', () => {
      const db = openWhatsAppDatabase()
      try {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const { messages: first, nextAfterMessageDate, nextAfterId } =
          fetchMessagesBatch(db, since, 2, undefined, undefined)
        expect(first.length).toBeLessThanOrEqual(2)
        if (first.length === 2) {
          expect(nextAfterMessageDate).not.toBeNull()
          expect(nextAfterId).not.toBeNull()
          const { messages: second } = fetchMessagesBatch(
            db,
            since,
            2,
            nextAfterMessageDate ?? undefined,
            nextAfterId ?? undefined,
          )
          expect(second.length).toBeLessThanOrEqual(2)
          expect(second.every((m) => m.id !== first[0].id)).toBe(true)
        } else {
          expect(nextAfterMessageDate).toBeNull()
          expect(nextAfterId).toBeNull()
        }
      } finally {
        db.close()
      }
    })
  })
})
