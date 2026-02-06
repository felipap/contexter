"use client"

import { useEffect, useState, useCallback } from "react"
import { getWhatsappMessages, type WhatsappMessage, type SortBy } from "./actions"
import { maybeDecrypt } from "@/lib/encryption"

export type DecryptedMessage = WhatsappMessage & {
  decryptedText: string | null
  decryptedChatName: string | null
  decryptedSenderName: string | null
}

type UseMessageListOptions = {
  pageSize?: number
  initialSortBy?: SortBy
}

export function useMessageList(options: UseMessageListOptions = {}) {
  const { pageSize = 20, initialSortBy = "timestamp" } = options

  const [messages, setMessages] = useState<DecryptedMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [sortBy, setSortBy] = useState<SortBy>(initialSortBy)

  const decryptMessages = useCallback(
    async (msgs: WhatsappMessage[]): Promise<DecryptedMessage[]> => {
      return Promise.all(
        msgs.map(async (msg) => {
          const [decryptedText, decryptedChatName, decryptedSenderName] =
            await Promise.all([
              maybeDecrypt(msg.text),
              maybeDecrypt(msg.chatName),
              maybeDecrypt(msg.senderName),
            ])
          return {
            ...msg,
            decryptedText,
            decryptedChatName,
            decryptedSenderName,
          }
        })
      )
    },
    []
  )

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getWhatsappMessages(page, pageSize, sortBy)
      const decrypted = await decryptMessages(data.messages)
      setMessages(decrypted)
      setTotalPages(data.totalPages)
      setTotal(data.total)
      setLoading(false)
    }
    load()
  }, [page, pageSize, sortBy, decryptMessages])

  function handleSortChange(newSortBy: SortBy) {
    setSortBy(newSortBy)
    setPage(1)
  }

  return {
    messages,
    loading,
    page,
    totalPages,
    total,
    sortBy,
    setPage,
    setSortBy: handleSortChange,
  }
}
