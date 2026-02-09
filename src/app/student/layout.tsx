'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/student/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/');
  };

  const navItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/student/book-guidance', label: 'Book Guidance', icon: '🎓' },
    { href: '/student/book-interview', label: 'Book Interview', icon: '💼' },
    { href: '/student/sessions', label: 'My Sessions', icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl" />
            <span className="text-2xl font-display font-bold text-slate-900">
              InterviewPrep<span className="text-indigo-600">Live</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {profile && (
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{profile.name}</p>
                <p className="text-xs text-slate-500">Student</p>
              </div>
            )}
            <Button onClick={handleLogout} variant="ghost" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)] p-6">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  pathname === item.href
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {!profile && !loading && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800 mb-2">Complete your profile</p>
              <Link href="/student/dashboard">
                <Button size="sm" className="w-full">
                  Setup Profile
                </Button>
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}