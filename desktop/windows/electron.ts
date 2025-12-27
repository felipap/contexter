export type {
  ApiRequestLog,
  ServiceConfig,
  ServiceStatus,
  BackfillProgress,
  ElectronAPI,
} from '../shared-types'

import type { ElectronAPI } from '../shared-types'

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
