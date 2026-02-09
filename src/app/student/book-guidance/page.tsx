'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';

export default function BookGuidancePage() {
  const router = useRouter();
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [selectedInterviewer, setSelectedInterviewer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    topic: '',
    durationMinutes: '30',
    scheduledTime: '',
  });

  useEffect(() => {
    fetchInterviewers();
  }, []);

  const fetchInterviewers = async () => {
    try {
      const res = await fetch('/api/interviewer/list');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterviewer) {
      alert('Please select an interviewer');
      return;
    }

    try {
      const res = await fetch('/api/student/book/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerId: selectedInterviewer.id,
          ...formData,
        }),
      });

      if (res.ok) {
        alert('Session booked successfully!');
        router.push('/student/sessions');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to book session');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading interviewers...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">
        Book Guidance Session
      </h1>

      <div className="grid grid-cols-3 gap-8">
        {/* Interviewers List */}
        <div className="col-span-2">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Select a Mentor
          </h2>
          <div className="space-y-4">
            {interviewers.length === 0 ? (
              <p className="text-slate-600">No mentors available at the moment.</p>
            ) : (
              interviewers.map((interviewer) => (
                <Card
                  key={interviewer.id}
                  variant="bordered"
                  className={`p-6 cursor-pointer transition-all ${
                    selectedInterviewer?.id === interviewer.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedInterviewer(interviewer)}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {interviewer.name}
                  </h3>
                  {interviewer.companies.length > 0 && (
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-medium">Companies:</span>{' '}
                      {interviewer.companies.join(', ')}
                    </p>
                  )}
                  {interviewer.yearsOfExperience && (
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-medium">Experience:</span>{' '}
                      {interviewer.yearsOfExperience} years
                    </p>
                  )}
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Specializes in:</span>{' '}
                    {interviewer.rolesSupported.join(', ')}
                  </p>
                  {interviewer.availabilitySlots.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ {interviewer.availabilitySlots.length} slots available
                    </p>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div>
          <Card variant="elevated" className="p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Session Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Resume Review, Career Guidance"
                required
              />

              <Select
                label="Duration"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                options={[
                  { value: '30', label: '30 minutes' },
                  { value: '45', label: '45 minutes' },
                  { value: '60', label: '60 minutes' },
                ]}
              />

              {selectedInterviewer && selectedInterviewer.availabilitySlots.length > 0 ? (
                <Select
                  label="Time Slot"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  options={selectedInterviewer.availabilitySlots.map((slot: any) => ({
                    value: slot.startTime,
                    label: new Date(slot.startTime).toLocaleString(),
                  }))}
                />
              ) : (
                <div className="text-sm text-amber-600">
                  {selectedInterviewer
                    ? 'No available slots for this mentor'
                    : 'Select a mentor to see available slots'}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!selectedInterviewer || !formData.scheduledTime}
              >
                Book Session
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}