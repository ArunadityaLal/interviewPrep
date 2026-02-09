import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { InterviewerStatus } from '@prisma/client';

export async function GET() {
  try {
    await requireAuth(['ADMIN']);

    const interviewers = await prisma.interviewerProfile.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
        sessions: {
          where: {
            status: 'SCHEDULED',
            scheduledTime: {
              gte: new Date(),
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ interviewers });
  } catch (error: any) {
    console.error('Get interviewers error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAuth(['ADMIN']);
    const body = await request.json();

    const { interviewerId, status } = body;

    if (!interviewerId || !status) {
      return NextResponse.json(
        { error: 'Interviewer ID and status are required' },
        { status: 400 }
      );
    }

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const interviewer = await prisma.interviewerProfile.update({
      where: { id: parseInt(interviewerId) },
      data: { status: status as InterviewerStatus },
    });

    return NextResponse.json({ interviewer });
  } catch (error: any) {
    console.error('Update interviewer status error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}