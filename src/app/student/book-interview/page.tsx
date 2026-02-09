'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function BookInterviewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    role: '',
    difficulty: '',
    interviewType: '',
    durationMinutes: '60',
    scheduledTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/student/book/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Interview booked successfully with ${data.assignedInterviewer.name}!`);
        router.push('/student/sessions');
      } else {
        alert(data.error || 'Failed to book interview');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
        Book Mock Interview
      </h1>
      <p className="text-slate-600 mb-8">
        We'll automatically match you with the best interviewer based on your selections
      </p>

      <Card variant="elevated" className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Target Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g., Software Engineer, Product Manager"
            required
          />

          <Select
            label="Difficulty Level"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            options={[
              { value: 'EASY', label: 'Easy' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HARD', label: 'Hard' },
            ]}
          />

          <Select
            label="Interview Type"
            value={formData.interviewType}
            onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
            options={[
              { value: 'TECHNICAL', label: 'Technical' },
              { value: 'HR', label: 'HR / Behavioral' },
              { value: 'MIXED', label: 'Mixed (Technical + HR)' },
            ]}
          />

          <Select
            label="Duration"
            value={formData.durationMinutes}
            onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
            options={[
              { value: '45', label: '45 minutes' },
              { value: '60', label: '60 minutes' },
              { value: '90', label: '90 minutes' },
            ]}
          />

          <Input
            label="Preferred Date & Time"
            type="datetime-local"
            value={formData.scheduledTime}
            onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            required
          />

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <p className="text-sm text-indigo-900">
              <strong>Auto-Assignment:</strong> We'll match you with an available interviewer
              who specializes in your target role and difficulty level.
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Book Interview (Auto-Assign)
          </Button>
        </form>
      </Card>
    </div>
  );
}