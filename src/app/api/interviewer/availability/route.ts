import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth(['INTERVIEWER']);

    const profile = await prisma.interviewerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Interviewer profile not found' },
        { status: 404 }
      );
    }

    const slots = await prisma.availabilitySlot.findMany({
      where: { interviewerId: profile.id },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json({ slots });
  } catch (error: any) {
    console.error('Get availability slots error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(['INTERVIEWER']);
    const body = await request.json();

    const { startTime, endTime } = body;

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'Start time and end time are required' },
        { status: 400 }
      );
    }

    const profile = await prisma.interviewerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Please complete your profile first' },
        { status: 400 }
      );
    }

    if (profile.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Your profile must be approved before adding availability' },
        { status: 403 }
      );
    }

    const slot = await prisma.availabilitySlot.create({
      data: {
        interviewerId: profile.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return NextResponse.json({ slot });
  } catch (error: any) {
    console.error('Create availability slot error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(['INTERVIEWER']);
    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get('id');

    if (!slotId) {
      return NextResponse.json(
        { error: 'Slot ID is required' },
        { status: 400 }
      );
    }

    const profile = await prisma.interviewerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Interviewer profile not found' },
        { status: 404 }
      );
    }

    // Check if slot belongs to this interviewer and is not booked
    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        id: parseInt(slotId),
        interviewerId: profile.id,
        isBooked: false,
      },
    });

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found or already booked' },
        { status: 404 }
      );
    }

    await prisma.availabilitySlot.delete({
      where: { id: slot.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete availability slot error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}