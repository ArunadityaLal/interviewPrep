import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// ── Cloudinary config ─────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Helper: upload buffer to Cloudinary using base64 (Vercel-safe) ────────────
async function uploadBufferToCloudinary(
  buffer: Buffer,
  publicId: string,
  resourceType: 'raw' | 'image' = 'raw',
): Promise<string> {
  const base64 = buffer.toString('base64');
  const mimePrefix = resourceType === 'image' ? 'image/jpeg' : 'application/octet-stream';
  const dataUri = `data:${mimePrefix};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    resource_type: resourceType,
    public_id:     publicId,
    overwrite:     true,
  });

  return result.secure_url;
}

// ── Helper: delete from Cloudinary safely ─────────────────────────────────────
async function deleteFromCloudinary(url: string, resourceType: 'raw' | 'image' = 'raw') {
  try {
    const publicId = url
      .split('/upload/')[1]
      ?.replace(/^v\d+\//, '')
      ?.replace(/\.[^/.]+$/, '');
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }
  } catch (e) {
    console.warn('Could not delete old file from Cloudinary:', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(['STUDENT']);

    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // ── Fetch student's name to build a friendly filename ──────────────────
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { name: true, resumeUrl: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    const rawName =
      studentProfile?.name ||
      user?.name ||
      user?.email?.split('@')[0] ||
      `user_${userId}`;

    const safeName = rawName
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_');

    const publicId = `student-resumes/${safeName}_resume_${userId}`;

    // ── Delete old resume from Cloudinary ─────────────────────────────────
    if (studentProfile?.resumeUrl?.includes('cloudinary.com')) {
      await deleteFromCloudinary(studentProfile.resumeUrl, 'raw');
    }

    // ── Upload to Cloudinary (base64 method — works on Vercel) ────────────
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const resumeUrl = await uploadBufferToCloudinary(buffer, publicId, 'raw');

    await prisma.studentProfile.update({
      where: { userId },
      data: { resumeUrl },
    });

    return NextResponse.json({
      success: true,
      resumeUrl,
      message: 'Resume uploaded successfully',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await requireAuth(['STUDENT']);

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { resumeUrl: true },
    });

    if (!profile?.resumeUrl) {
      return NextResponse.json({ error: 'No resume found' }, { status: 404 });
    }

    // ── Delete from Cloudinary ─────────────────────────────────────────────
    if (profile.resumeUrl.includes('cloudinary.com')) {
      await deleteFromCloudinary(profile.resumeUrl, 'raw');
    }

    await prisma.studentProfile.update({
      where: { userId },
      data: { resumeUrl: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully',
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}