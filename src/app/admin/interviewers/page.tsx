'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function AdminInterviewersPage() {
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviewers();
  }, []);

  const fetchInterviewers = async () => {
    try {
      const res = await fetch('/api/admin/interviewers');
      if (res.ok) {
        const data = await res.json();
        setInterviewers(data.interviewers || []);
      }
    } catch (error) {
      console.error('Failed to fetch interviewers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (interviewerId: number, status: string) => {
    try {
      const res = await fetch('/api/admin/interviewers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewerId, status }),
      });

      if (res.ok) {
        await fetchInterviewers();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const pendingInterviewers = interviewers.filter(i => i.status === 'PENDING');
  const approvedInterviewers = interviewers.filter(i => i.status === 'APPROVED');

  if (loading) {
    return <div className="text-center py-12">Loading interviewers...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">
        Manage Interviewers
      </h1>

      {pendingInterviewers.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              Pending Approval
            </h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
              {pendingInterviewers.length}
            </span>
          </div>
          <div className="space-y-4">
            {pendingInterviewers.map((interviewer) => (
              <Card key={interviewer.id} variant="bordered" className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {interviewer.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-1">
                      📧 {interviewer.user.email}
                    </p>
                    {interviewer.companies.length > 0 && (
                      <p className="text-sm text-slate-600 mb-1">
                        🏢 {interviewer.companies.join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-slate-600 mb-1">
                      💼 {interviewer.rolesSupported.join(', ')}
                    </p>
                    <p className="text-sm text-slate-600">
                      📊 {interviewer.difficultyLevels.join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateStatus(interviewer.id, 'APPROVED')}
                      size="sm"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus(interviewer.id, 'REJECTED')}
                      variant="danger"
                      size="sm"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Approved Interviewers ({approvedInterviewers.length})
        </h2>
        {approvedInterviewers.length === 0 ? (
          <Card variant="bordered" className="p-8 text-center text-slate-600">
            No approved interviewers yet.
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {approvedInterviewers.map((interviewer) => (
              <Card key={interviewer.id} variant="bordered" className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {interviewer.name}
                  </h3>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    ✓ Active
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-1">
                  📧 {interviewer.user.email}
                </p>
                <p className="text-sm text-slate-600 mb-1">
                  💼 {interviewer.rolesSupported.join(', ')}
                </p>
                <p className="text-sm text-slate-600">
                  📅 {interviewer.sessions.length} upcoming sessions
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}