import { ServiceSection, ServiceInfo } from '../ServiceSection'
import { FullDiskPermission } from '../FullDiskPermission'

const SERVICE: ServiceInfo = {
  name: 'contacts',
  label: 'Contacts Sync',
  description: 'Sync your contacts to the server',
  getConfig: () => window.electron.getContactsSyncConfig(),
  setConfig: (config) => window.electron.setContactsSyncConfig(config),
  intervalOptions: [
    { value: 30, label: 'Every 30 minutes' },
    { value: 60, label: 'Every hour' },
    { value: 360, label: 'Every 6 hours' },
    { value: 720, label: 'Every 12 hours' },
    { value: 1440, label: 'Every 24 hours' },
  ],
}

export function ContactsService() {
  return (
    <ServiceSection service={SERVICE}>
      <FullDiskPermission description="Contacts sync requires Full Disk Access to read your contacts database." />
    </ServiceSection>
  )
}
