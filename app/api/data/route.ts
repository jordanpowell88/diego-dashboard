import { NextResponse } from 'next/server'
import { 
  getMemoryFiles, 
  getMainMemory, 
  getUserInfo,
  parseProjects, 
  parsePeople,
  parsePreferences,
  parseKeyData,
  parseMissionTrips,
  parseHoldings,
  getRecentActivity, 
  getTaskLog,
  getStats,
  getSkills
} from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const memory = getMainMemory()
    const memoryFiles = getMemoryFiles()
    const userInfo = getUserInfo()
    const projects = parseProjects(memory)
    const people = parsePeople(memory)
    const preferences = parsePreferences(memory)
    const keyData = parseKeyData(memory)
    const missionTrips = parseMissionTrips()
    const holdings = parseHoldings(memory)
    const recentActivity = getRecentActivity()
    const taskLog = getTaskLog()
    const stats = getStats()
    const skills = getSkills()
    
    return NextResponse.json({
      userInfo,
      projects,
      people,
      preferences,
      keyData,
      missionTrips,
      holdings,
      memoryFiles: memoryFiles.map(f => ({
        date: f.date,
        preview: f.preview,
        content: f.content
      })),
      recentActivity,
      taskLog: taskLog.slice(0, 50), // Last 50 tasks
      stats,
      skills,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
