"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon } from "@/ui/icons"

type Props = {
  text: string
  size?: number
}

export function CopyButton({ text, size = 14 }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      title="Copy to clipboard"
    >
      {copied ? <CheckIcon size={size} /> : <CopyIcon size={size} />}
    </button>
  )
}
