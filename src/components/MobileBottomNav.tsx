import { House, Info, MapPin, Route } from 'lucide-react';
import type { PublicDictionary } from '../lib/publicI18n';
import type { PublicTab } from './PublicHeader';

interface MobileBottomNavProps {
  t: PublicDictionary;
  activeTab: PublicTab;
  onNavigateTab: (tab: PublicTab) => void;
}

export function MobileBottomNav({ t, activeTab, onNavigateTab }: MobileBottomNavProps) {
  const tabs: { id: PublicTab; label: string; Icon: typeof House }[] = [
    { id: 'home', label: t.navHome, Icon: House },
    { id: 'routes', label: t.navRoutes, Icon: Route },
    { id: 'stops', label: t.navStops, Icon: MapPin },
    { id: 'info', label: t.navInfo, Icon: Info },
  ];

  return (
    <nav
      aria-label={t.navHome}
      className="fixed bottom-0 left-0 right-0 z-40 h-14 border-t border-neutral-300 bg-white md:hidden"
    >
      <div className="grid h-full grid-cols-4 divide-x divide-neutral-200">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigateTab(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 border-t-[3px] px-1 text-[11px] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0F3D2E] ${
                isActive
                  ? 'border-t-[#0F3D2E] bg-neutral-50 font-bold text-[#0F3D2E]'
                  : 'border-t-transparent bg-white font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                strokeWidth={isActive ? 2.25 : 1.75}
                aria-hidden="true"
              />
              <span className="truncate max-w-full">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
