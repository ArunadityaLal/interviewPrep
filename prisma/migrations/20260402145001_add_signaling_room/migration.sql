/*
  Warnings:

  - You are about to drop the `coding_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coding_submissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "coding_submissions" DROP CONSTRAINT "coding_submissions_question_id_fkey";

-- DropForeignKey
ALTER TABLE "coding_submissions" DROP CONSTRAINT "coding_submissions_student_id_fkey";

-- DropTable
DROP TABLE "coding_questions";

-- DropTable
DROP TABLE "coding_submissions";

-- DropEnum
DROP TYPE "SubmissionStatus";

-- CreateTable
CREATE TABLE "signaling_rooms" (
    "id" TEXT NOT NULL,
    "offer" JSONB,
    "answer" JSONB,
    "studentCandidates" JSONB NOT NULL DEFAULT '[]',
    "interviewerCandidates" JSONB NOT NULL DEFAULT '[]',
    "messages" JSONB NOT NULL DEFAULT '[]',
    "offerTimestamp" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signaling_rooms_pkey" PRIMARY KEY ("id")
);
