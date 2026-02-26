import { NextResponse } from 'next/server'
import { addTaskLog, getTaskLog } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const tasks = getTaskLog()
  return NextResponse.json({ tasks })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, action, details } = body
    
    addTaskLog({ type, action, details })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging task:', error)
    return NextResponse.json({ error: 'Failed to log task' }, { status: 500 })
  }
}
