import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, authErrorStatus } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

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
  resourceType: 'raw' | 'image' = 'image',
): Promise<string> {
  const base64 = buffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    resource_type: resourceType,
    public_id:     publicId,
    overwrite:     true,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

  return result.secure_url;
}

/**
 * POST /api/interviewer/upload-profile-picture
 *
 * Uploads the photo to Cloudinary and stores the URL in the database.
 * Uses base64 upload method which is fully compatible with Vercel serverless.
 *
 * Limit: 5MB file size.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(['INTERVIEWER']);

    const formData = await request.formData();
    const file     = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 });
    }

    // ── Validate type ─────────────────────────────────────────────────────────
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Photo must be a JPG, PNG, or WebP image' },
        { status: 400 },
      );
    }

    // ── Validate size (5MB max) ───────────────────────────────────────────────
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Photo must be under 5MB. Please compress your image first.' },
        { status: 400 },
      );
    }

    // ── Delete old profile picture from Cloudinary if it exists ──────────────
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true },
    });

    if (existingUser?.profilePicture?.includes('cloudinary.com')) {
      try {
        const oldPublicId = existingUser.profilePicture
          .split('/upload/')[1]
          ?.replace(/^v\d+\//, '')
          ?.replace(/\.[^/.]+$/, '');
        if (oldPublicId) {
          await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'image' });
        }
      } catch (e) {
        console.warn('Could not delete old profile picture from Cloudinary:', e);
      }
    }

    // ── Upload to Cloudinary (base64 method — works on Vercel) ───────────────
    const buffer = Buffer.from(await file.arrayBuffer());
    const profilePicture = await uploadBufferToCloudinary(
      buffer,
      `profile-pictures/user_${userId}`,
      'image',
    );

    console.log(`✅ Profile photo uploaded to Cloudinary for user ${userId}`);

    // ── Save Cloudinary URL to DB ─────────────────────────────────────────────
    const updatedUser = await prisma.user.update({
      where:  { id: userId },
      data:   { profilePicture },
      select: { id: true, email: true, name: true, profilePicture: true, provider: true },
    });

    return NextResponse.json({
      success:        true,
      user:           updatedUser,
      profilePicture,
    });

  } catch (error: any) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: authErrorStatus(error.message) },
    );
  }
}