import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface NavbarProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export function Navbar({ userName, userRole, onLogout }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl shrink-0" />
          <span className="text-lg sm:text-2xl font-display font-bold text-slate-900 truncate">
            InterviewPrep<span className="text-indigo-600">Live</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {userName && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{userName}</p>
              {userRole && (
                <p className="text-xs text-slate-500 capitalize">{userRole.toLowerCase()}</p>
              )}
            </div>
          )}
          {onLogout && (
            <Button onClick={onLogout} variant="ghost" size="sm" className="px-3 sm:px-4">
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}