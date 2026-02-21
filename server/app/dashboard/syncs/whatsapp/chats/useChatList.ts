// Decryption must happen client side, very important.

"use client"

import { useEffect, useState, useCallback } from "react"
import {
  getWhatsappChats,
  type WhatsappChat,
  type ChatSearchParams,
} from "./actions"
import {
  maybeDecrypt,
  getEncryptionKey,
  computeSearchIndex,
} from "@/lib/encryption"
import {
  normalizePhoneForSearch,
  normalizeStringForSearch,
} from "@/lib/search-normalize"

export type DecryptedChat = WhatsappChat & {
  decryptedChatName: string | null
  decryptedLastMessage: string | null
}

export type ChatFilters = {
  senderJid: string
  chatId: string
  phone: string
  senderName: string
  chatName: string
}

export const emptyChatFilters: ChatFilters = {
  senderJid: "",
  chatId: "",
  phone: "",
  senderName: "",
  chatName: "",
}

type UseChatListOptions = {
  pageSize?: number
}

async function buildSearchParams(
  filters: ChatFilters
): Promise<ChatSearchParams> {
  const params: ChatSearchParams = {}

  if (filters.senderJid) {
    params.senderJid = filters.senderJid
  }
  if (filters.chatId) {
    params.chatId = filters.chatId
  }

  const key = getEncryptionKey()
  if (key) {
    if (filters.phone) {
      const normalized = normalizePhoneForSearch(filters.phone)
      if (normalized) {
        params.phoneIndex = await computeSearchIndex(normalized, key)
      }
    }
    if (filters.senderName) {
      const normalized = normalizeStringForSearch(filters.senderName)
      if (normalized) {
        params.senderNameIndex = await computeSearchIndex(normalized, key)
      }
    }
    if (filters.chatName) {
      const normalized = normalizeStringForSearch(filters.chatName)
      if (normalized) {
        params.chatNameIndex = await computeSearchIndex(normalized, key)
      }
    }
  }

  return params
}

export function useChatList(options: UseChatListOptions = {}) {
  const { pageSize = 20 } = options

  const [chats, setChats] = useState<DecryptedChat[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<ChatFilters>(emptyChatFilters)

  const hasActiveFilters = Object.values(filters).some((v) => v.length > 0)

  const decryptChats = useCallback(
    async (rawChats: WhatsappChat[]): Promise<DecryptedChat[]> => {
      return Promise.all(
        rawChats.map(async (chat) => ({
          ...chat,
          decryptedChatName: await maybeDecrypt(chat.chatName),
          decryptedLastMessage: await maybeDecrypt(chat.lastMessageText),
        }))
      )
    },
    []
  )

  useEffect(() => {
    async function load() {
      setLoading(true)
      const searchParams = await buildSearchParams(filters)
      const data = await getWhatsappChats(page, pageSize, searchParams)
      const decrypted = await decryptChats(data.chats)
      setChats(decrypted)
      setTotalPages(data.totalPages)
      setTotal(data.total)
      setLoading(false)
    }
    load()
  }, [page, pageSize, filters, decryptChats])

  const handleFilterChange = useCallback(
    (field: keyof ChatFilters, value: string) => {
      setFilters((prev) => {
        if (prev[field] === value) {
          return prev
        }
        return { ...prev, [field]: value }
      })
      setPage(1)
    },
    []
  )

  const clearFilters = useCallback(() => {
    setFilters(emptyChatFilters)
    setPage(1)
  }, [])

  return {
    chats,
    loading,
    page,
    totalPages,
    total,
    filters,
    hasActiveFilters,
    setPage,
    setFilter: handleFilterChange,
    clearFilters,
  }
}
