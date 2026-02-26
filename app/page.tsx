'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface Project {
  name: string
  status: 'active' | 'pending' | 'blocked' | 'done'
  description: string
  lastUpdated?: string
}

interface Person {
  name: string
  role: string
  email?: string
  slackId?: string
}

interface TaskLog {
  timestamp: string
  type: string
  action: string
  details?: string
}

interface CronJob {
  id: string
  name: string
  schedule: string
  enabled: boolean
}

interface Holding {
  ticker: string
  type: string
  cost: string
  status: string
}

interface DashboardData {
  userInfo: Record<string, string>
  projects: Project[]
  people: Person[]
  preferences: Record<string, string[]>
  keyData: Record<string, string>
  missionTrips: { name: string; date: string; status: string }[]
  holdings: Holding[]
  memoryFiles: { date: string; preview: string; content: string }[]
  recentActivity: { date: string; items: string[] }[]
  taskLog: TaskLog[]
  stats: { totalMemoryFiles: number; projectsTracked: number; lastActivity: string; tasksLogged: number; tasksToday: number }
  lastUpdated: string
}

const TABS = ['Overview', 'Memory', 'People', 'Tasks', 'Trading'] as const
type Tab = typeof TABS[number]

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/data').then(r => r.json()),
      fetch('/api/cron').then(r => r.json())
    ]).then(([dashData, cronData]) => {
      setData(dashData)
      setCronJobs(cronData.jobs || [])
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading Diego Command Center...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[#0d0d0d] border-b border-[#262626] px-8 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl">📈</span>
            <div>
              <h1 className="text-2xl font-bold">Diego Command Center</h1>
              <p className="text-sm text-gray-400">
                {data?.userInfo.name || 'Jordan Powell'} • {data?.stats.lastActivity}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Updated: {data?.lastUpdated ? format(new Date(data.lastUpdated), 'h:mm a') : 'N/A'}
          </div>
        </div>
        
        {/* Tabs */}
        <nav className="flex gap-1 mt-4">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="p-8">
        {activeTab === 'Overview' && <OverviewTab data={data} cronJobs={cronJobs} />}
        {activeTab === 'Memory' && <MemoryTab data={data} selectedMemory={selectedMemory} setSelectedMemory={setSelectedMemory} />}
        {activeTab === 'People' && <PeopleTab data={data} />}
        {activeTab === 'Tasks' && <TasksTab data={data} cronJobs={cronJobs} />}
        {activeTab === 'Trading' && <TradingTab data={data} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] p-4 text-center text-gray-500 text-sm">
        Diego AI Assistant • Powered by OpenClaw
      </footer>
    </div>
  )
}

function OverviewTab({ data, cronJobs }: { data: DashboardData | null; cronJobs: CronJob[] }) {
  return (
    <>
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Active Projects" value={data?.projects.filter(p => p.status === 'active').length || 0} icon="📋" />
        <StatCard label="Memory Files" value={data?.stats.totalMemoryFiles || 0} icon="🧠" />
        <StatCard label="Scheduled Tasks" value={cronJobs.filter(j => j.enabled).length} icon="⏰" />
        <StatCard label="Tasks Today" value={data?.stats.tasksToday || 0} icon="✅" />
        <StatCard label="People Tracked" value={data?.people.length || 0} icon="👥" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Projects */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📋</span> Active Projects
          </h2>
          <div className="space-y-4">
            {data?.projects.map((project, i) => (
              <div key={i} className="border-b border-[#262626] pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium">{project.name}</h3>
                  <span className={`badge badge-${project.status}`}>{project.status}</span>
                </div>
                <p className="text-sm text-gray-400">{project.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Tasks */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>⏰</span> Scheduled Tasks
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {cronJobs.map((job, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#262626] last:border-0">
                <div>
                  <p className="font-medium text-sm">{job.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{job.schedule}</p>
                </div>
                <span className={`w-2 h-2 rounded-full ${job.enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Mission Trips */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>✈️</span> 2026 Mission Trips
          </h2>
          <div className="space-y-3">
            {data?.missionTrips.map((trip, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{trip.name}</p>
                  <p className="text-sm text-gray-400">{trip.date}</p>
                </div>
                <span className={`badge ${trip.status === 'completed' ? 'badge-done' : 'badge-pending'}`}>
                  {trip.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Data */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🔑</span> Key Data
          </h2>
          <div className="space-y-2 text-sm">
            {data?.keyData && Object.entries(data.keyData).map(([key, value], i) => (
              <div key={i} className="flex justify-between gap-4">
                <span className="text-gray-400">{key}</span>
                <span className="font-mono text-xs truncate max-w-[200px]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>⚙️</span> Preferences & Rules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data?.preferences && Object.entries(data.preferences).map(([category, items], i) => (
            <div key={i}>
              <h3 className="font-medium text-gray-300 mb-2">{category}</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                {items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function MemoryTab({ data, selectedMemory, setSelectedMemory }: { 
  data: DashboardData | null
  selectedMemory: string | null
  setSelectedMemory: (v: string | null) => void 
}) {
  const selected = data?.memoryFiles.find(f => f.date === selectedMemory)
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Memory File List */}
      <div className="card lg:col-span-1">
        <h2 className="text-xl font-semibold mb-4">📅 Memory Files</h2>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {data?.memoryFiles.map((file, i) => (
            <button
              key={i}
              onClick={() => setSelectedMemory(file.date)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedMemory === file.date 
                  ? 'bg-blue-600/20 border border-blue-500' 
                  : 'hover:bg-[#1a1a1a] border border-transparent'
              }`}
            >
              <p className="font-medium text-blue-400">{file.date}</p>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{file.preview}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Memory Content */}
      <div className="card lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">
          {selected ? `📝 ${selected.date}` : '📝 Select a memory file'}
        </h2>
        {selected ? (
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-[#0a0a0a] p-4 rounded-lg max-h-[600px] overflow-y-auto">
            {selected.content}
          </pre>
        ) : (
          <p className="text-gray-400">Click a memory file to view its contents</p>
        )}
      </div>
    </div>
  )
}

function PeopleTab({ data }: { data: DashboardData | null }) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span>👥</span> People Directory
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.people.map((person, i) => (
          <div key={i} className="bg-[#0a0a0a] rounded-lg p-4 border border-[#262626]">
            <h3 className="font-semibold text-lg">{person.name}</h3>
            <p className="text-sm text-blue-400 mb-2">{person.role}</p>
            {person.email && (
              <p className="text-xs text-gray-400">📧 {person.email}</p>
            )}
            {person.slackId && (
              <p className="text-xs text-gray-400">💬 {person.slackId}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TasksTab({ data, cronJobs }: { data: DashboardData | null; cronJobs: CronJob[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Task Log */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>📝</span> Recent Task Log
        </h2>
        {data?.taskLog && data.taskLog.length > 0 ? (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {data.taskLog.map((task, i) => (
              <div key={i} className="border-b border-[#262626] pb-2 last:border-0">
                <div className="flex items-center gap-2">
                  <TypeIcon type={task.type} />
                  <span className="font-medium text-sm">{task.action}</span>
                </div>
                {task.details && (
                  <p className="text-xs text-gray-400 mt-1 ml-6">{task.details}</p>
                )}
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  {format(new Date(task.timestamp), 'MMM d, h:mm a')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No tasks logged yet. Tasks will appear here as Diego performs actions.</p>
        )}
      </div>

      {/* Cron Jobs */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>⏰</span> All Scheduled Tasks
        </h2>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {cronJobs.map((job, i) => (
            <div key={i} className="bg-[#0a0a0a] rounded-lg p-3 border border-[#262626]">
              <div className="flex items-center justify-between">
                <p className="font-medium">{job.name}</p>
                <span className={`badge ${job.enabled ? 'badge-active' : 'bg-gray-500/20 text-gray-400'}`}>
                  {job.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-1">{job.schedule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TradingTab({ data }: { data: DashboardData | null }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Holdings */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>📊</span> Current Holdings
        </h2>
        <div className="space-y-3">
          {data?.holdings.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#262626] last:border-0">
              <div>
                <p className="font-bold text-lg">{h.ticker}</p>
                <p className="text-sm text-gray-400">{h.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">{h.cost}</p>
                <p className="text-xs">{h.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Rules */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>📜</span> ScriptedAlchemy Rules
        </h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>Catalyst required within 30 days</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>RSI between 40-65</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>Confidence score ≥ 70%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>Premium max: $35</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>DTE: 180-365 days</span>
          </li>
        </ul>
        
        <h3 className="font-medium mt-6 mb-2 text-gray-300">Lessons Learned</h3>
        <ul className="space-y-1 text-sm text-gray-400">
          <li>• Delta decay is brutal on low-delta options</li>
          <li>• Don't let winners become losers</li>
          <li>• GTC orders far from current rarely fill</li>
        </ul>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="card flex items-center gap-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  )
}

function TypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    email: '📧',
    calendar: '📅',
    reminder: '⏰',
    search: '🔍',
    file: '📁',
    message: '💬',
    other: '📌'
  }
  return <span>{icons[type] || icons.other}</span>
}
