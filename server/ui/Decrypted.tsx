"use client"

import { isEncrypted, maybeDecrypt } from "@/lib/encryption"
import { useEffect, useState } from "react"
import { LockIcon } from "./icons"

interface Props {
  children: string | null
  showLockIcon?: boolean
}

export function Decrypted({ children, showLockIcon }: Props) {
  const [decrypted, setDecrypted] = useState<string | null>(null)
  const wasEncrypted = children ? isEncrypted(children) : false

  useEffect(() => {
    async function load() {
      const decrypted = await maybeDecrypt(children)
      if (decrypted) {
        setDecrypted(decrypted)
      }
    }
    load()
  }, [children])

  if (decrypted) {
    if (showLockIcon && wasEncrypted) {
      return (
        <span className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <span className="text-green-500" title="Decrypted">
            <LockIcon size={14} />
          </span>
          {decrypted}
        </span>
      )
    }
    return <>{decrypted}</>
  }

  if (wasEncrypted) {
    return (
      <span className="flex items-center gap-2 text-sm italic text-amber-500">
        <LockIcon size={14} />
        Encrypted - enter key to decrypt
      </span>
    )
  }

  if (showLockIcon) {
    return <span className="text-sm italic text-zinc-400">No content</span>
  }

  return null
}
