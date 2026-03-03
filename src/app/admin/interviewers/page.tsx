'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Interviewer {
  id: number;
  name: string;
  status: string;
  companies: string[];
  rolesSupported: string[];
  difficultyLevels: string[];
  sessionTypesOffered: string[];
  interviewTypesOffered: string[];
  yearsOfExperience: number | null;
  linkedinUrl: string | null;
  education: string | null;
  idCardUrl: string | null;
  resumeUrl: string | null;
  createdAt: string;
  averageRating?: number | null;
  totalRatings?: number;
  user: { email: string; name: string | null; profilePicture: string | null };
  _count: { sessions: number };
}

interface ManualRequest {
  id: number;
  status: string;
  sessionType: string;
  role: string | null;
  difficulty: string | null;
  interviewType: string | null;
  topic: string | null;
  paymentStatus: string;
  createdAt: string;
  student: {
    name: string;
    user: { email: string; name: string | null; profilePicture: string | null };
  };
  preferredInterviewer: {
    name: string;
    user: { name: string | null };
  } | null;
  session: { id: number } | null;
}

// ─── Star Display ─────────────────────────────────────────────────────────────
function StarDisplay({ rating, totalRatings }: { rating: number | null; totalRatings: number }) {
  if (!rating || totalRatings === 0) {
    return <span className="text-xs text-slate-400">No ratings yet</span>;
  }
  const fullStars = Math.floor(rating);
  const halfStar  = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= fullStars
                ? 'text-amber-400'
                : star === fullStars + 1 && halfStar
                ? 'text-amber-300'
                : 'text-slate-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-xs font-semibold text-amber-600">{rating.toFixed(1)}</span>
      <span className="text-xs text-slate-400">({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})</span>
    </div>
  );
}

// ─── Interviewer Card (File 1 layout + File 2 logic) ─────────────────────────
function InterviewerCard({
  interviewer: iv,
  expanded,
  onToggle,
  onUpdateStatus,
}: {
  interviewer: Interviewer;
  expanded: boolean;
  onToggle: () => void;
  onUpdateStatus: (id: number, status: string) => void;
}) {
  const isApproved = iv.status === 'APPROVED';
  const isRejected = iv.status === 'REJECTED';
  const isPending  = iv.status === 'PENDING';

  const hasDocuments = iv.resumeUrl || iv.idCardUrl;
  const missingDocs  = !iv.resumeUrl || !iv.idCardUrl;

  return (
    <Card variant="bordered" className="overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* ── Name + status badges ── */}
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-semibold text-slate-900">{iv.name}</h3>
              {isApproved && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">✓ Active</span>
              )}
              {isRejected && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">✗ Rejected</span>
              )}
              {isPending && missingDocs && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">⚠ Docs incomplete</span>
              )}
            </div>

            {/* ── Info row ── */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
              <span className="text-sm text-slate-600">📧 {iv.user.email}</span>
              {iv.companies?.length > 0 && (
                <span className="text-sm text-slate-600">🏢 {iv.companies.join(', ')}</span>
              )}
              {iv.yearsOfExperience && (
                <span className="text-sm text-slate-600">💼 {iv.yearsOfExperience} yrs exp</span>
              )}
              {iv.linkedinUrl ? (
                <a
                  href={iv.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn Profile
                </a>
              ) : (
                <span className="text-sm text-slate-400">🔗 No LinkedIn</span>
              )}
            </div>

            {/* ── Rating row ── */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-slate-500">Student Rating:</span>
              <StarDisplay rating={iv.averageRating ?? null} totalRatings={iv.totalRatings ?? 0} />
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={onToggle}
              className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {expanded ? 'Less ▲' : 'Details ▼'}
            </button>
            {isPending && (
              <>
                <Button onClick={() => onUpdateStatus(iv.id, 'APPROVED')} size="sm">Approve</Button>
                <Button onClick={() => onUpdateStatus(iv.id, 'REJECTED')} variant="danger" size="sm">Reject</Button>
              </>
            )}
            {isApproved && (
              <Button onClick={() => onUpdateStatus(iv.id, 'REJECTED')} variant="danger" size="sm">Revoke</Button>
            )}
            {isRejected && (
              <Button onClick={() => onUpdateStatus(iv.id, 'APPROVED')} size="sm">Re-approve</Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Expanded detail panel ── */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Roles Supported</p>
              <p className="text-sm text-slate-700">{iv.rolesSupported?.join(', ') || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Difficulty Levels</p>
              <div className="flex gap-1 flex-wrap">
                {iv.difficultyLevels?.map((d: string) => (
                  <span
                    key={d}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      d === 'HARD'   ? 'bg-red-100 text-red-700' :
                      d === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                       'bg-green-100 text-green-700'
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Session Types</p>
              <p className="text-sm text-slate-700">{iv.sessionTypesOffered?.join(', ') || '—'}</p>
            </div>
            {iv.education && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Education</p>
                <p className="text-sm text-slate-700">{iv.education}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Student Rating</p>
              <StarDisplay rating={iv.averageRating ?? null} totalRatings={iv.totalRatings ?? 0} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Upcoming Sessions</p>
              <p className="text-sm text-slate-700">{iv._count.sessions}</p>
            </div>
          </div>

          {/* ── Verification Documents ── */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Verification Documents</p>
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-xl border-2 p-4 ${iv.resumeUrl ? 'border-green-200 bg-green-50' : 'border-dashed border-slate-300 bg-white'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">Resume / CV</p>
                    {iv.resumeUrl ? (
                      <a href={iv.resumeUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:underline">
                        View Document →
                      </a>
                    ) : (
                      <p className="text-sm text-slate-400">Not uploaded yet</p>
                    )}
                  </div>
                  {iv.resumeUrl && <span className="text-green-500 text-lg">✓</span>}
                </div>
              </div>

              <div className={`rounded-xl border-2 p-4 ${iv.idCardUrl ? 'border-green-200 bg-green-50' : 'border-dashed border-slate-300 bg-white'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🪪</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">Company ID Card</p>
                    {iv.idCardUrl ? (
                      <a href={iv.idCardUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:underline">
                        View Document →
                      </a>
                    ) : (
                      <p className="text-sm text-slate-400">Not uploaded yet</p>
                    )}
                  </div>
                  {iv.idCardUrl && <span className="text-green-500 text-lg">✓</span>}
                </div>
              </div>
            </div>

            {!hasDocuments && (
              <p className="mt-3 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
                ⚠️ This interviewer hasn't uploaded any verification documents yet.
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Assign Modal (from File 2, unchanged) ────────────────────────────────────
function AssignModal({
  request,
  interviewers,
  onAssign,
  onClose,
}: {
  request: ManualRequest;
  interviewers: Interviewer[];
  onAssign: (requestId: number, interviewerId: number, scheduledTime: string, durationMinutes: number) => void;
  onClose: () => void;
}) {
  const [selectedId, setSelectedId]       = useState<number | null>(
    request.preferredInterviewer
      ? interviewers.find((iv) => iv.name === request.preferredInterviewer?.name)?.id ?? null
      : null,
  );
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration]           = useState(60);
  const [search, setSearch]               = useState('');
  const [assigning, setAssigning]         = useState(false);
  const [err, setErr]                     = useState('');

  const approved = interviewers.filter((iv) => iv.status === 'APPROVED');
  const filtered = approved.filter((iv) => {
    const q = search.toLowerCase();
    return iv.name.toLowerCase().includes(q) || iv.companies.some((c) => c.toLowerCase().includes(q));
  });

  const minDT = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const handleAssign = async () => {
    if (!selectedId)    { setErr('Please select an interviewer.');       return; }
    if (!scheduledTime) { setErr('Please set a scheduled date & time.'); return; }
    setAssigning(true);
    setErr('');
    try {
      await onAssign(request.id, selectedId, scheduledTime, duration);
    } catch (e: any) {
      setErr(e.message || 'Failed to assign.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(15,10,40,0.55)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400" />
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-slate-900">Assign Interviewer</h2>
              <p className="text-sm text-slate-500">
                For <strong>{request.student.user.name || request.student.name}</strong>
                {request.preferredInterviewer && (
                  <span className="ml-1 text-violet-600">
                    · Preferred: {request.preferredInterviewer.user.name || request.preferredInterviewer.name}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all font-bold"
            >
              ✕
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 mb-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
            <div><span className="font-semibold block text-slate-400">Type</span>{request.sessionType}</div>
            <div><span className="font-semibold block text-slate-400">Role</span>{request.role || '—'}</div>
            <div><span className="font-semibold block text-slate-400">Difficulty</span>{request.difficulty || '—'}</div>
          </div>

          <input
            type="text"
            placeholder="Search interviewers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />

          <div className="space-y-2 max-h-44 overflow-y-auto mb-4 pr-0.5">
            {filtered.map((iv) => {
              const isSel       = selectedId === iv.id;
              const isPreferred = request.preferredInterviewer?.name === iv.name;
              return (
                <button
                  key={iv.id}
                  onClick={() => setSelectedId(isSel ? null : iv.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 text-left transition-all ${
                    isSel ? 'border-violet-500 bg-violet-50' : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {iv.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate flex items-center gap-1">
                      {iv.name}
                      {isPreferred && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-full">Preferred</span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{iv.companies.join(', ')}</p>
                  </div>
                  {isSel && <span className="text-violet-500 font-bold shrink-0">✓</span>}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-4">No interviewers found.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={scheduledTime}
                min={minDT}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
          </div>

          {err && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 text-sm text-red-700">{err}</div>
          )}

          <button
            onClick={handleAssign}
            disabled={assigning || !selectedId || !scheduledTime}
            className="w-full py-3 rounded-2xl font-bold bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-400 hover:to-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {assigning ? 'Assigning…' : 'Assign & Notify Student'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminInterviewersPage() {
  const [interviewers, setInterviewers]     = useState<Interviewer[]>([]);
  const [manualRequests, setManualRequests] = useState<ManualRequest[]>([]);
  const [loading, setLoading]               = useState(true);
  const [expanded, setExpanded]             = useState<number | null>(null);
  const [activeTab, setActiveTab]           = useState<'interviewers' | 'requests'>('interviewers');
  const [assignTarget, setAssignTarget]     = useState<ManualRequest | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ivRes, reqRes] = await Promise.all([
        fetch('/api/admin/interviewers'),
        fetch('/api/admin/manual-requests?status=PENDING'),
      ]);
      if (ivRes.ok)  { const d = await ivRes.json();  setInterviewers(d.interviewers || []); }
      if (reqRes.ok) { const d = await reqRes.json(); setManualRequests(d.requests || []);   }
    } catch (e) { console.error('Failed to fetch:', e); }
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async (interviewerId: number, status: string) => {
    try {
      const res = await fetch('/api/admin/interviewers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewerId, status }),
      });
      if (res.ok) await fetchAll();
    } catch (e) { console.error('Failed to update status:', e); }
  };

  const handleAssign = async (
    requestId: number,
    interviewerId: number,
    scheduledTime: string,
    durationMinutes: number,
  ) => {
    const res = await fetch('/api/admin/manual-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, interviewerId, scheduledTime, durationMinutes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Assignment failed.');
    setAssignTarget(null);
    await fetchAll();
    alert('Interviewer assigned! Student has been notified via email.');
  };

  const pending  = interviewers.filter((i) => i.status === 'PENDING');
  const approved = interviewers.filter((i) => i.status === 'APPROVED');
  const rejected = interviewers.filter((i) => i.status === 'REJECTED');

  if (loading) return <div className="text-center py-12 text-slate-500">Loading interviewers...</div>;

  return (
    <>
      {assignTarget && (
        <AssignModal
          request={assignTarget}
          interviewers={interviewers}
          onAssign={handleAssign}
          onClose={() => setAssignTarget(null)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-6">Manage Interviewers</h1>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('interviewers')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'interviewers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            👥 All Interviewers
            <span className="ml-2 text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              {interviewers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'requests'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            🎯 Pending Requests
            {manualRequests.length > 0 && (
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-full font-bold">
                {manualRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Interviewers Tab ── */}
        {activeTab === 'interviewers' && (
          <div className="space-y-10">
            {pending.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-semibold text-slate-900">Pending Approval</h2>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    {pending.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {pending.map((iv) => (
                    <InterviewerCard
                      key={iv.id}
                      interviewer={iv}
                      expanded={expanded === iv.id}
                      onToggle={() => setExpanded(expanded === iv.id ? null : iv.id)}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Approved Interviewers ({approved.length})
                </h2>
              </div>
              {approved.length === 0 ? (
                <Card variant="bordered" className="p-8 text-center text-slate-500">
                  No approved interviewers yet.
                </Card>
              ) : (
                <div className="space-y-4">
                  {approved.map((iv) => (
                    <InterviewerCard
                      key={iv.id}
                      interviewer={iv}
                      expanded={expanded === iv.id}
                      onToggle={() => setExpanded(expanded === iv.id ? null : iv.id)}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>
              )}
            </section>

            {rejected.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  Rejected ({rejected.length})
                </h2>
                <div className="space-y-4">
                  {rejected.map((iv) => (
                    <InterviewerCard
                      key={iv.id}
                      interviewer={iv}
                      expanded={expanded === iv.id}
                      onToggle={() => setExpanded(expanded === iv.id ? null : iv.id)}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>
              </section>
            )}

            {interviewers.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <p className="text-5xl mb-3">👥</p>
                <p>No interviewers yet.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Pending Requests Tab ── */}
        {activeTab === 'requests' && (
          <div>
            {manualRequests.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="text-5xl mb-3">🎯</p>
                <p className="font-medium">No pending manual booking requests.</p>
                <p className="text-sm mt-1">Students who pay ₹50 to choose their interviewer will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {manualRequests.map((req) => (
                  <Card key={req.id} variant="bordered" className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {(req.student.user.name || req.student.name).charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 truncate">
                            {req.student.user.name || req.student.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate mb-2">{req.student.user.email}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{req.sessionType}</span>
                            {req.role          && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{req.role}</span>}
                            {req.difficulty    && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{req.difficulty}</span>}
                            {req.interviewType && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{req.interviewType}</span>}
                          </div>
                          {req.preferredInterviewer && (
                            <p className="text-xs text-violet-600 mt-2 font-medium">
                              🎯 Preferred: {req.preferredInterviewer.user.name || req.preferredInterviewer.name}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400 mt-1">
                            Requested {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAssignTarget(req)}
                        className="shrink-0 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-all shadow"
                      >
                        Assign →
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}