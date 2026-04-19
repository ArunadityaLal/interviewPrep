import { Card } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

interface SessionCardProps {
  session: {
    id: number;
    sessionType: 'GUIDANCE' | 'INTERVIEW';
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    scheduledTime: Date | string;
    durationMinutes: number;
    topic?: string | null;
    role?: string | null;
    difficulty?: string | null;
    interviewer?: {
      name: string;
    };
    student?: {
      name: string;
    };
    feedback?: any;
  };
  viewType: 'student' | 'interviewer';
  showFeedbackButton?: boolean;
}

export function SessionCard({ session, viewType, showFeedbackButton = true }: SessionCardProps) {
  const isUpcoming = new Date(session.scheduledTime) > new Date() && session.status === 'SCHEDULED';
  const needsFeedback = !isUpcoming && session.status === 'SCHEDULED' && !session.feedback;

  return (
    <Card variant="bordered" className="p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="flex-1">
          {/* Session Type Badge */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                session.sessionType === 'GUIDANCE'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-violet-100 text-violet-700'
              }`}
            >
              {session.sessionType === 'GUIDANCE' ? 'Guidance' : 'Interview'}
            </span>
            
            {/* Status Badge */}
            {session.status === 'COMPLETED' && (
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-700">
                ✓ Completed
              </span>
            )}
            {isUpcoming && (
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-700">
                Upcoming
              </span>
            )}
            {needsFeedback && viewType === 'interviewer' && (
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-amber-100 text-amber-700">
                Needs Feedback
              </span>
            )}
            
            <span className="text-xs sm:text-sm text-slate-500 w-full sm:w-auto">
              {session.durationMinutes} minutes
            </span>
          </div>

          {/* Session Title */}
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 break-words">
            {session.sessionType === 'GUIDANCE' ? session.topic : session.role}
          </h3>

          {/* Participant Info */}
          <p className="text-slate-600 text-sm sm:text-base mb-2 break-words">
            {viewType === 'student' && session.interviewer && (
              <>with <span className="font-medium">{session.interviewer.name}</span></>
            )}
            {viewType === 'interviewer' && session.student && (
              <>Student: <span className="font-medium">{session.student.name}</span></>
            )}
          </p>

          {/* Additional Info */}
          {session.difficulty && (
            <p className="text-sm text-slate-500 mb-2 break-words">
              <span className="font-medium">Difficulty:</span> {session.difficulty}
            </p>
          )}

          {/* Time */}
          <p className="text-sm text-slate-500">
            {formatDateTime(session.scheduledTime)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full lg:w-auto flex-col sm:flex-row lg:flex-col gap-2 lg:items-stretch">
          {/* View Feedback Button for Students */}
          {viewType === 'student' && session.feedback && showFeedbackButton && (
            <Link href={`/student/feedback/${session.id}`} className="w-full sm:w-auto">
              <button className="w-full min-h-11 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm font-medium">
                View Feedback
              </button>
            </Link>
          )}

          {/* Submit Feedback Button for Interviewers */}
          {viewType === 'interviewer' && needsFeedback && showFeedbackButton && (
            <Link href={`/interviewer/feedback/${session.id}`} className="w-full sm:w-auto">
              <button className="w-full min-h-11 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm font-medium">
                Submit Feedback
              </button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}