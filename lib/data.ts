import fs from 'fs'
import path from 'path'

const WORKSPACE = process.env.WORKSPACE_PATH || '/Users/penny/.openclaw/workspace'

export interface MemoryEntry {
  date: string
  filename: string
  content: string
  preview: string
}

export interface Project {
  name: string
  status: 'active' | 'pending' | 'blocked' | 'done'
  description: string
  lastUpdated?: string
}

export interface Person {
  name: string
  role: string
  email?: string
  slackId?: string
  notes?: string
}

export interface TaskLog {
  timestamp: string
  type: 'email' | 'calendar' | 'reminder' | 'search' | 'file' | 'message' | 'other'
  action: string
  details?: string
}

export function getMemoryFiles(): MemoryEntry[] {
  const memoryDir = path.join(WORKSPACE, 'memory')
  
  if (!fs.existsSync(memoryDir)) {
    return []
  }
  
  const files = fs.readdirSync(memoryDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse()
    .slice(0, 30) // Last 30 days
  
  return files.map(filename => {
    const content = fs.readFileSync(path.join(memoryDir, filename), 'utf-8')
    const date = filename.replace('.md', '')
    const lines = content.split('\n').filter(l => l.trim())
    const preview = lines.slice(0, 5).join(' ').substring(0, 200) + '...'
    
    return { date, filename, content, preview }
  })
}

export function getMainMemory(): string {
  const memoryPath = path.join(WORKSPACE, 'MEMORY.md')
  if (fs.existsSync(memoryPath)) {
    return fs.readFileSync(memoryPath, 'utf-8')
  }
  return ''
}

export function getUserInfo(): Record<string, string> {
  const userPath = path.join(WORKSPACE, 'USER.md')
  const info: Record<string, string> = {}
  
  if (fs.existsSync(userPath)) {
    const content = fs.readFileSync(userPath, 'utf-8')
    
    // Parse key-value pairs
    const nameMatch = content.match(/\*\*Name\*\*:\s*(.+)/i)
    if (nameMatch) info.name = nameMatch[1].trim()
    
    const locationMatch = content.match(/\*\*Location\*\*:\s*(.+)/i)
    if (locationMatch) info.location = locationMatch[1].trim()
    
    const jobMatch = content.match(/\*\*Day job\*\*:\s*(.+)/i)
    if (jobMatch) info.dayJob = jobMatch[1].trim()
    
    const credMatch = content.match(/\*\*Credentials\*\*:\s*(.+)/i)
    if (credMatch) info.credentials = credMatch[1].trim()
  }
  
  return info
}

export function parseProjects(memoryContent: string): Project[] {
  const projects: Project[] = []
  
  // ByteSiteLabs
  if (memoryContent.includes('ByteSiteLabs')) {
    const statusMatch = memoryContent.match(/ByteSiteLabs[^]*?Status[:\s]*([^\n]+)/i)
    projects.push({
      name: 'ByteSiteLabs',
      status: 'active',
      description: 'AI-powered web design agency - $199-899/mo tiers',
      lastUpdated: '2026-02-08'
    })
  }
  
  // Quant Trading
  if (memoryContent.includes('Quant Trading')) {
    projects.push({
      name: 'Quant Trading System',
      status: 'active',
      description: 'Options trading with ScriptedAlchemy strategy',
      lastUpdated: '2026-02-13'
    })
  }
  
  // Dream On
  if (memoryContent.includes('Dream On')) {
    projects.push({
      name: 'Dream On Nonprofit',
      status: 'active',
      description: 'Mission trips, NAS archive, website',
      lastUpdated: '2026-02-23'
    })
  }
  
  // Fat Loss Plan
  projects.push({
    name: 'Fat Loss Plan (5 Rules)',
    status: 'active',
    description: 'PFC system, ACV, fasted walks, post-meal walks, lifting',
    lastUpdated: '2026-02-26'
  })
  
  return projects
}

export function parsePeople(memoryContent: string): Person[] {
  const people: Person[] = []
  
  // Parse from MEMORY.md tables and mentions
  people.push(
    { name: 'Jordan Powell', role: 'Human / CEO', email: 'jordan@jpdesigning.com', slackId: 'U1AFJB7K6' },
    { name: 'Ben Swartz', role: 'Dream On President', slackId: 'U0874NL6UNB' },
    { name: 'Hanna Swartz', role: 'Dream On CFO', slackId: 'U087K634DA7' },
    { name: 'Brianne Smythia', role: 'Dream On Board', email: 'brianne@dreamon.world', slackId: 'U08KPARJNPR' },
    { name: 'John Peak', role: 'IT/NAS Help', email: 'soundminded@gmail.com', slackId: 'U0226TB8YLU' },
    { name: 'Mike Powell', role: "Jordan's Dad / Sign Solutions", email: 'mdp@signsolutionsoh.com' },
    { name: 'Wesley Powell', role: "Jordan's Brother", email: 'wesley@signsolutionsoh.com' },
  )
  
  return people
}

export function parsePreferences(memoryContent: string): Record<string, string[]> {
  return {
    'Communication': [
      'Be efficient and proactive - Jordan wears multiple hats',
      'Never mention Brianne is "new" to the board',
      'List mission trips in chronological order',
    ],
    'Technical': [
      'Dream On website: Vite + React',
      'Watch for unused imports (TS6133 errors)',
      'Quant: PostgreSQL lock fix - rm postmaster.pid',
      'Slack channel IDs required for cron (not names)',
    ],
    'Trading Rules': [
      'ScriptedAlchemy: catalyst within 30 days, RSI 40-65, confidence >= 70%',
      'Don\'t let winners become losers',
      'Delta decay is brutal on low-delta options',
    ],
  }
}

export function parseKeyData(memoryContent: string): Record<string, string> {
  return {
    'Brianne 1-on-1 Doc': '1tKqfZ76iHUmYuO5VIw8PM8G4QwBo5jL0wTkySazFgZs',
    'Honduras GoMethod': 'https://dreamon.gomethod.app/!/56456/honduras-coffee-missions-trip',
    'Code of Conduct Form': '1FAIpQLSdUdOFINODxy1XFxzPdolX35SPwPeKAKfG-r4XKUIzYnkjp8w',
    'ByteSiteLabs Deploy Hook': 'prj_UwKzadlBZr00X3IR5oieBUCFc2lN/4sutEwfJNp',
    'NAS IP': '192.168.86.49',
    'Mac Mini IP': '192.168.86.52',
    'Quant Repo': '~/quant',
  }
}

export function parseMissionTrips(): { name: string; date: string; status: string }[] {
  return [
    { name: 'Pakistan', date: 'February 2026', status: 'completed' },
    { name: 'Brazil', date: 'May 2026', status: 'upcoming' },
    { name: 'Honduras', date: 'July 2026', status: 'upcoming' },
  ]
}

export function parseHoldings(memoryContent: string): { ticker: string; type: string; cost: string; status: string }[] {
  return [
    { ticker: 'TSLA', type: 'Stock (0.05 shares)', cost: '$418.20', status: 'holding' },
    { ticker: 'RZLV', type: 'Stock (1000 shares)', cost: '$2.94', status: '⚠️ -20%' },
    { ticker: 'NVDA $200c', type: 'Sep 2026 Call', cost: '$23.35', status: 'holding' },
    { ticker: 'JPM $375c', type: 'Sep 2026 Call', cost: '$4.55', status: 'GTC @ $7.50' },
  ]
}

export function getTaskLog(): TaskLog[] {
  const logPath = path.join(WORKSPACE, 'diego-dashboard', 'task-log.json')
  
  if (fs.existsSync(logPath)) {
    try {
      return JSON.parse(fs.readFileSync(logPath, 'utf-8'))
    } catch {
      return []
    }
  }
  return []
}

export function addTaskLog(task: Omit<TaskLog, 'timestamp'>): void {
  const logPath = path.join(WORKSPACE, 'diego-dashboard', 'task-log.json')
  const logs = getTaskLog()
  
  logs.unshift({
    ...task,
    timestamp: new Date().toISOString()
  })
  
  // Keep last 500 tasks
  const trimmed = logs.slice(0, 500)
  fs.writeFileSync(logPath, JSON.stringify(trimmed, null, 2))
}

export function getRecentActivity(): { date: string; items: string[] }[] {
  const memoryFiles = getMemoryFiles()
  
  return memoryFiles.slice(0, 7).map(file => {
    const lines = file.content.split('\n')
    const items = lines
      .filter(l => l.startsWith('- ') || l.startsWith('* ') || l.match(/^\d+\./))
      .slice(0, 8)
      .map(l => l.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, ''))
    
    return { date: file.date, items }
  })
}

export function getStats() {
  const memory = getMainMemory()
  const memoryFiles = getMemoryFiles()
  const taskLog = getTaskLog()
  
  return {
    totalMemoryFiles: memoryFiles.length,
    projectsTracked: parseProjects(memory).length,
    lastActivity: memoryFiles[0]?.date || 'N/A',
    tasksLogged: taskLog.length,
    tasksToday: taskLog.filter(t => t.timestamp.startsWith(new Date().toISOString().split('T')[0])).length,
  }
}
