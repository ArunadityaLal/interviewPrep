'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    branch: '',
    graduationYear: '',
    targetRole: '',
    experienceLevel: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, sessionsRes] = await Promise.all([
        fetch('/api/student/profile'),
        fetch('/api/student/sessions'),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.profile);
        if (profileData.profile) {
          setFormData({
            name: profileData.profile.name || '',
            college: profileData.profile.college || '',
            branch: profileData.profile.branch || '',
            graduationYear: profileData.profile.graduationYear?.toString() || '',
            targetRole: profileData.profile.targetRole || '',
            experienceLevel: profileData.profile.experienceLevel || '',
          });
        } else {
          setEditing(true);
        }
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/student/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchData();
        setEditing(false);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const upcomingSessions = sessions.filter(
    (s) => s.status === 'SCHEDULED' && new Date(s.scheduledTime) > new Date()
  );
  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">
        Welcome back{profile?.name ? `, ${profile.name}` : ''}!
      </h1>

      {/* Profile Section */}
      <Card variant="elevated" className="p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-semibold text-slate-900">
            Your Profile
          </h2>
          {profile && !editing && (
            <Button onClick={() => setEditing(true)} variant="secondary" size="sm">
              Edit Profile
            </Button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="College/University"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              />
              <Input
                label="Branch/Major"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              />
              <Input
                label="Graduation Year"
                type="number"
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
              />
              <Input
                label="Target Role"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                placeholder="e.g., Software Engineer"
              />
              <Input
                label="Experience Level"
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                placeholder="e.g., Entry Level, 2 years"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit">Save Profile</Button>
              {profile && (
                <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : profile ? (
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">College</p>
              <p className="font-medium text-slate-900">{profile.college || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Branch</p>
              <p className="font-medium text-slate-900">{profile.branch || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Graduation Year</p>
              <p className="font-medium text-slate-900">{profile.graduationYear || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Target Role</p>
              <p className="font-medium text-slate-900">{profile.targetRole || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Experience Level</p>
              <p className="font-medium text-slate-900">{profile.experienceLevel || 'Not set'}</p>
            </div>
          </div>
        ) : null}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card variant="bordered" className="p-6">
          <div className="text-3xl font-bold text-indigo-600 mb-2">
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
          <div className="text-3xl font-bold text-violet-600 mb-2">
            {sessions.length}
          </div>
          <p className="text-slate-600">Total Sessions</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="elevated" className="p-8">
        <h2 className="text-2xl font-display font-semibold text-slate-900 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/student/book-guidance">
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-200 rounded-xl hover:shadow-lg transition-all cursor-pointer">
              <div className="text-3xl mb-3">🎓</div>
              <h3 className="font-semibold text-slate-900 mb-1">Book Guidance Session</h3>
              <p className="text-sm text-slate-600">
                Get mentorship from industry experts
              </p>
            </div>
          </Link>
          <Link href="/student/book-interview">
            <div className="p-6 bg-gradient-to-br from-violet-50 to-pink-50 border-2 border-violet-200 rounded-xl hover:shadow-lg transition-all cursor-pointer">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="font-semibold text-slate-900 mb-1">Book Mock Interview</h3>
              <p className="text-sm text-slate-600">
                Practice with realistic interview scenarios
              </p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}