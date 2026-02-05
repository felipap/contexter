"use client"

import { useEffect, useState, useCallback } from "react"
import {
  getWhatsappChats,
  getContactLookup,
  type WhatsappChat,
  type ContactLookup,
} from "./actions"
import { decryptText, isEncrypted, getEncryptionKey } from "@/lib/encryption"

export type DecryptedChat = WhatsappChat & { decryptedLastMessage: string | null }

type UseChatListOptions = {
  pageSize?: number
}

export function useChatList(options: UseChatListOptions = {}) {
  const { pageSize = 20 } = options

  const [chats, setChats] = useState<DecryptedChat[]>([])
  const [contactLookup, setContactLookup] = useState<ContactLookup>({})
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")

  const decryptChats = useCallback(
    async (rawChats: WhatsappChat[]): Promise<DecryptedChat[]> => {
      const encryptionKey = getEncryptionKey()
      return Promise.all(
        rawChats.map(async (chat) => {
          if (!chat.lastMessageText || !isEncrypted(chat.lastMessageText)) {
            return { ...chat, decryptedLastMessage: chat.lastMessageText }
          }
          if (!encryptionKey) {
            return { ...chat, decryptedLastMessage: null }
          }
          const decrypted = await decryptText(chat.lastMessageText, encryptionKey)
          return { ...chat, decryptedLastMessage: decrypted }
        })
      )
    },
    []
  )

  useEffect(() => {
    getContactLookup().then(setContactLookup)
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getWhatsappChats(page, pageSize, search)
      const decrypted = await decryptChats(data.chats)
      setChats(decrypted)
      setTotalPages(data.totalPages)
      setTotal(data.total)
      setLoading(false)
    }
    load()
  }, [page, pageSize, search, decryptChats])

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  return {
    chats,
    contactLookup,
    loading,
    page,
    totalPages,
    total,
    search,
    setPage,
    setSearch: handleSearchChange,
  }
}
