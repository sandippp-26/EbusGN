import { ChevronRight } from 'lucide-react';
import { getOperatorPriorityLabel, type PublicDictionary } from '../lib/publicI18n';
import {
  formatTransitTime,
  getRouteScheduleSummary,
  getServiceColorTheme,
  type AppLanguage,
  type RouteScheduleSummary,
  type ScheduledDeparture,
  type TimeFormat,
  type TimeWindowHours,
  type TransitRoute,
} from '../lib/transitUtils';

interface BusRouteCardProps {
  route: TransitRoute;
  departures?: ScheduledDeparture[];
  scheduleSummary?: RouteScheduleSummary;
  nowMinutes: number;
  timeWindowHours: TimeWindowHours;
  t: PublicDictionary;
  lang: AppLanguage;
  timeFormat: TimeFormat;
  onSelectRoute: (routeId: string) => void;
}

export function BusRouteCard({
  route,
  departures = [],
  scheduleSummary,
  nowMinutes,
  timeWindowHours,
  t,
  lang,
  timeFormat,
  onSelectRoute,
}: BusRouteCardProps) {
  const theme = getServiceColorTheme(route.category);
  const schedule =
    scheduleSummary ??
    getRouteScheduleSummary({
      route,
      departures,
      nowMinutes,
      timeWindowHours,
    });

  const verificationText =
    route.verificationTier === 'verified'
      ? t.statusVerified
      : route.verificationTier === 'partially_verified'
        ? t.statusPartiallyVerified
        : route.verificationTier === 'conflicting'
          ? t.statusConflicting
          : t.statusUnverified;

  const verificationColor =
    route.verificationTier === 'verified'
      ? 'text-[#0F3D2E] font-semibold'
      : route.verificationTier === 'partially_verified'
        ? 'text-blue-900 font-semibold'
        : route.verificationTier === 'conflicting'
          ? 'text-amber-900 font-semibold'
          : 'text-neutral-700 font-medium';

  const priorityTag = getOperatorPriorityLabel(route.priority, t);
  const operatorDisplay = route.operatorName || priorityTag;

  const renderTimetableContent = () => {
    if (!schedule.hasTimetable) {
      return <span className="text-xs text-neutral-600">{t.timetableUnavailable}</span>;
    }

    if (schedule.allPassedToday) {
      const tomorrowFmt = formatTransitTime(schedule.tomorrowFirstBusTime, timeFormat, lang);
      return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          <span className="font-bold text-amber-900">{t.serviceCompletedToday}</span>
          {tomorrowFmt && (
            <span className="font-mono tabular-nums text-neutral-800">
              {t.tomorrowFirstBusLabel}: <strong className="text-neutral-900">{tomorrowFmt}</strong>
            </span>
          )}
        </div>
      );
    }

    const nextFmt = formatTransitTime(schedule.nextDepartureTime, timeFormat, lang);
    const additionalUpcoming = schedule.upcomingTimes
      .slice(1, 3)
      .map((timeStr) => formatTransitTime(timeStr, timeFormat, lang))
      .filter((v): v is string => Boolean(v));

    if (nextFmt) {
      const countUnit =
        schedule.matchingWindowCount === 1
          ? t.matchingDeparturesSingular
          : t.matchingDeparturesPlural;

      return (
        <div className="space-y-0.5 text-xs">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
            <span className="inline-block bg-[#0F3D2E] px-1.5 py-0.5 font-mono font-bold text-white tabular-nums rounded-xs">
              {t.nextBusLabel}: {nextFmt}
            </span>
            {additionalUpcoming.length > 0 && (
              <span className="font-mono tabular-nums text-neutral-700">
                {t.upcomingTimesLabel}: {additionalUpcoming.join(' · ')}
              </span>
            )}
            {timeWindowHours !== 'ALL' && schedule.matchingWindowCount > 0 && (
              <span className="font-mono font-semibold text-neutral-800 tabular-nums">
                ({schedule.matchingWindowCount} {countUnit})
              </span>
            )}
          </div>
        </div>
      );
    }

    const firstFmt = formatTransitTime(schedule.firstBusTime, timeFormat, lang);
    const lastFmt = formatTransitTime(schedule.lastBusTime, timeFormat, lang);
    return (
      <span className="font-mono text-xs tabular-nums text-neutral-700">
        {t.firstBusLabel}: <strong className="text-neutral-900">{firstFmt ?? '—'}</strong>
        {' · '}
        {t.lastBusLabel}: <strong className="text-neutral-900">{lastFmt ?? '—'}</strong>
      </span>
    );
  };

  return (
    <button
      type="button"
      onClick={() => onSelectRoute(route.id)}
      className={`min-h-[44px] w-full bg-white px-3.5 py-3 text-left hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0F3D2E] sm:px-4 ${theme.leftBorder}`}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span
            className={`inline-block rounded-xs px-2 py-0.5 font-mono text-xs font-bold tracking-tight tabular-nums ${theme.solidBadge}`}
          >
            {route.routeCode}
          </span>
          <span
            className={`inline-block border px-1.5 py-0.5 text-[11px] font-semibold rounded-xs ${theme.operatorOutline}`}
          >
            {operatorDisplay}
          </span>
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <p className="truncate text-sm font-bold text-neutral-900 sm:text-base">
              {route.origin && route.destination
                ? `${route.origin} → ${route.destination}`
                : route.name}
            </p>
            <span className={`text-xs shrink-0 ${verificationColor}`}>{verificationText}</span>
          </div>
          {renderTimetableContent()}
        </div>

        <div className="flex items-center justify-end gap-1 text-xs font-bold text-[#0F3D2E] whitespace-nowrap shrink-0">
          <span>{t.viewDetailsLabel}</span>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
}
