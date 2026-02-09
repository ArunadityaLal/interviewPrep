'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

export default function InterviewerSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/interviewer/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingSessions = sessions.filter(
    (s) => s.status === 'SCHEDULED' && new Date(s.scheduledTime) > new Date()
  );
  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
  const pendingFeedback = upcomingSessions.filter(
    (s) => new Date(s.scheduledTime) < new Date() && !s.feedback
  );

  if (loading) {
    return <div className="text-center py-12">Loading sessions...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">
        My Sessions
      </h1>

      {pendingFeedback.length > 0 && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-900 font-medium">
            ⚠️ You have {pendingFeedback.length} session(s) pending feedback submission
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card variant="bordered" className="p-6">
          <div className="text-3xl font-bold text-violet-600 mb-2">
            {upcomingSessions.length}
          </div>
          <p className="text-slate-600">Upcoming Sessions</p>
        </Card>
        <Card variant="bordered" className="p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {completedSessions.length}
          </div>
          <p className="text-slate-600">Completed Sessions</p>
        </Card>
        <Card variant="bordered" className="p-6">
          <div className="text-3xl font-bold text-indigo-600 mb-2">
            {sessions.length}
          </div>
          <p className="text-slate-600">Total Sessions</p>
        </Card>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Upcoming Sessions ({upcomingSessions.length})
        </h2>
        {upcomingSessions.length === 0 ? (
          <Card variant="bordered" className="p-8 text-center text-slate-600">
            No upcoming sessions.
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <Card key={session.id} variant="bordered" className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        session.sessionType === 'GUIDANCE'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-violet-100 text-violet-700'
                      }`}>
                        {session.sessionType === 'GUIDANCE' ? '🎓 Guidance' : '💼 Interview'}
                      </span>
                      <span className="text-sm text-slate-500">
                        {session.durationMinutes} minutes
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {session.sessionType === 'GUIDANCE' ? session.topic : session.role}
                    </h3>
                    <p className="text-slate-600 mb-2">
                      Student: <span className="font-medium">{session.student.name}</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      📅 {formatDateTime(session.scheduledTime)}
                    </p>
                  </div>
                  {new Date(session.scheduledTime) < new Date() && !session.feedback && (
                    <Link href={`/interviewer/feedback/${session.id}`}>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Submit Feedback
                      </button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Completed Sessions ({completedSessions.length})
        </h2>
        {completedSessions.length === 0 ? (
          <Card variant="bordered" className="p-8 text-center text-slate-600">
            No completed sessions yet.
          </Card>
        ) : (
          <div className="space-y-4">
            {completedSessions.map((session) => (
              <Card key={session.id} variant="bordered" className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        session.sessionType === 'GUIDANCE'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-violet-100 text-violet-700'
                      }`}>
                        {session.sessionType === 'GUIDANCE' ? '🎓 Guidance' : '💼 Interview'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                        ✓ Completed
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {session.sessionType === 'GUIDANCE' ? session.topic : session.role}
                    </h3>
                    <p className="text-slate-600 mb-2">
                      Student: <span className="font-medium">{session.student.name}</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      📅 {formatDateTime(session.scheduledTime)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}