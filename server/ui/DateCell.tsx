type Props = {
  primaryDate: Date | string | null
  secondaryDate: Date | string | null
  secondaryLabel: string
}

export function DateCell({
  primaryDate,
  secondaryDate,
  secondaryLabel,
}: Props) {
  return (
    <div className="flex flex-col">
      <span className="text-contrast/80">
        {primaryDate ? new Date(primaryDate).toLocaleString() : "—"}
      </span>
      {secondaryDate && (
        <span className="text-xs text-contrast/60">
          {secondaryLabel}: {new Date(secondaryDate).toLocaleString()}
        </span>
      )}
    </div>
  )
}
