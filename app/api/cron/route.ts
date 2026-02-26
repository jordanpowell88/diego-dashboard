import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Try to get cron jobs from openclaw CLI
    const { stdout } = await execAsync('openclaw cron list --json 2>/dev/null || echo "[]"')
    
    let jobs = []
    try {
      jobs = JSON.parse(stdout.trim())
    } catch {
      // Fallback: return known jobs from memory
      jobs = [
        { id: '1', name: 'ACV Reminder - Before Lunch', schedule: '0 12 * * *', enabled: true },
        { id: '2', name: 'ACV Reminder - Before Dinner', schedule: '45 18 * * *', enabled: true },
        { id: '3', name: 'Quant - Premarket Check', schedule: '30 6 * * 1-5', enabled: true },
        { id: '4', name: 'Quant - Trading Signals', schedule: '35 9 * * 1-5', enabled: true },
        { id: '5', name: 'Quant - Midday Check', schedule: '0 12 * * 1-5', enabled: true },
      ]
    }
    
    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Error fetching cron jobs:', error)
    return NextResponse.json({ jobs: [] })
  }
}
