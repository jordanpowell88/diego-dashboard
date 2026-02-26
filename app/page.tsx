'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface Project {
  name: string
  status: 'active' | 'pending' | 'blocked' | 'done'
  description: string
  details?: string[]
  url?: string
  repo?: string
  lastUpdated?: string
}

interface Person {
  name: string
  role: string
  email?: string
  slackId?: string
  organization?: string
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
  current?: string
  status: string
  pnl?: string
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
  stats: { totalMemoryFiles: number; projectsTracked: number; activeProjects: number; lastActivity: string; tasksLogged: number; tasksToday: number; peopleTracked: number }
  lastUpdated: string
}

const TABS = ['Overview', 'Projects', 'Memory', 'People', 'Tasks', 'Trading'] as const
type Tab = typeof TABS[number]

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)

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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-xl text-gray-400">Loading Diego Command Center...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#0d0d0d] border-b border-[#262626] px-8 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl">📈</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Diego Command Center</h1>
              <p className="text-sm text-gray-400">
                {data?.userInfo.name || 'Jordan Powell'} • {data?.stats.activeProjects} active projects
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Updated: {data?.lastUpdated ? format(new Date(data.lastUpdated), 'MMM d, h:mm a') : 'N/A'}
          </div>
        </div>
        
        {/* Tabs */}
        <nav className="flex gap-1 mt-4 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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
        {activeTab === 'Projects' && <ProjectsTab data={data} expandedProject={expandedProject} setExpandedProject={setExpandedProject} />}
        {activeTab === 'Memory' && <MemoryTab data={data} selectedMemory={selectedMemory} setSelectedMemory={setSelectedMemory} />}
        {activeTab === 'People' && <PeopleTab data={data} />}
        {activeTab === 'Tasks' && <TasksTab data={data} cronJobs={cronJobs} />}
        {activeTab === 'Trading' && <TradingTab data={data} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] p-4 text-center text-gray-500 text-sm">
        Diego AI Assistant • Powered by OpenClaw • {data?.stats.projectsTracked} projects • {data?.stats.peopleTracked} contacts
      </footer>
    </div>
  )
}

function OverviewTab({ data, cronJobs }: { data: DashboardData | null; cronJobs: CronJob[] }) {
  return (
    <>
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <StatCard label="Active Projects" value={data?.stats.activeProjects || 0} icon="📋" />
        <StatCard label="Total Projects" value={data?.stats.projectsTracked || 0} icon="📁" />
        <StatCard label="Memory Files" value={data?.stats.totalMemoryFiles || 0} icon="🧠" />
        <StatCard label="Cron Jobs" value={cronJobs.filter(j => j.enabled).length} icon="⏰" />
        <StatCard label="Tasks Today" value={data?.stats.tasksToday || 0} icon="✅" />
        <StatCard label="People" value={data?.stats.peopleTracked || 0} icon="👥" />
        <StatCard label="Last Update" value={data?.stats.lastActivity || 'N/A'} icon="📅" small />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Projects Summary */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <span>📋</span> Active Projects
          </h2>
          <div className="space-y-3">
            {data?.projects.filter(p => p.status === 'active').map((project, i) => (
              <div key={i} className="border-b border-[#262626] pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-white">{project.name}</h3>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener" className="text-xs text-blue-400 hover:underline">
                      {project.url.replace('https://', '')}
                    </a>
                  )}
                </div>
                <p className="text-sm text-gray-400">{project.description}</p>
                {project.details && (
                  <p className="text-xs text-gray-500 mt-1">{project.details[0]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <span>✅</span> Recent Activity
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {data?.taskLog.slice(0, 8).map((task, i) => (
              <div key={i} className="flex items-start gap-2 py-2 border-b border-[#262626] last:border-0">
                <TypeIcon type={task.type} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white truncate">{task.action}</p>
                  {task.details && (
                    <p className="text-xs text-gray-400 truncate">{task.details}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {format(new Date(task.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Trips */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <span>✈️</span> 2026 Mission Trips
          </h2>
          <div className="space-y-3">
            {data?.missionTrips.map((trip, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#262626] last:border-0">
                <div>
                  <p className="font-medium text-white">{trip.name}</p>
                  <p className="text-sm text-gray-400">{trip.date}</p>
                </div>
                <span className={`badge ${trip.status === 'completed' ? 'badge-done' : 'badge-pending'}`}>
                  {trip.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Tasks */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <span>⏰</span> Scheduled Jobs
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {cronJobs.slice(0, 8).map((job, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#262626] last:border-0">
                <div>
                  <p className="font-medium text-sm text-white">{job.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{job.schedule}</p>
                </div>
                <span className={`w-2 h-2 rounded-full ${job.enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
          <span>⚙️</span> Preferences & Rules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data?.preferences && Object.entries(data.preferences).map(([category, items], i) => (
            <div key={i}>
              <h3 className="font-medium text-gray-300 mb-2">{category}</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                {items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
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

function ProjectsTab({ data, expandedProject, setExpandedProject }: { 
  data: DashboardData | null
  expandedProject: string | null
  setExpandedProject: (v: string | null) => void 
}) {
  const statusOrder = { active: 0, pending: 1, blocked: 2, done: 3 }
  const sortedProjects = [...(data?.projects || [])].sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">All Projects ({data?.projects.length})</h2>
      
      {sortedProjects.map((project, i) => (
        <div key={i} className="card">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedProject(expandedProject === project.name ? null : project.name)}
          >
            <div className="flex items-center gap-4">
              <span className={`badge badge-${project.status}`}>{project.status}</span>
              <div>
                <h3 className="font-semibold text-lg text-white">{project.name}</h3>
                <p className="text-sm text-gray-400">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {project.url && (
                <a 
                  href={project.url} 
                  target="_blank" 
                  rel="noopener" 
                  className="text-sm text-blue-400 hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  🔗 {project.url.replace('https://', '')}
                </a>
              )}
              <span className="text-gray-500 text-xl">{expandedProject === project.name ? '▼' : '▶'}</span>
            </div>
          </div>
          
          {expandedProject === project.name && project.details && (
            <div className="mt-4 pt-4 border-t border-[#262626]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {project.details.map((detail, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">{detail}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-4 text-xs text-gray-500">
                {project.repo && <span>📁 {project.repo}</span>}
                {project.lastUpdated && <span>📅 Updated: {project.lastUpdated}</span>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
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
      <div className="card lg:col-span-1">
        <h2 className="text-xl font-semibold mb-4 text-white">📅 Memory Files</h2>
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

      <div className="card lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4 text-white">
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
  const grouped = (data?.people || []).reduce((acc, person) => {
    const org = person.organization || 'Other'
    if (!acc[org]) acc[org] = []
    acc[org].push(person)
    return acc
  }, {} as Record<string, typeof data.people>)

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">People Directory ({data?.people.length})</h2>
      
      {Object.entries(grouped).map(([org, people]) => (
        <div key={org}>
          <h3 className="text-lg font-semibold text-gray-300 mb-4">{org}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {people?.map((person, i) => (
              <div key={i} className="card">
                <h4 className="font-semibold text-lg text-white">{person.name}</h4>
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
      ))}
    </div>
  )
}

function TasksTab({ data, cronJobs }: { data: DashboardData | null; cronJobs: CronJob[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
          <span>📝</span> Task History
        </h2>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {data?.taskLog.map((task, i) => (
            <div key={i} className="border-b border-[#262626] pb-2 last:border-0">
              <div className="flex items-center gap-2">
                <TypeIcon type={task.type} />
                <span className="font-medium text-sm text-white">{task.action}</span>
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
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
          <span>⏰</span> All Cron Jobs ({cronJobs.length})
        </h2>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {cronJobs.map((job, i) => (
            <div key={i} className="bg-[#0a0a0a] rounded-lg p-3 border border-[#262626]">
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{job.name}</p>
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
  const totalValue = data?.holdings.reduce((sum, h) => {
    const current = parseFloat(h.current?.replace('$', '') || '0')
    return sum + current
  }, 0) || 0

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Portfolio Value" value="$6,164.83" icon="💰" />
        <StatCard label="Positions" value={data?.holdings.length || 0} icon="📊" />
        <StatCard label="Best Performer" value="AAPL +41.4%" icon="🚀" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <span>📊</span> Current Holdings
          </h2>
          <div className="space-y-3">
            {data?.holdings.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[#262626] last:border-0">
                <div>
                  <p className="font-bold text-lg text-white">{h.ticker}</p>
                  <p className="text-sm text-gray-400">{h.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">Cost: {h.cost}</p>
                  {h.current && <p className="text-sm text-gray-300">Now: {h.current}</p>}
                  <p className={`text-sm font-medium ${h.pnl?.startsWith('+') ? 'text-green-400' : h.pnl?.startsWith('-') ? 'text-red-400' : 'text-gray-400'}`}>
                    {h.pnl} {h.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <span>📜</span> ScriptedAlchemy Rules
          </h2>
          <ul className="space-y-2 text-sm text-gray-300 mb-6">
            <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Catalyst required within 30 days</li>
            <li className="flex items-start gap-2"><span className="text-green-400">✓</span> RSI between 40-65</li>
            <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Confidence score ≥ 70%</li>
            <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Premium max: $35</li>
            <li className="flex items-start gap-2"><span className="text-green-400">✓</span> DTE: 180-365 days</li>
          </ul>
          
          <h3 className="font-medium text-gray-300 mb-2">Trading Lessons</h3>
          <ul className="space-y-1 text-sm text-gray-400">
            <li>• Delta decay is brutal on low-delta options</li>
            <li>• Don't let winners become losers</li>
            <li>• GTC orders far from current rarely fill</li>
            <li>• Verify catalyst dates manually</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, small }: { label: string; value: string | number; icon: string; small?: boolean }) {
  return (
    <div className="card flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className={`font-bold text-white ${small ? 'text-sm' : 'text-xl'}`}>{value}</p>
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
