/*
  Warnings:

  - You are about to drop the column `difficulty_levels` on the `interviewer_profiles` table. All the data in the column will be lost.
  - The `difficulty` column on the `sessions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILE_ERROR');

-- CreateEnum
CREATE TYPE "CareerLevel" AS ENUM ('JUNIOR', 'MID', 'SENIOR', 'STAFF_LEAD');

-- CreateEnum
CREATE TYPE "InterviewDifficulty" AS ENUM ('INTERN', 'ENTRY', 'MID', 'SENIOR');

-- CreateEnum
CREATE TYPE "ManualBookingStatus" AS ENUM ('PENDING', 'ASSIGNED', 'CANCELLED');

-- AlterTable
ALTER TABLE "interviewer_profiles" DROP COLUMN "difficulty_levels",
ADD COLUMN     "career_level" "CareerLevel";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "InterviewDifficulty";

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "preferred_interviewer_unlocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "manual_booking_requests" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "preferred_interviewer_id" INTEGER,
    "topic" TEXT,
    "role" TEXT,
    "difficulty" "InterviewDifficulty",
    "interview_type" "InterviewType",
    "session_type" "SessionType" NOT NULL,
    "status" "ManualBookingStatus" NOT NULL DEFAULT 'PENDING',
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "razorpay_signature" TEXT,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "session_id" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manual_booking_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_questions" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "constraints" TEXT,
    "examples" JSONB NOT NULL,
    "testCases" JSONB NOT NULL,
    "starterCode" JSONB NOT NULL,
    "solution" TEXT,
    "hints" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_submissions" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "runtime" INTEGER,
    "memory" INTEGER,
    "tests_passed" INTEGER NOT NULL DEFAULT 0,
    "total_tests" INTEGER NOT NULL DEFAULT 0,
    "error_output" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coding_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manual_booking_requests_razorpay_order_id_key" ON "manual_booking_requests"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "manual_booking_requests_razorpay_payment_id_key" ON "manual_booking_requests"("razorpay_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "manual_booking_requests_session_id_key" ON "manual_booking_requests"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "coding_questions_slug_key" ON "coding_questions"("slug");

-- AddForeignKey
ALTER TABLE "manual_booking_requests" ADD CONSTRAINT "manual_booking_requests_preferred_interviewer_id_fkey" FOREIGN KEY ("preferred_interviewer_id") REFERENCES "interviewer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_booking_requests" ADD CONSTRAINT "manual_booking_requests_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_booking_requests" ADD CONSTRAINT "manual_booking_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_submissions" ADD CONSTRAINT "coding_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_submissions" ADD CONSTRAINT "coding_submissions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "coding_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
