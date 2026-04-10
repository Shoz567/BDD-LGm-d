'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  BookOpen,
  Bot,
  ArrowLeftRight,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/gestion', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/gestion/clients', label: 'Patients', icon: Users },
  { href: '/gestion/commandes', label: 'Commandes', icon: ShoppingCart },
  { href: '/gestion/catalogue', label: 'Catalogue', icon: BookOpen },
  { href: '/gestion/chat', label: 'Assistant IA', icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white text-xs font-bold shrink-0">
          LG
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">LGm@d</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Mode Gestion</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600 pl-[10px]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  active ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {active && (
                <ChevronRight className="h-3 w-3 text-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3 space-y-1">
        <Link
          href="/comptoir"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all duration-150"
        >
          <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" />
          Mode Comptoir IA
        </Link>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
            AP
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Pharmacie Aprium</p>
            <p className="text-[10px] text-gray-400 truncate">admin@aprium.fr</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
