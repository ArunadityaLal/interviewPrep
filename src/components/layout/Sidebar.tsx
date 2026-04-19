import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  navItems: NavItem[];
  footerContent?: React.ReactNode;
}

export function Sidebar({ navItems, footerContent }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full sm:w-64 bg-white border-r border-slate-200 min-h-auto sm:min-h-[calc(100vh-73px)] p-4 sm:p-6 flex flex-col overflow-x-hidden">
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-11 items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base transition-all ${
              pathname === item.href
                ? 'bg-indigo-50 text-indigo-600 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-lg sm:text-xl shrink-0">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      
      {footerContent && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          {footerContent}
        </div>
      )}
    </aside>
  );
}