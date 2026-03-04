import { NextRequest, NextResponse } from "next/server";
import { requireAuth, authErrorStatus } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

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

// ── Helper: delete from Cloudinary safely ────────────────────────────────────
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
    const { userId } = await requireAuth(["INTERVIEWER"]);

    const formData = await request.formData();
    const resumeFile = formData.get("resume") as File | null;
    const idCardFile = formData.get("idCard") as File | null;

    if (!resumeFile && !idCardFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const updateData: any = {};

    // ── Fetch existing URLs to delete old files ───────────────────────────
    const existing = await prisma.interviewerProfile.findUnique({
      where: { userId },
      select: { resumeUrl: true, idCardUrl: true },
    });

    // ── Handle resume upload ──────────────────────────────────────────────
    if (resumeFile) {
      if (!allowedTypes.includes(resumeFile.type)) {
        return NextResponse.json(
          { error: "Resume must be a PDF, DOC, DOCX, JPG, or PNG file" },
          { status: 400 },
        );
      }
      if (resumeFile.size > maxSize) {
        return NextResponse.json(
          { error: "Resume must be under 5MB" },
          { status: 400 },
        );
      }

      // Delete old resume from Cloudinary
      if (existing?.resumeUrl?.includes('cloudinary.com')) {
        await deleteFromCloudinary(existing.resumeUrl, 'raw');
      }

      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      updateData.resumeUrl = await uploadBufferToCloudinary(
        buffer,
        `interviewer-docs/resume_${userId}_${Date.now()}`,
        'raw',
      );
    }

    // ── Handle ID card upload ─────────────────────────────────────────────
    if (idCardFile) {
      if (!allowedTypes.includes(idCardFile.type)) {
        return NextResponse.json(
          { error: "ID card must be a PDF, JPG, or PNG file" },
          { status: 400 },
        );
      }
      if (idCardFile.size > maxSize) {
        return NextResponse.json(
          { error: "ID card must be under 5MB" },
          { status: 400 },
        );
      }

      const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(idCardFile.type);

      // Delete old ID card from Cloudinary
      if (existing?.idCardUrl?.includes('cloudinary.com')) {
        await deleteFromCloudinary(existing.idCardUrl, isImage ? 'image' : 'raw');
      }

      const buffer = Buffer.from(await idCardFile.arrayBuffer());
      updateData.idCardUrl = await uploadBufferToCloudinary(
        buffer,
        `interviewer-docs/idcard_${userId}_${Date.now()}`,
        isImage ? 'image' : 'raw',
      );
    }

    // ── Update interviewer profile ────────────────────────────────────────
    const profile = await prisma.interviewerProfile.update({
      where: { userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      resumeUrl: (profile as any).resumeUrl,
      idCardUrl: (profile as any).idCardUrl,
    });
  } catch (error: any) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: authErrorStatus(error.message) },
    );
  }
}