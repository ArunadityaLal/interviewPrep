'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function InterviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/interviewer/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleLogout = () => {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/');
  };

  const navItems = [
    { href: '/interviewer/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/interviewer/availability', label: 'Availability', icon: '📅' },
    { href: '/interviewer/sessions', label: 'Sessions', icon: '💼' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/interviewer/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl" />
            <span className="text-2xl font-display font-bold text-slate-900">
              InterviewPrep<span className="text-indigo-600">Live</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {profile && (
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{profile.name}</p>
                <p className="text-xs text-slate-500">
                  {profile.status === 'APPROVED' ? 'Interviewer' : `Status: ${profile.status}`}
                </p>
              </div>
            )}
            <Button onClick={handleLogout} variant="ghost" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)] p-6">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  pathname === item.href
                    ? 'bg-violet-50 text-violet-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}