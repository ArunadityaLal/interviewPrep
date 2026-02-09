'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminConfigPage() {
  const [roles, setRoles] = useState([
    'Software Engineer',
    'Product Manager',
    'Data Scientist',
    'DevOps Engineer',
    'UI/UX Designer',
  ]);
  const [newRole, setNewRole] = useState('');

  const [difficulties] = useState(['EASY', 'MEDIUM', 'HARD']);

  const handleAddRole = () => {
    if (newRole.trim()) {
      setRoles([...roles, newRole.trim()]);
      setNewRole('');
    }
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">
        Platform Configuration
      </h1>

      {/* Roles Configuration */}
      <Card variant="elevated" className="p-8 mb-8">
        <h2 className="text-2xl font-display font-semibold text-slate-900 mb-6">
          Supported Roles
        </h2>
        
        <div className="mb-6">
          <p className="text-slate-600 mb-4">
            Manage the list of roles available for interview sessions.
          </p>
          
          <div className="flex gap-3 mb-4">
            <Input
              placeholder="Enter new role (e.g., Backend Engineer)"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
            />
            <Button onClick={handleAddRole}>Add Role</Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {roles.map((role, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <span className="text-slate-900">{role}</span>
                <button
                  onClick={() => handleRemoveRole(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Difficulty Levels */}
      <Card variant="elevated" className="p-8 mb-8">
        <h2 className="text-2xl font-display font-semibold text-slate-900 mb-6">
          Difficulty Levels
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          {difficulties.map((level) => (
            <div
              key={level}
              className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border-2 border-indigo-200"
            >
              <h3 className="font-semibold text-slate-900 mb-1">{level}</h3>
              <p className="text-sm text-slate-600">
                {level === 'EASY' && 'Entry-level questions'}
                {level === 'MEDIUM' && 'Intermediate complexity'}
                {level === 'HARD' && 'Advanced scenarios'}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Session Settings */}
      <Card variant="elevated" className="p-8">
        <h2 className="text-2xl font-display font-semibold text-slate-900 mb-6">
          Session Settings
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-slate-900">Default Session Duration</h3>
              <p className="text-sm text-slate-600">Standard duration for mock interviews</p>
            </div>
            <span className="text-lg font-bold text-indigo-600">60 minutes</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-slate-900">Guidance Session Duration</h3>
              <p className="text-sm text-slate-600">Options: 30, 45, or 60 minutes</p>
            </div>
            <span className="text-lg font-bold text-indigo-600">30-60 minutes</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-slate-900">Auto-Assignment</h3>
              <p className="text-sm text-slate-600">Load balancing algorithm enabled</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}