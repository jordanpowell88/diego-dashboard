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
  details?: string[]
  url?: string
  repo?: string
  lastUpdated?: string
}

export interface Person {
  name: string
  role: string
  email?: string
  slackId?: string
  organization?: string
}

export interface TaskLog {
  timestamp: string
  type: 'email' | 'calendar' | 'reminder' | 'search' | 'file' | 'message' | 'other'
  action: string
  details?: string
}

export interface Holding {
  ticker: string
  type: string
  cost: string
  current?: string
  status: string
  pnl?: string
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
    .slice(0, 30)
  
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
  return {
    name: 'Jordan Powell',
    location: 'Wapakoneta, Ohio',
    dayJob: 'Senior Software Engineer at Zocdoc',
    sideRole: 'CEO of Dream On nonprofit',
    credentials: 'Google Developer Expert, Nx Certified Expert, conference speaker',
    email: 'jordan@jpdesigning.com',
    slackId: 'U1AFJB7K6'
  }
}

export function parseProjects(): Project[] {
  return [
    {
      name: 'ByteSiteLabs',
      status: 'active',
      description: 'AI-powered web design agency',
      url: 'https://bytesitelabs.com',
      repo: 'bytesitelabs',
      lastUpdated: '2026-02-08',
      details: [
        'Pricing: Starter $199/mo, Growth $499/mo, Enterprise $899/mo',
        'Full marketing site + checkout live',
        '8 blog posts, 3 landing pages, lead magnet',
        'Client dashboard with Google OAuth',
        'Chatbot onboarding (15 questions)',
        'Admin dashboard at /admin',
        'Request/ticket system',
        '25 automated tests',
        'Social media management on Growth/Enterprise tiers',
        'OpenClaw service: Remote $299/mo, Local $149/mo',
        'Trial ready with BETA-TESTER promo code',
        'Lima Chamber partnership pending'
      ]
    },
    {
      name: 'Quant Trading System',
      status: 'active',
      description: 'Options trading bot with ScriptedAlchemy strategy',
      repo: 'jordanpowell88/quant',
      lastUpdated: '2026-02-24',
      details: [
        'Portfolio: $6,164.83 equity',
        'Holdings: TSLA, RZLV, AAPL calls, NVDA calls',
        'AAPL $300c: +41.4% ✅',
        'NVDA $200c: +9.9% (earnings Feb 26)',
        'RZLV: -19.9% ⚠️',
        '11 cron jobs for market monitoring',
        '5 open PRs awaiting review (#35-#39)',
        'ScriptedAlchemy rules: catalyst within 30d, RSI 40-65, confidence ≥70%'
      ]
    },
    {
      name: 'Dream On Nonprofit',
      status: 'active',
      description: 'Faith-based mission trips organization',
      url: 'https://dreamon.world',
      repo: 'dreamonglobal/world',
      lastUpdated: '2026-02-23',
      details: [
        '2026 Trips: Pakistan (Feb), Brazil (May), Honduras (July)',
        'NAS video archive: 64,175 files, 13.19 TB',
        'Proxy generation pipeline for video analysis',
        'Wells campaign: $500/well, goal 200',
        'Website: Vite + React',
        'Honduras trip follow-up sent to Samantha Ark'
      ]
    },
    {
      name: 'Dream On NAS Archive',
      status: 'active',
      description: 'Video archive digitization & AI analysis',
      lastUpdated: '2026-02-23',
      details: [
        'DreamOnVault NAS: 192.168.86.49',
        '64,175 files across 59 mission trips (2016-2024)',
        '13.19 TB of footage',
        'Mac mini HTTP pipeline for proxy generation',
        'Gemini content analysis for video descriptions',
        'SSH access works better than SMB over WiFi'
      ]
    },
    {
      name: 'Water Damage Monitoring System',
      status: 'pending',
      description: 'IoT moisture monitoring for restoration companies',
      lastUpdated: '2026-02-16',
      details: [
        'Competitor: Tramex TREMS-10 ($2,635 for 10 sensors)',
        'Hardware: Heltec LoRa 32 V3, Delmhorst probes, Raspberry Pi hub',
        'MVP cost: ~$2,200',
        'Market: US Damage Restoration $7.1B (2025)',
        'Investor deck in progress',
        'Shopping list ready: moisture-monitor-shopping-list.md'
      ]
    },
    {
      name: 'Sign Solutions of Ohio',
      status: 'done',
      description: 'Family business website (demo)',
      url: 'https://sign-solutions-of-ohio.vercel.app',
      lastUpdated: '2026-02-08',
      details: [
        'Full 11-page site live on Vercel',
        'ByteSiteLabs demo/showcase site',
        'Lima, Ohio sign company',
        'Owner: Mike Powell (Jordan\'s dad)'
      ]
    },
    {
      name: 'Fat Loss Plan (5 Rules)',
      status: 'active',
      description: 'Personal health optimization',
      lastUpdated: '2026-02-26',
      details: [
        'Rule 1: PFC System (Protein → Fiber → Carbs)',
        'Rule 2: Apple Cider Vinegar before meals',
        'Rule 3: Fasted morning walks',
        'Rule 4: Post-meal walks',
        'Rule 5: Resistance training 3-4x/week',
        'Calendar events created for all walks',
        'ACV reminders at 12pm and 6:45pm',
        'AKLUER walking pad purchased'
      ]
    },
    {
      name: 'Diego Command Center',
      status: 'active',
      description: 'AI assistant dashboard',
      url: 'https://diego-dashboard.vercel.app',
      repo: 'jordanpowell88/diego-dashboard',
      lastUpdated: '2026-02-26',
      details: [
        'Real-time project tracking',
        'Memory file browser',
        'Task log',
        'Scheduled jobs overview',
        'Trading dashboard'
      ]
    },
    {
      name: 'All Nations Church Website',
      status: 'pending',
      description: 'Church website project',
      lastUpdated: '2026-02-16',
      details: [
        'Local dev at localhost:5173',
        'Preview shared via localtunnel'
      ]
    }
  ]
}

export function parsePeople(): Person[] {
  return [
    // Jordan
    { name: 'Jordan Powell', role: 'Human / CEO', email: 'jordan@jpdesigning.com', slackId: 'U1AFJB7K6', organization: 'Personal' },
    
    // Dream On
    { name: 'Ben Swartz', role: 'President', slackId: 'U0874NL6UNB', organization: 'Dream On' },
    { name: 'Hanna Swartz', role: 'CFO', slackId: 'U087K634DA7', organization: 'Dream On' },
    { name: 'Brianne Smythia', role: 'Board Member', email: 'brianne@dreamon.world', slackId: 'U08KPARJNPR', organization: 'Dream On' },
    { name: 'John Peak', role: 'IT / NAS Help', email: 'soundminded@gmail.com', slackId: 'U0226TB8YLU', organization: 'Dream On' },
    
    // Family / Sign Solutions
    { name: 'Mike Powell', role: 'Owner (Jordan\'s Dad)', email: 'mdp@signsolutionsoh.com', organization: 'Sign Solutions of Ohio' },
    { name: 'Wesley Powell', role: 'Jordan\'s Brother', email: 'wesley@signsolutionsoh.com', organization: 'Sign Solutions of Ohio' },
    
    // Honduras Interest
    { name: 'Samantha Ark', role: 'Honduras Trip Interest', email: '33samanthaark@gmail.com', organization: 'Dream On' },
  ]
}

export function parsePreferences(): Record<string, string[]> {
  return {
    'Communication': [
      'Be efficient and proactive - Jordan wears multiple hats',
      'Never mention Brianne is "new" to the board',
      'List mission trips in chronological order',
      'Slack channel IDs required for cron (not channel names)'
    ],
    'Technical': [
      'Dream On website: Vite + React',
      'Watch for unused imports (TS6133 errors)',
      'PostgreSQL lock fix: rm postmaster.pid',
      'NAS: SSH works better than SMB over WiFi'
    ],
    'Trading (ScriptedAlchemy)': [
      'Catalyst required within 30 days',
      'RSI between 40-65',
      'Confidence score ≥ 70%',
      'Premium max: $35',
      'DTE: 180-365 days',
      'Delta decay is brutal on low-delta options',
      'Don\'t let winners become losers'
    ]
  }
}

export function parseKeyData(): Record<string, string> {
  return {
    'ByteSiteLabs': 'bytesitelabs.com',
    'Dream On': 'dreamon.world',
    'Honduras GoMethod': 'dreamon.gomethod.app/!/56456/...',
    'Brianne 1-on-1 Doc': 'Google Doc 1tKqfZ76i...',
    'NAS IP': '192.168.86.49',
    'Mac Mini IP': '192.168.86.52',
    'Quant Repo': '~/quant',
    'ByteSiteLabs Repo': '~/.openclaw/workspace/bytesitelabs',
  }
}

export function parseMissionTrips(): { name: string; date: string; status: string }[] {
  const now = new Date()
  const feb2026 = new Date('2026-02-01')
  const may2026 = new Date('2026-05-01')
  const jul2026 = new Date('2026-07-01')
  
  return [
    { name: 'Pakistan', date: 'February 2026', status: now > feb2026 ? 'completed' : 'upcoming' },
    { name: 'Brazil', date: 'May 2026', status: now > may2026 ? 'completed' : 'upcoming' },
    { name: 'Honduras', date: 'July 2026', status: now > jul2026 ? 'completed' : 'upcoming' },
  ]
}

export function parseHoldings(): Holding[] {
  return [
    { ticker: 'TSLA', type: 'Stock (0.05 shares)', cost: '$418.20', current: '$408.91', status: 'holding', pnl: '-2.2%' },
    { ticker: 'RZLV', type: 'Stock (1000 shares)', cost: '$2.94', current: '$2.36', status: '⚠️ underwater', pnl: '-19.9%' },
    { ticker: 'AAPL $300c', type: 'Sep 2026 Call', cost: '$8.97', current: '$12.68', status: '✅ GTC @ $16.45', pnl: '+41.4%' },
    { ticker: 'NVDA $200c', type: 'Sep 2026 Call', cost: '$23.35', current: '$25.65', status: 'earnings Feb 26', pnl: '+9.9%' },
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
  
  // Default task log with recent activity
  return [
    { timestamp: '2026-02-26T13:14:00.000Z', type: 'other', action: 'Created self-optimization cron job', details: 'Daily 2am review of OpenClaw setup' },
    { timestamp: '2026-02-26T13:11:00.000Z', type: 'other', action: 'Built Diego Command Center dashboard', details: 'Next.js dashboard deployed to Vercel' },
    { timestamp: '2026-02-26T11:02:00.000Z', type: 'reminder', action: 'Set ACV reminders', details: 'Daily at 12pm and 6:45pm' },
    { timestamp: '2026-02-26T11:01:00.000Z', type: 'calendar', action: 'Created walking calendar events', details: '4 daily walks: fasted AM, post-breakfast, post-lunch, post-dinner' },
    { timestamp: '2026-02-26T11:00:00.000Z', type: 'search', action: 'Researched walking pads', details: 'Recommended AKLUER ~$120' },
    { timestamp: '2026-02-26T10:50:00.000Z', type: 'other', action: 'Created fat loss daily plan', details: '5 rules from Dr. Mike video' },
    { timestamp: '2026-02-23T22:48:00.000Z', type: 'email', action: 'Sent Honduras follow-up', details: 'Samantha Ark - July mission trip interest' },
    { timestamp: '2026-02-23T21:45:00.000Z', type: 'other', action: 'NAS proxy pipeline', details: 'Generated proxies for Honduras 2024' },
    { timestamp: '2026-02-23T20:00:00.000Z', type: 'other', action: 'Dream On archive inventory', details: '64,175 files, 13.19 TB catalogued' },
  ]
}

export function addTaskLog(task: Omit<TaskLog, 'timestamp'>): void {
  const logPath = path.join(WORKSPACE, 'diego-dashboard', 'task-log.json')
  const logs = getTaskLog()
  
  logs.unshift({
    ...task,
    timestamp: new Date().toISOString()
  })
  
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
  const memoryFiles = getMemoryFiles()
  const taskLog = getTaskLog()
  const projects = parseProjects()
  
  return {
    totalMemoryFiles: memoryFiles.length,
    projectsTracked: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    lastActivity: memoryFiles[0]?.date || 'N/A',
    tasksLogged: taskLog.length,
    tasksToday: taskLog.filter(t => t.timestamp.startsWith(new Date().toISOString().split('T')[0])).length,
    peopleTracked: parsePeople().length,
  }
}
