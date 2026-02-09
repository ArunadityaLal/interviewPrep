import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(['STUDENT']);
    const body = await request.json();

    const { interviewerId, topic, durationMinutes, scheduledTime } = body;

    if (!interviewerId || !topic || !durationMinutes || !scheduledTime) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Get student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Please complete your profile first' },
        { status: 400 }
      );
    }

    // Verify interviewer exists and is approved
    const interviewer = await prisma.interviewerProfile.findUnique({
      where: { id: parseInt(interviewerId) },
    });

    if (!interviewer || interviewer.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Interviewer not available' },
        { status: 400 }
      );
    }

    // Check if interviewer offers guidance sessions
    if (!interviewer.sessionTypesOffered.includes('GUIDANCE')) {
      return NextResponse.json(
        { error: 'This interviewer does not offer guidance sessions' },
        { status: 400 }
      );
    }

    // Find and book availability slot
    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        interviewerId: interviewer.id,
        startTime: new Date(scheduledTime),
        isBooked: false,
      },
    });

    if (!slot) {
      return NextResponse.json(
        { error: 'Selected time slot is not available' },
        { status: 400 }
      );
    }

    // Create session and mark slot as booked
    const [session] = await prisma.$transaction([
      prisma.session.create({
        data: {
          studentId: studentProfile.id,
          interviewerId: interviewer.id,
          sessionType: 'GUIDANCE',
          topic,
          durationMinutes: parseInt(durationMinutes),
          scheduledTime: new Date(scheduledTime),
        },
        include: {
          interviewer: true,
        },
      }),
      prisma.availabilitySlot.update({
        where: { id: slot.id },
        data: { isBooked: true },
      }),
    ]);

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('Book guidance session error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}