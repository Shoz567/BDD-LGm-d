'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

const BREADCRUMBS: Record<string, string> = {
  '/gestion': 'Dashboard',
  '/gestion/clients': 'Patients',
  '/gestion/commandes': 'Commandes',
  '/gestion/catalogue': 'Catalogue',
  '/gestion/chat': 'Assistant IA',
};

export function GestionHeader() {
  const pathname = usePathname();
  const pageTitle = BREADCRUMBS[pathname] ?? 'Gestion';

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-gray-200 bg-white px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400 font-medium">LGm@d</span>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-900">{pageTitle}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-amber-400" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            AP
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-800 leading-tight">Pharmacie Aprium</p>
            <p className="text-[10px] text-gray-400">Mode Gestion</p>
          </div>
        </div>
      </div>
    </header>
  );
}
