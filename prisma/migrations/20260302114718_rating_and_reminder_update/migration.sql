-- AlterTable
ALTER TABLE "feedback" ADD COLUMN     "student_rating" INTEGER,
ADD COLUMN     "student_rating_comment" TEXT;

-- AlterTable
ALTER TABLE "interviewer_profiles" ADD COLUMN     "average_rating" DOUBLE PRECISION,
ADD COLUMN     "total_ratings" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "reminder_sent" BOOLEAN NOT NULL DEFAULT false;
