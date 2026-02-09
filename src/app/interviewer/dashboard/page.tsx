'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function InterviewerDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    education: '',
    companies: '',
    yearsOfExperience: '',
    rolesSupported: '',
    difficultyLevels: [] as string[],
    sessionTypesOffered: [] as string[],
    linkedinUrl: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/interviewer/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setFormData({
            name: data.profile.name || '',
            education: data.profile.education || '',
            companies: data.profile.companies?.join(', ') || '',
            yearsOfExperience: data.profile.yearsOfExperience?.toString() || '',
            rolesSupported: data.profile.rolesSupported?.join(', ') || '',
            difficultyLevels: data.profile.difficultyLevels || [],
            sessionTypesOffered: data.profile.sessionTypesOffered || [],
            linkedinUrl: data.profile.linkedinUrl || '',
          });
        } else {
          setEditing(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/interviewer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companies: formData.companies.split(',').map(c => c.trim()).filter(Boolean),
          rolesSupported: formData.rolesSupported.split(',').map(r => r.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        await fetchProfile();
        setEditing(false);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const toggleDifficulty = (level: string) => {
    setFormData(prev => ({
      ...prev,
      difficultyLevels: prev.difficultyLevels.includes(level)
        ? prev.difficultyLevels.filter(l => l !== level)
        : [...prev.difficultyLevels, level]
    }));
  };

  const toggleSessionType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      sessionTypesOffered: prev.sessionTypesOffered.includes(type)
        ? prev.sessionTypesOffered.filter(t => t !== type)
        : [...prev.sessionTypesOffered, type]
    }));
  };

  if (profile?.status === 'PENDING') {
    return (
      <div className="max-w-4xl mx-auto">
        <Card variant="elevated" className="p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">
            Profile Under Review
          </h1>
          <p className="text-slate-600">
            Your profile is pending admin approval. You'll be notified once approved.
          </p>
        </Card>
      </div>
    );
  }

  if (profile?.status === 'REJECTED') {
    return (
      <div className="max-w-4xl mx-auto">
        <Card variant="elevated" className="p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">
            Profile Not Approved
          </h1>
          <p className="text-slate-600">
            Your profile was not approved. Please contact support for more information.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">
        Interviewer Dashboard
      </h1>

      <Card variant="elevated" className="p-8">
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
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Education"
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
            />
            <Input
              label="Companies (comma-separated)"
              value={formData.companies}
              onChange={(e) => setFormData({ ...formData, companies: e.target.value })}
              placeholder="Google, Microsoft, Amazon"
            />
            <Input
              label="Years of Experience"
              type="number"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
            />
            <Input
              label="Roles Supported (comma-separated)"
              value={formData.rolesSupported}
              onChange={(e) => setFormData({ ...formData, rolesSupported: e.target.value })}
              placeholder="Software Engineer, Product Manager"
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Difficulty Levels
              </label>
              <div className="flex gap-3">
                {['EASY', 'MEDIUM', 'HARD'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleDifficulty(level)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.difficultyLevels.includes(level)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Session Types Offered
              </label>
              <div className="flex gap-3">
                {['GUIDANCE', 'INTERVIEW'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleSessionType(type)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.sessionTypesOffered.includes(type)
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-violet-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="LinkedIn URL"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
            />

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
              <p className="text-sm text-slate-500 mb-1">Companies</p>
              <p className="font-medium text-slate-900">{profile.companies.join(', ') || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Experience</p>
              <p className="font-medium text-slate-900">{profile.yearsOfExperience || 'Not set'} years</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Status</p>
              <p className="font-medium text-green-600">{profile.status}</p>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}