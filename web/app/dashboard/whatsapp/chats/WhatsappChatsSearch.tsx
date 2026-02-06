"use client"

import { SearchIcon } from "@/ui/icons"
import { useEffect, useRef, useState } from "react"

/**
 * WhatsApp chats search bar and explanation.
 *
 * Search behavior depends on which fields are encrypted and whether the
 * dashboard has the decryption key:
 *
 * - **Always searchable** (stored in plain): sender JID and chat ID. You can
 *   search by these without the dashboard being decrypted.
 *
 * - **Searchable only when the dashboard is decrypted**: sender phone number
 *   and sender name. When the key is available, search supports exact match
 *   on these decrypted fields.
 *
 * The current implementation matches on sender JID (digits only, e.g. phone
 * digits from the JID). Chat ID, sender phone, and sender name may be added
 * to the backend when decryption is available.
 */
type Props = {
  search: string
  setSearch: (value: string) => void
  total: number
  debounceMs?: number
}

export function WhatsappChatsSearch({
  search,
  setSearch,
  total,
  debounceMs = 300,
}: Props) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      <div className="flex items-center gap-4">
        <SearchInput
          placeholder="Search by sender JID or phone digits..."
          onChange={setSearch}
          debounceMs={debounceMs}
        />
        <span className="text-sm text-zinc-500">
          {total.toLocaleString()} {search ? "matching" : "total"} chats
        </span>
      </div>
      <p className="text-xs text-zinc-400">
        Always searchable: sender JID and chat ID (plain). When the dashboard
        has the decryption key, exact match on sender phone and sender name
        also applies. Use digits for JID/phone (e.g. +1234567890).
      </p>
    </div>
  )
}

type SearchInputProps = {
  placeholder?: string
  onChange: (value: string) => void
  debounceMs?: number
}

function SearchInput({
  placeholder,
  onChange,
  debounceMs = 300,
}: SearchInputProps) {
  const [value, setValue] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      onChange(value)
    }, debounceMs)
    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [value, debounceMs, onChange])

  return (
    <div className="relative">
      <div className="absolute top-2.5 left-2">
        <SearchIcon size={16} className="text-zinc-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-[300px] rounded-lg border border-zinc-200 bg-white py-2 pl-7 pr-3 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-600"
      />
    </div>
  )
}
