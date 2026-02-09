'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';

export default function InterviewerFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({
    summary: '',
    strengths: '',
    recommendations: '',
    actionItems: '',
    technicalDepth: '3',
    problemSolving: '3',
    communication: '3',
    confidence: '3',
    overallComments: '',
    hiringRecommendation: '',
  });

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/interviewer/sessions');
      if (res.ok) {
        const data = await res.json();
        const foundSession = data.sessions.find((s: any) => s.id === parseInt(sessionId as string));
        setSession(foundSession);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          sessionType: session.sessionType,
          ...formData,
        }),
      });

      if (res.ok) {
        alert('Feedback submitted successfully!');
        router.push('/interviewer/sessions');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading session...</div>;
  }

  if (!session) {
    return <div className="text-center py-12">Session not found</div>;
  }

  const isGuidance = session.sessionType === 'GUIDANCE';

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
        Submit Feedback
      </h1>
      <p className="text-slate-600 mb-8">
        For {session.student.name}'s {isGuidance ? 'guidance' : 'interview'} session
      </p>

      <Card variant="elevated" className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Summary
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              rows={4}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              required
            />
          </div>

          {isGuidance ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Strengths
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  rows={3}
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Recommendations
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  rows={3}
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Action Items
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  rows={3}
                  value={formData.actionItems}
                  onChange={(e) => setFormData({ ...formData, actionItems: e.target.value })}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Technical Depth (1-5)"
                  value={formData.technicalDepth}
                  onChange={(e) => setFormData({ ...formData, technicalDepth: e.target.value })}
                  options={[
                    { value: '1', label: '1 - Poor' },
                    { value: '2', label: '2 - Below Average' },
                    { value: '3', label: '3 - Average' },
                    { value: '4', label: '4 - Good' },
                    { value: '5', label: '5 - Excellent' },
                  ]}
                />

                <Select
                  label="Problem Solving (1-5)"
                  value={formData.problemSolving}
                  onChange={(e) => setFormData({ ...formData, problemSolving: e.target.value })}
                  options={[
                    { value: '1', label: '1 - Poor' },
                    { value: '2', label: '2 - Below Average' },
                    { value: '3', label: '3 - Average' },
                    { value: '4', label: '4 - Good' },
                    { value: '5', label: '5 - Excellent' },
                  ]}
                />

                <Select
                  label="Communication (1-5)"
                  value={formData.communication}
                  onChange={(e) => setFormData({ ...formData, communication: e.target.value })}
                  options={[
                    { value: '1', label: '1 - Poor' },
                    { value: '2', label: '2 - Below Average' },
                    { value: '3', label: '3 - Average' },
                    { value: '4', label: '4 - Good' },
                    { value: '5', label: '5 - Excellent' },
                  ]}
                />

                <Select
                  label="Confidence (1-5)"
                  value={formData.confidence}
                  onChange={(e) => setFormData({ ...formData, confidence: e.target.value })}
                  options={[
                    { value: '1', label: '1 - Poor' },
                    { value: '2', label: '2 - Below Average' },
                    { value: '3', label: '3 - Average' },
                    { value: '4', label: '4 - Good' },
                    { value: '5', label: '5 - Excellent' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Overall Comments
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  rows={4}
                  value={formData.overallComments}
                  onChange={(e) => setFormData({ ...formData, overallComments: e.target.value })}
                  required
                />
              </div>

              <Select
                label="Hiring Recommendation"
                value={formData.hiringRecommendation}
                onChange={(e) => setFormData({ ...formData, hiringRecommendation: e.target.value })}
                options={[
                  { value: 'STRONG_HIRE', label: 'Strong Hire' },
                  { value: 'HIRE', label: 'Hire' },
                  { value: 'WEAK_HIRE', label: 'Weak Hire' },
                  { value: 'NO_HIRE', label: 'No Hire' },
                ]}
              />
            </>
          )}

          <Button type="submit" className="w-full" size="lg">
            Submit Feedback
          </Button>
        </form>
      </Card>
    </div>
  );
}