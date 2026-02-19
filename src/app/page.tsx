'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl" />
            <span className="text-2xl font-display font-bold text-white">
              InterviewPrep<span className="text-indigo-400">Live</span>
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/login/student">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Student Login
              </Button>
            </Link>
            <Link href="/login/interviewer">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Interviewer Login
              </Button>
            </Link>
            <Link href="/login/admin">
              <Button variant="ghost" className="text-red-400 hover:bg-red-500/10 border border-red-500/30">
                🛡️ Admin
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6 px-4 py-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full">
            <span className="text-indigo-300 text-sm font-medium">
              🎯 Live 1-to-1 Interview Preparation
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Master Your Next
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Interview
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 leading-relaxed">
            Connect with industry experts for personalized guidance sessions and realistic
            mock interviews. Get detailed feedback and level up your interview skills.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/signup/student">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                Get Started as Student
              </Button>
            </Link>
            <Link href="/signup/interviewer">
              <Button size="lg" variant="secondary" className="px-8">
                Join as Interviewer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}