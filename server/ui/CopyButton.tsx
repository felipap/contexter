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
      className="text-secondary hover:text-secondary"
      title="Copy to clipboard"
    >
      {copied ? <CheckIcon size={size} /> : <CopyIcon size={size} />}
    </button>
  )
}
