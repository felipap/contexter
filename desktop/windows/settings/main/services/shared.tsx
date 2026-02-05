import { ReactNode } from 'react'

type ToggleProps = {
  enabled: boolean
  onChange: () => void
}

export function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

type ToggleRowProps = {
  label: string
  enabled: boolean
  onChange: () => void
}

export function ToggleRow({ label, enabled, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  )
}

type IntervalOption = {
  value: number
  label: string
}

type IntervalSelectProps = {
  value: number
  options: IntervalOption[]
  onChange: (minutes: number) => void
  disabled?: boolean
}

export function IntervalSelect({
  value,
  options,
  onChange,
  disabled,
}: IntervalSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">Interval</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-md border bg-[var(--background-color-three)] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

type ServiceContainerProps = {
  children: ReactNode
}

export function ServiceContainer({ children }: ServiceContainerProps) {
  return <div className="space-y-4">{children}</div>
}

type ServiceDescriptionProps = {
  children: ReactNode
}

export function ServiceDescription({ children }: ServiceDescriptionProps) {
  return (
    <p className="text-sm text-[var(--text-color-secondary)]">{children}</p>
  )
}

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded" />
  )
}
