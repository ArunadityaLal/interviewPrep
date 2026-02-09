import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth(['ADMIN']);

    const [
      totalStudents,
      totalInterviewers,
      pendingInterviewers,
      approvedInterviewers,
      totalSessions,
      completedSessions,
      scheduledSessions,
      guidanceSessions,
      interviewSessions,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.interviewerProfile.count(),
      prisma.interviewerProfile.count({ where: { status: 'PENDING' } }),
      prisma.interviewerProfile.count({ where: { status: 'APPROVED' } }),
      prisma.session.count(),
      prisma.session.count({ where: { status: 'COMPLETED' } }),
      prisma.session.count({ where: { status: 'SCHEDULED' } }),
      prisma.session.count({ where: { sessionType: 'GUIDANCE' } }),
      prisma.session.count({ where: { sessionType: 'INTERVIEW' } }),
    ]);

    // Recent sessions
    const recentSessions = await prisma.session.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        student: true,
        interviewer: true,
      },
    });

    // Top interviewers by session count
    const topInterviewers = await prisma.interviewerProfile.findMany({
      take: 5,
      where: { status: 'APPROVED' },
      include: {
        sessions: {
          where: { status: 'COMPLETED' },
        },
      },
    });

    const topInterviewersWithCount = topInterviewers
      .map(interviewer => ({
        ...interviewer,
        sessionCount: interviewer.sessions.length,
      }))
      .sort((a, b) => b.sessionCount - a.sessionCount);

    return NextResponse.json({
      analytics: {
        totalStudents,
        totalInterviewers,
        pendingInterviewers,
        approvedInterviewers,
        totalSessions,
        completedSessions,
        scheduledSessions,
        guidanceSessions,
        interviewSessions,
      },
      recentSessions,
      topInterviewers: topInterviewersWithCount,
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}