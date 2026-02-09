'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

export default function StudentSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/student/sessions');
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
  const pastSessions = sessions.filter(
    (s) => s.status === 'COMPLETED' || new Date(s.scheduledTime) < new Date()
  );

  if (loading) {
    return <div className="text-center py-12">Loading sessions...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">
        My Sessions
      </h1>

      {/* Upcoming Sessions */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Upcoming Sessions ({upcomingSessions.length})
        </h2>
        {upcomingSessions.length === 0 ? (
          <Card variant="bordered" className="p-8 text-center text-slate-600">
            No upcoming sessions. Book a session to get started!
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
                      with <span className="font-medium">{session.interviewer.name}</span>
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

      {/* Past Sessions */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Past Sessions ({pastSessions.length})
        </h2>
        {pastSessions.length === 0 ? (
          <Card variant="bordered" className="p-8 text-center text-slate-600">
            No past sessions yet.
          </Card>
        ) : (
          <div className="space-y-4">
            {pastSessions.map((session) => (
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
                      {session.status === 'COMPLETED' && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {session.sessionType === 'GUIDANCE' ? session.topic : session.role}
                    </h3>
                    <p className="text-slate-600 mb-2">
                      with <span className="font-medium">{session.interviewer.name}</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      📅 {formatDateTime(session.scheduledTime)}
                    </p>
                  </div>
                  {session.feedback && (
                    <Link href={`/student/feedback/${session.id}`}>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        View Feedback
                      </button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}