import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { PublicDictionary } from '../lib/publicI18n';
import type { TransitDataset } from '../lib/transitService';
import {
  filterRoutesByTimeWindow,
  type AppLanguage,
  type OperatorPriority,
  type TimeFormat,
  type TimeWindowHours,
} from '../lib/transitUtils';
import { BusRouteCard } from './BusRouteCard';
import { EmptyTransitState } from './EmptyTransitState';
import { TimeWindowFilterBar } from './TimeWindowFilterBar';

interface RoutesPageProps {
  t: PublicDictionary;
  lang: AppLanguage;
  timeFormat: TimeFormat;
  nowMinutes: number;
  dataset: TransitDataset;
  isLoading: boolean;
  onSelectRoute: (routeId: string) => void;
}

export function RoutesPage({
  t,
  lang,
  timeFormat,
  nowMinutes,
  dataset,
  isLoading,
  onSelectRoute,
}: RoutesPageProps) {
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | OperatorPriority>('ALL');
  const [timeWindowHours, setTimeWindowHours] = useState<TimeWindowHours>('ALL');

  const filteredRoutes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dataset.routes.filter((route) => {
      if (priorityFilter !== 'ALL' && route.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        route.routeCode.toLowerCase().includes(q) ||
        route.name.toLowerCase().includes(q) ||
        route.origin.toLowerCase().includes(q) ||
        route.destination.toLowerCase().includes(q) ||
        route.operatorName.toLowerCase().includes(q)
      );
    });
  }, [dataset.routes, query, priorityFilter]);

  const filteredWithSchedules = useMemo(
    () =>
      filterRoutesByTimeWindow({
        routes: filteredRoutes,
        departures: dataset.departures,
        nowMinutes,
        timeWindowHours,
      }),
    [filteredRoutes, dataset.departures, nowMinutes, timeWindowHours],
  );

  const priorityOptions: { id: 'ALL' | OperatorPriority; label: string }[] = [
    { id: 'ALL', label: t.priorityAll },
    { id: 'P0', label: t.priorityP0 },
    { id: 'P1', label: t.priorityP1 },
    { id: 'P2', label: t.priorityP2 },
  ];

  return (
    <div>
      <section className="border-b border-neutral-300 bg-white">
        <div className="mx-auto max-w-6xl space-y-3 px-3 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                {t.routesPageTitle}
              </h1>
              <p className="mt-0.5 text-sm text-neutral-700">{t.routesPageSubtitle}</p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.routesSearchPlaceholder}
                aria-label={t.routesSearchPlaceholder}
                className="min-h-[44px] w-full rounded-none border border-neutral-400 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[#0F3D2E] focus:outline-2 focus:outline-offset-0 focus:outline-[#0F3D2E]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.priorityFilterHeading}>
            {priorityOptions.map((opt) => {
              const active = priorityFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPriorityFilter(opt.id)}
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
      </section>

      <section className="mx-auto max-w-6xl space-y-3 px-3 py-4 sm:px-5">
        <TimeWindowFilterBar
          t={t}
          lang={lang}
          timeFormat={timeFormat}
          nowMinutes={nowMinutes}
          selectedWindow={timeWindowHours}
          onSelectWindow={setTimeWindowHours}
        />

        {isLoading ? (
          <div className="border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            {t.loadingMessage}
          </div>
        ) : dataset.routes.length === 0 ? (
          <EmptyTransitState t={t} connectionReady={dataset.connectionReady} />
        ) : filteredRoutes.length === 0 ? (
          <EmptyTransitState
            t={t}
            connectionReady={dataset.connectionReady}
            customMessage={t.emptySearchMatches}
          />
        ) : filteredWithSchedules.length === 0 ? (
          <EmptyTransitState
            t={t}
            connectionReady={dataset.connectionReady}
            customMessage={t.emptyWindowMatches}
          />
        ) : (
          <div className="border border-neutral-300 divide-y divide-neutral-300 bg-white">
            {filteredWithSchedules.map(({ route, schedule }) => (
              <BusRouteCard
                key={route.id}
                route={route}
                departures={dataset.departures}
                scheduleSummary={schedule}
                nowMinutes={nowMinutes}
                timeWindowHours={timeWindowHours}
                t={t}
                lang={lang}
                timeFormat={timeFormat}
                onSelectRoute={onSelectRoute}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
