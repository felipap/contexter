"use client"

import { maybeDecrypt } from "@/lib/encryption"
import { useEffect, useState } from "react"

interface Props {
  children: string | null
}

export function Decrypted({ children }: Props) {
  const [decrypted, setDecrypted] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const decrypted = await maybeDecrypt(children)
      if (decrypted) {
        setDecrypted(decrypted)
      }
    }
    load()
  }, [children])

  return decrypted ? (
    <span className="text-sm font-medium">{decrypted}</span>
  ) : (
    "Encrypted: " + children
  )
}
