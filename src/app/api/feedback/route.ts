import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { HiringRecommendation } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.findUnique({
      where: { sessionId: parseInt(sessionId) },
      include: {
        session: {
          include: {
            student: true,
            interviewer: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error('Get feedback error:', error);
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

    const { sessionId, sessionType, ...feedbackData } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const interviewerProfile = await prisma.interviewerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!interviewerProfile) {
      return NextResponse.json(
        { error: 'Interviewer profile not found' },
        { status: 404 }
      );
    }

    const session = await prisma.session.findFirst({
      where: {
        id: parseInt(sessionId),
        interviewerId: interviewerProfile.id,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (sessionType === 'GUIDANCE') {
      const { summary, strengths, recommendations, actionItems } = feedbackData;
      if (!summary || !strengths || !recommendations || !actionItems) {
        return NextResponse.json(
          { error: 'All guidance feedback fields are required' },
          { status: 400 }
        );
      }

      const [feedback] = await prisma.$transaction([
        prisma.feedback.create({
          data: {
            sessionId: session.id,
            interviewerId: interviewerProfile.id,
            summary,
            strengths,
            recommendations,
            actionItems,
          },
        }),
        prisma.session.update({
          where: { id: session.id },
          data: { status: 'COMPLETED' },
        }),
      ]);

      return NextResponse.json({ feedback });
    } else if (sessionType === 'INTERVIEW') {
      const {
        summary,
        technicalDepth,
        problemSolving,
        communication,
        confidence,
        overallComments,
        hiringRecommendation,
      } = feedbackData;

      if (
        !summary ||
        !technicalDepth ||
        !problemSolving ||
        !communication ||
        !confidence ||
        !overallComments ||
        !hiringRecommendation
      ) {
        return NextResponse.json(
          { error: 'All interview feedback fields are required' },
          { status: 400 }
        );
      }

      const [feedback] = await prisma.$transaction([
        prisma.feedback.create({
          data: {
            sessionId: session.id,
            interviewerId: interviewerProfile.id,
            summary,
            technicalDepth: parseInt(technicalDepth),
            problemSolving: parseInt(problemSolving),
            communication: parseInt(communication),
            confidence: parseInt(confidence),
            overallComments,
            hiringRecommendation: hiringRecommendation as HiringRecommendation,
          },
        }),
        prisma.session.update({
          where: { id: session.id },
          data: { status: 'COMPLETED' },
        }),
      ]);

      return NextResponse.json({ feedback });
    } else {
      return NextResponse.json(
        { error: 'Invalid session type' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Create feedback error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}