import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth(['STUDENT']);

    // Get all approved interviewers who offer guidance sessions
    const interviewers = await prisma.interviewerProfile.findMany({
      where: {
        status: 'APPROVED',
        sessionTypesOffered: {
          has: 'GUIDANCE',
        },
      },
      include: {
        availabilitySlots: {
          where: {
            startTime: {
              gte: new Date(),
            },
            isBooked: false,
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    return NextResponse.json({ interviewers });
  } catch (error: any) {
    console.error('Get interviewer list error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}