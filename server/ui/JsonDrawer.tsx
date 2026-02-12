"use client"

import { useEffect, useRef } from "react"
import { CloseIcon } from "./icons"

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  data: unknown
}

export function JsonDrawer({ isOpen, onClose, title, data }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        ref={drawerRef}
        className="relative w-full max-w-lg animate-slide-in bg-white shadow-2xl dark:bg-zinc-900"
        style={{
          animation: "slideIn 0.2s ease-out",
        }}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-contrast">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-secondary transition-colors hover:bg-zinc-100 hover:text-contrast dark:hover:bg-zinc-800"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="h-[calc(100vh-73px)] overflow-auto p-6">
          <pre className="whitespace-pre-wrap break-all rounded-lg bg-zinc-50 p-4 font-mono text-sm text-contrast dark:bg-zinc-950">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
