import { NextRequest, NextResponse } from "next/server";
import { requireAuth, authErrorStatus } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

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

    const uploadsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "interviewer-docs",
    );
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const updateData: any = {};

    // Handle resume upload
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

      const ext = path.extname(resumeFile.name);
      const fileName = `resume_${userId}_${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, fileName);
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      await writeFile(filePath, buffer);
      updateData.resumeUrl = `/uploads/interviewer-docs/${fileName}`;
    }

    // Handle ID card upload
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

      const ext = path.extname(idCardFile.name);
      const fileName = `idcard_${userId}_${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, fileName);
      const buffer = Buffer.from(await idCardFile.arrayBuffer());
      await writeFile(filePath, buffer);
      updateData.idCardUrl = `/uploads/interviewer-docs/${fileName}`;
    }

    // Update interviewer profile
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
