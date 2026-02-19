export interface Chat {
  chatId: string
  chatName: string | null
  isGroupChat: boolean
  lastMessageText: string | null
  lastMessageDate: Date | null
  lastMessageFromMe: boolean
  participantCount: number
  participants: string[]
  messageCount: number
}

export interface ChatRow {
  chat_id: string
  chat_name: string | null
  text: string | null
  timestamp: number | null
  is_from_me: number
  participant_count: number
  is_group_chat: number
  participants: string
  message_count: number
}

export function parseChats(rows: ChatRow[]): Chat[] {
  return rows.map((row) => ({
    chatId: row.chat_id,
    chatName: row.chat_name,
    isGroupChat: Boolean(row.is_group_chat),
    lastMessageText: row.text,
    lastMessageDate: row.timestamp ? new Date(row.timestamp) : null,
    lastMessageFromMe: Boolean(row.is_from_me),
    participantCount: Number(row.participant_count),
    participants: JSON.parse(row.participants) as string[],
    messageCount: Number(row.message_count),
  }))
}
