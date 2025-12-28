"use client"

import { useEffect, useState } from "react"
import { getScreenshots, type Screenshot } from "./actions"
import { ScreenshotsTable } from "./ScreenshotsTable"
import { ScreenshotPreview } from "./ScreenshotPreview"

export default function Page() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [previewScreenshot, setPreviewScreenshot] = useState<Screenshot | null>(
    null
  )

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getScreenshots(page)
      setScreenshots(data.screenshots)
      setTotalPages(data.totalPages)
      setTotal(data.total)
      setLoading(false)
    }
    load()
  }, [page])

  let inner
  if (loading) {
    inner = <p className="text-zinc-500">Loading...</p>
  } else if (screenshots.length === 0) {
    inner = <p className="text-zinc-500">No screenshots yet.</p>
  } else {
    inner = (
      <ScreenshotsTable
        screenshots={screenshots}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onPreview={setPreviewScreenshot}
      />
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Screenshots</h1>
        <span className="text-sm text-zinc-500">
          {total.toLocaleString()} total
        </span>
      </div>

      {inner}

      {previewScreenshot && (
        <ScreenshotPreview
          screenshot={previewScreenshot}
          onClose={() => setPreviewScreenshot(null)}
        />
      )}
    </div>
  )
}
