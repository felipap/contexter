"use client"

import { ChatsTable } from "./ChatsTable"
import { useChatList } from "./useChatList"
import { WhatsappChatsSearch } from "./WhatsappChatsSearch"

export default function Page() {
  const {
    chats,
    loading,
    page,
    totalPages,
    total,
    search,
    setPage,
    setSearch,
  } = useChatList()

  return (
    <>
      <WhatsappChatsSearch
        search={search}
        setSearch={setSearch}
        total={total}
        debounceMs={300}
      />

      {loading ? (
        <p className="text-zinc-500">Loading...</p>
      ) : chats.length === 0 ? (
        <p className="text-zinc-500">
          {search ? "No chats match your search." : "No WhatsApp chats yet."}
        </p>
      ) : (
        <ChatsTable
          chats={chats}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </>
  )
}
