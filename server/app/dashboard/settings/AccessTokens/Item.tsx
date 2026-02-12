type Props = {
  label: string
  children: React.ReactNode
  description?: string
}

export function Item({ label, children, description }: Props) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {description && (
        <p className="mt-1 text-xs text-secondary">
          {description}
        </p>
      )}
    </div>
  )
}
