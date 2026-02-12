"use client"

import { CloseIcon, LockIcon } from "@/ui/icons"
import { useEffect, useState } from "react"
import { getScreenshotData, type Screenshot } from "./actions"
import {
  decryptBufferFromDataUrl,
  isEncryptedBuffer,
  getEncryptionKey,
} from "@/lib/encryption"

type Props = {
  screenshot: Screenshot
  onClose: () => void
}

export function ScreenshotPreview({ screenshot, onClose }: Props) {
  const [imageData, setImageData] = useState<string | null>(null)
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [decryptionFailed, setDecryptionFailed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAndDecrypt() {
      setLoading(true)
      setDecryptionFailed(false)

      const data = await getScreenshotData(screenshot.id)
      if (!data) {
        setImageData(null)
        setLoading(false)
        return
      }

      const encrypted = isEncryptedBuffer(data)
      setIsEncrypted(encrypted)

      if (encrypted) {
        const encryptionKey = getEncryptionKey()
        if (!encryptionKey) {
          setDecryptionFailed(true)
          setImageData(null)
          setLoading(false)
          return
        }

        const decrypted = await decryptBufferFromDataUrl(data, encryptionKey)
        if (!decrypted) {
          setDecryptionFailed(true)
          setImageData(null)
        } else {
          setImageData(decrypted)
        }
      } else {
        setImageData(data)
      }

      setLoading(false)
    }

    loadAndDecrypt()
  }, [screenshot.id])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <span className="flex items-center gap-2 text-sm font-medium">
            {screenshot.width} × {screenshot.height}
            {isEncrypted && !decryptionFailed && (
              <span className="text-green-500" title="Decrypted">
                <LockIcon size={12} />
              </span>
            )}
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-secondary transition-colors hover:bg-zinc-100 hover:text-contrast dark:hover:bg-zinc-800"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex min-h-[200px] items-center justify-center overflow-auto p-2">
          {loading ? (
            <span className="text-secondary">Loading...</span>
          ) : decryptionFailed ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <LockIcon size={32} />
              <span className="text-amber-500">
                Encrypted screenshot - enter key to decrypt
              </span>
              <span className="text-xs text-secondary">
                Click the lock icon in the navigation bar
              </span>
            </div>
          ) : imageData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageData}
              alt={`Screenshot ${screenshot.id}`}
              className="max-h-[80vh] rounded-lg object-contain"
            />
          ) : (
            <span className="text-secondary">Failed to load screenshot</span>
          )}
        </div>
      </div>
    </div>
  )
}
