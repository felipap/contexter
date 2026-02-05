import { useState, useEffect } from 'react'
import { ServiceConfig } from '../../../../electron'
import { FullDiskPermission } from '../FullDiskPermission'
import { withBoundary } from '../../../../shared/ui/withBoundary'
import {
  ServiceContainer,
  ServiceDescription,
  ToggleRow,
  IntervalSelect,
  LoadingSkeleton,
} from '../shared'

type Props = {
  onEnabledChange: (enabled: boolean) => void
}

const INTERVAL_OPTIONS = [
  { value: 30, label: 'Every 30 minutes' },
  { value: 60, label: 'Every hour' },
  { value: 360, label: 'Every 6 hours' },
  { value: 720, label: 'Every 12 hours' },
  { value: 1440, label: 'Every 24 hours' },
]

export const ContactsConfig = withBoundary(function ContactsConfig({
  onEnabledChange,
}: Props) {
  const [config, setConfig] = useState<ServiceConfig | null>(null)

  useEffect(() => {
    window.electron.getContactsSyncConfig().then(setConfig)
  }, [])

  const handleToggleEnabled = async () => {
    if (!config) {
      return
    }
    const newEnabled = !config.enabled
    await window.electron.setContactsSyncConfig({ enabled: newEnabled })
    setConfig({ ...config, enabled: newEnabled })
    onEnabledChange(newEnabled)
  }

  const handleIntervalChange = async (minutes: number) => {
    if (!config) {
      return
    }
    await window.electron.setContactsSyncConfig({ intervalMinutes: minutes })
    setConfig({ ...config, intervalMinutes: minutes })
  }

  if (!config) {
    return <LoadingSkeleton />
  }

  return (
    <ServiceContainer>
      <ServiceDescription>
        Sync your contacts to the server.
      </ServiceDescription>

      <FullDiskPermission description="Contacts sync requires Full Disk Access to read your contacts database." />

      <ToggleRow
        label="Enable Contacts Sync"
        enabled={config.enabled}
        onChange={handleToggleEnabled}
      />

      <IntervalSelect
        value={config.intervalMinutes}
        options={INTERVAL_OPTIONS}
        onChange={handleIntervalChange}
        disabled={!config.enabled}
      />
    </ServiceContainer>
  )
})
