import { Clock, House, Info, Languages, MapPin, Route } from 'lucide-react';
import type { PublicDictionary } from '../lib/publicI18n';
import type { AppLanguage, TimeFormat } from '../lib/transitUtils';

export type PublicTab = 'home' | 'routes' | 'stops' | 'info';

interface PublicHeaderProps {
  t: PublicDictionary;
  lang: AppLanguage;
  timeFormat: TimeFormat;
  activeTab: PublicTab;
  onNavigateTab: (tab: PublicTab) => void;
  onToggleLanguage: () => void;
  onToggleTimeFormat: (fmt: TimeFormat) => void;
}

const APP_LOGO_PATH = '/assets/aistudio/gandhinagar_bus_logo_ef8ba37c.jpg';

export function PublicHeader({
  t,
  lang,
  timeFormat,
  activeTab,
  onNavigateTab,
  onToggleLanguage,
  onToggleTimeFormat,
}: PublicHeaderProps) {
  const navItems: { id: PublicTab; label: string; Icon: typeof House }[] = [
    { id: 'home', label: t.navHome, Icon: House },
    { id: 'routes', label: t.navRoutes, Icon: Route },
    { id: 'stops', label: t.navStops, Icon: MapPin },
    { id: 'info', label: t.navInfo, Icon: Info },
  ];

  return (
    <header className="sticky top-0 z-30 h-14 border-b-2 border-[#08241B] bg-[#0F3D2E] text-white">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-2 px-2.5 sm:gap-4 sm:px-5">
        <button
          type="button"
          onClick={() => onNavigateTab('home')}
          className="inline-flex min-h-[44px] min-w-0 items-center gap-1.5 sm:gap-2.5 text-left text-[13px] sm:text-lg font-bold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <img
            src={APP_LOGO_PATH}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-xs border border-white/30 bg-[#FAF3E6] object-contain shrink-0"
          />
          <span className="truncate">{t.brandTitle}</span>
        </button>

        <nav aria-label={t.navHome} className="hidden md:flex h-full items-center gap-5">
          {navItems.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigateTab(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex h-full items-center gap-1.5 border-b-[3px] px-1 text-sm font-semibold whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white ${
                  isActive
                    ? 'border-white text-white'
                    : 'border-transparent text-emerald-100/85 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div
            role="group"
            aria-label={t.timeFormatAriaLabel}
            className="inline-flex items-center border border-emerald-200/40 bg-[#0A2B20] rounded-xs"
          >
            <Clock className="ml-1.5 mr-1 hidden h-3.5 w-3.5 text-emerald-200 sm:block" aria-hidden="true" />
            <button
              type="button"
              onClick={() => onToggleTimeFormat('12h')}
              aria-pressed={timeFormat === '12h'}
              className={`min-h-[44px] sm:min-h-[36px] px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white ${
                timeFormat === '12h'
                  ? 'bg-white text-[#0F3D2E]'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              {t.timeFormat12h}
            </button>
            <button
              type="button"
              onClick={() => onToggleTimeFormat('24h')}
              aria-pressed={timeFormat === '24h'}
              className={`min-h-[44px] sm:min-h-[36px] px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white ${
                timeFormat === '24h'
                  ? 'bg-white text-[#0F3D2E]'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              {t.timeFormat24h}
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleLanguage}
            aria-label={`${t.switchLanguageLabel}: ${t.switchLanguageTarget}`}
            data-lang={lang}
            className="inline-flex min-h-[44px] sm:min-h-[38px] items-center gap-1.5 border border-white/60 bg-[#0A2B20] px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-white rounded-xs hover:bg-white hover:text-[#0F3D2E] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Languages className="hidden h-3.5 w-3.5 shrink-0 sm:block" aria-hidden="true" />
            <span>{t.switchLanguageTarget}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
