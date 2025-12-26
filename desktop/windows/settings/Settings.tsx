import { useState } from 'react'
import { MainTab } from './main/MainTab'
import { LogsTab } from './logs/LogsTab'

type Tab = 'general' | 'logs'

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
        active
          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
          : 'border-transparent text-[var(--text-color-secondary)] hover:text-[var(--color-contrast)]'
      }`}
    >
      {children}
    </button>
  )
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('general')

  return (
    <div className="h-screen flex flex-col bg-[var(--background-color-one)]">
      <div className="flex-shrink-0 border-b px-4 pt-2">
        <div className="flex gap-2">
          <TabButton
            active={activeTab === 'general'}
            onClick={() => setActiveTab('general')}
          >
            General
          </TabButton>
          <TabButton
            active={activeTab === 'logs'}
            onClick={() => setActiveTab('logs')}
          >
            Logs
          </TabButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'general' && <MainTab />}
        {activeTab === 'logs' && <LogsTab />}
      </div>
    </div>
  )
}
