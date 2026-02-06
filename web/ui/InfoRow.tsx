type Props = {
  label: string
  value: string
}

export function InfoRow({ label, value }: Props) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-500">
        {label}
      </label>
      <p className="text-sm text-zinc-800 dark:text-zinc-200">{value}</p>
    </div>
  )
}
