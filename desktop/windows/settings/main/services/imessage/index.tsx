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

function InfoIcon() {
  return (
    <svg
      className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function AttachmentNotice() {
  return (
    <div className="flex gap-2 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <InfoIcon />
      <p className="text-sm text-blue-700 dark:text-blue-300">
        Only images (JPEG, PNG, GIF, HEIC) are uploaded. Videos and other
        attachments are skipped to save bandwidth.
      </p>
    </div>
  )
}

export function IMessageService() {
  return (
    <ServiceSection service={SERVICE}>
      <FullDiskPermission description="iMessage export requires Full Disk Access to read your messages database." />
      <AttachmentNotice />
      <HistoricalBackfill />
    </ServiceSection>
  )
}
