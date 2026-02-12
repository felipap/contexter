export type {
  SyncLog,
  SyncLogSource,
  ServiceConfig,
  IMessageExportConfig,
  ServiceStatus,
  BackfillProgress,
  ElectronAPI,
  WhatsappSqliteConfig,
} from '../shared-types'

import type { ElectronAPI } from '../shared-types'

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
