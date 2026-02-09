'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useParams } from 'next/navigation';

export default function StudentFeedbackPage() {
  const params = useParams();
  const sessionId = params.sessionId;
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [sessionId]);

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`/api/feedback?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading feedback...</div>;
  }

  if (!feedback) {
    return <div className="text-center py-12">Feedback not found</div>;
  }

  const isGuidance = feedback.session.sessionType === 'GUIDANCE';

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
        Session Feedback
      </h1>
      <p className="text-slate-600 mb-8">
        From your session with {feedback.session.interviewer.name}
      </p>

      <Card variant="elevated" className="p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Summary</h2>
          <p className="text-slate-700">{feedback.summary}</p>
        </div>

        {isGuidance ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Strengths</h2>
              <p className="text-slate-700 whitespace-pre-line">{feedback.strengths}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Recommendations</h2>
              <p className="text-slate-700 whitespace-pre-line">{feedback.recommendations}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Action Items</h2>
              <p className="text-slate-700 whitespace-pre-line">{feedback.actionItems}</p>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Technical Depth</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${(feedback.technicalDepth / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold text-slate-900">
                    {feedback.technicalDepth}/5
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Problem Solving</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-violet-600 h-2 rounded-full"
                      style={{ width: `${(feedback.problemSolving / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold text-slate-900">
                    {feedback.problemSolving}/5
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Communication</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-pink-600 h-2 rounded-full"
                      style={{ width: `${(feedback.communication / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold text-slate-900">
                    {feedback.communication}/5
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Confidence</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(feedback.confidence / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold text-slate-900">
                    {feedback.confidence}/5
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Overall Comments</h2>
              <p className="text-slate-700 whitespace-pre-line">{feedback.overallComments}</p>
            </div>

            <div className={`p-4 rounded-xl ${
              feedback.hiringRecommendation === 'STRONG_HIRE' ? 'bg-green-50 border border-green-200' :
              feedback.hiringRecommendation === 'HIRE' ? 'bg-blue-50 border border-blue-200' :
              feedback.hiringRecommendation === 'WEAK_HIRE' ? 'bg-amber-50 border border-amber-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <h3 className="font-semibold text-slate-900 mb-1">Hiring Recommendation</h3>
              <p className="text-lg font-bold">{feedback.hiringRecommendation.replace('_', ' ')}</p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}