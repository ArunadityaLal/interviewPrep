import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, authErrorStatus } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// GET — returns only APPROVED interviewers (accessible by students)
export async function GET(request: NextRequest) {
  try {
    await requireAuth(['STUDENT']);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSizeRaw = Number(searchParams.get('pageSize') || `${DEFAULT_PAGE_SIZE}`);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSizeRaw));

    const where = { status: 'APPROVED' as const };

    const [total, interviewers] = await Promise.all([
      prisma.interviewerProfile.count({ where }),
      prisma.interviewerProfile.findMany({
        where,
        select: {
          id: true,
          name: true,
          companies: true,
          rolesSupported: true,
          yearsOfExperience: true,
          careerLevel: true,
          sessionTypesOffered: true,
          interviewTypesOffered: true,
          linkedinUrl: true,
          user: {
            select: {
              name: true,
              profilePicture: true,
            },
          },
          _count: {
            select: { sessions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      interviewers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: authErrorStatus(error.message) }
    );
  }
}