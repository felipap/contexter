"use client"

import { Pagination } from "@/ui/Pagination"
import { type Screenshot } from "./actions"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

const columnHelper = createColumnHelper<Screenshot>()

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => (
      <span className="font-mono">{info.getValue().slice(0, 8)}...</span>
    ),
  }),
  columnHelper.display({
    id: "dimensions",
    header: "Dimensions",
    cell: ({ row }) => `${row.original.width} × ${row.original.height}`,
  }),
  columnHelper.accessor("sizeBytes", {
    header: "Size",
    cell: (info) => formatBytes(info.getValue()),
  }),
  columnHelper.accessor("capturedAt", {
    header: "Captured",
    cell: (info) => (
      <span className="text-zinc-500">
        {new Date(info.getValue()).toLocaleString()}
      </span>
    ),
  }),
]

type Props = {
  screenshots: Screenshot[]
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onPreview: (screenshot: Screenshot) => void
}

export function ScreenshotsTable({
  screenshots,
  page,
  totalPages,
  onPageChange,
  onPreview,
}: Props) {
  const table = useReactTable({
    data: screenshots,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-zinc-500"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onPreview(row.original)}
                className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 Bytes"
  }
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
