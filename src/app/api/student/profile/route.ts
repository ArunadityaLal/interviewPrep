import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth(['STUDENT']);

    // Fetch user data with profile
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        provider: true,
      },
    });

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ 
      user: userData,
      profile 
    });
  } catch (error: any) {
    console.error('Get student profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(['STUDENT']);
    const body = await request.json();

    const { name, college, branch, graduationYear, targetRole, experienceLevel } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        name,
        college,
        branch,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        targetRole,
        experienceLevel,
      },
      create: {
        userId: user.id,
        name,
        college,
        branch,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        targetRole,
        experienceLevel,
      },
    });

    // Fetch updated user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        provider: true,
      },
    });

    return NextResponse.json({ 
      user: userData,
      profile 
    });
  } catch (error: any) {
    console.error('Create/update student profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}