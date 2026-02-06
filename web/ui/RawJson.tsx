type Props = {
  data: unknown
}

export function RawJson({ data }: Props) {
  return (
    <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <label className="mb-2 block text-sm font-medium text-zinc-500">
        Raw JSON
      </label>
      <pre className="whitespace-pre-wrap break-all rounded-lg bg-zinc-50 p-4 font-mono text-sm text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
