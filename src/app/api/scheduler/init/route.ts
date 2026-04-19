// src/app/api/scheduler/init/route.ts
// This route is called once on app startup to start the reminder scheduler.

import { NextRequest, NextResponse } from 'next/server';
import { startScheduler } from '@/lib/scheduler';

let initialized = false;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const initSecret = process.env.SCHEDULER_INIT_SECRET || process.env.CRON_SECRET;
  if (!initSecret) {
    return NextResponse.json({ error: 'Scheduler init secret not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${initSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!initialized) {
    startScheduler();
    initialized = true;
    return NextResponse.json({ message: 'Scheduler started' });
  }
  return NextResponse.json({ message: 'Scheduler already running' });
}