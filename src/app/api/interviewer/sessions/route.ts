import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth(['INTERVIEWER']);

    const interviewerProfile = await prisma.interviewerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!interviewerProfile) {
      return NextResponse.json(
        { error: 'Interviewer profile not found' },
        { status: 404 }
      );
    }

    const sessions = await prisma.session.findMany({
      where: { interviewerId: interviewerProfile.id },
      include: {
        student: true,
        feedback: true,
      },
      orderBy: { scheduledTime: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Get interviewer sessions error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}