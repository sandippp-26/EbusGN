import { Clock } from 'lucide-react';
import type { PublicDictionary } from '../lib/publicI18n';
import {
  formatMinutesToTimeString,
  formatTransitTime,
  type AppLanguage,
  type TimeFormat,
  type TimeWindowHours,
} from '../lib/transitUtils';

interface TimeWindowFilterBarProps {
  t: PublicDictionary;
  lang: AppLanguage;
  timeFormat: TimeFormat;
  nowMinutes: number;
  selectedWindow: TimeWindowHours;
  onSelectWindow: (next: TimeWindowHours) => void;
}

export function TimeWindowFilterBar({
  t,
  lang,
  timeFormat,
  nowMinutes,
  selectedWindow,
  onSelectWindow,
}: TimeWindowFilterBarProps) {
  const formattedNow =
    formatTransitTime(formatMinutesToTimeString(nowMinutes), timeFormat, lang) ?? '—';

  const options: { id: TimeWindowHours; label: string }[] = [
    { id: 2, label: t.timeWindowNext2h },
    { id: 3, label: t.timeWindowNext3h },
    { id: 4, label: t.timeWindowNext4h },
    { id: 'ALL', label: t.timeWindowAllToday },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-neutral-800">{t.timeWindowHeading}</span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 font-mono tabular-nums">
          <Clock className="h-3.5 w-3.5 shrink-0 text-[#0F3D2E]" aria-hidden="true" />
          <span>
            {t.currentTimeLabel}: <strong className="text-neutral-900">{formattedNow}</strong>
          </span>
        </span>
      </div>

      <div
        role="group"
        aria-label={t.timeWindowHeading}
        className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 max-w-full"
      >
        {options.map((opt) => {
          const active = selectedWindow === opt.id;
          return (
            <button
              key={String(opt.id)}
              type="button"
              onClick={() => onSelectWindow(opt.id)}
              aria-pressed={active}
              className={`min-h-[44px] rounded-none border px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F3D2E] ${
                active
                  ? 'border-[#0F3D2E] bg-[#0F3D2E] text-white'
                  : 'border-neutral-400 bg-white text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
