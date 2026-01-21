import { ServiceSection, ServiceInfo } from '../ServiceSection'
import { FullDiskPermission } from '../FullDiskPermission'
import { HistoricalBackfill } from './HistoricalBackfill'

const SERVICE: ServiceInfo = {
  name: 'imessage',
  label: 'iMessage Export',
  description: 'Export iMessage conversations to the server',
  getConfig: () => window.electron.getIMessageExportConfig(),
  setConfig: (config) => window.electron.setIMessageExportConfig(config),
  intervalOptions: [
    { value: 1, label: 'Every 1 minute' },
    { value: 5, label: 'Every 5 minutes' },
    { value: 15, label: 'Every 15 minutes' },
    { value: 30, label: 'Every 30 minutes' },
    { value: 60, label: 'Every hour' },
  ],
}

export function IMessageService() {
  return (
    <ServiceSection service={SERVICE}>
      <FullDiskPermission description="iMessage export requires Full Disk Access to read your messages database." />
      <HistoricalBackfill />
    </ServiceSection>
  )
}
