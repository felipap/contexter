import { ServiceSection, ServiceInfo } from '../ServiceSection'
import { ScreenRecordingPermission } from '../ScreenRecordingPermission'

const SERVICE: ServiceInfo = {
  name: 'screenshots',
  label: 'Screen Capture',
  description: 'Automatically capture screenshots at regular intervals',
  getConfig: () => window.electron.getScreenCaptureConfig(),
  setConfig: (config) => window.electron.setScreenCaptureConfig(config),
  intervalOptions: [
    { value: 1, label: 'Every 1 minute' },
    { value: 2, label: 'Every 2 minutes' },
    { value: 5, label: 'Every 5 minutes' },
    { value: 10, label: 'Every 10 minutes' },
    { value: 15, label: 'Every 15 minutes' },
    { value: 30, label: 'Every 30 minutes' },
  ],
}

export function ScreenshotsService() {
  return (
    <ServiceSection service={SERVICE}>
      <ScreenRecordingPermission />
    </ServiceSection>
  )
}
