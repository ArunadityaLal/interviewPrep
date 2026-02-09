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
          <div className="flex gap-4">
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup/student">
              <Button size="lg" className="w-full sm:w-auto min-w-[200px]">
                Get Started as Student
              </Button>
            </Link>
            <Link href="/signup/interviewer">
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full sm:w-auto min-w-[200px] bg-white/10 text-white hover:bg-white/20 border border-white/20"
              >
                Join as Interviewer
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="w-14 h-14 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-white mb-2">
              Expert Mentors
            </h3>
            <p className="text-slate-400">
              Learn from professionals at top tech companies with years of interview experience
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="w-14 h-14 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-white mb-2">
              Real Interviews
            </h3>
            <p className="text-slate-400">
              Experience actual interview conditions with detailed performance feedback
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-white mb-2">
              Instant Booking
            </h3>
            <p className="text-slate-400">
              Choose your preferred time slot and get matched with the perfect interviewer
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400">
          <p>© 2026 InterviewPrep Live. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}