import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth(['STUDENT']);

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    const sessions = await prisma.session.findMany({
      where: { studentId: studentProfile.id },
      include: {
        interviewer: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        feedback: true,
      },
      orderBy: { scheduledTime: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Get student sessions error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}