'use client';

import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <Link href="/admin/interviewers">
          <Card variant="bordered" className="p-8 hover:shadow-lg transition-all cursor-pointer">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Manage Interviewers
            </h3>
            <p className="text-slate-600">
              Approve or reject interviewer applications
            </p>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card variant="bordered" className="p-8 hover:shadow-lg transition-all cursor-pointer">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              View Analytics
            </h3>
            <p className="text-slate-600">
              Platform statistics and insights
            </p>
          </Card>
        </Link>

        <Card variant="bordered" className="p-8">
          <div className="text-5xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Configuration
          </h3>
          <p className="text-slate-600">
            System settings and roles
          </p>
        </Card>
      </div>
    </div>
  );
}