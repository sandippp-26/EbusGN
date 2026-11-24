import { useMemo, useState, type FormEvent } from 'react';
import { ArrowUpDown, MapPin, Route, Search } from 'lucide-react';
import type { PublicDictionary } from '../lib/publicI18n';
import type { TransitDataset } from '../lib/transitService';
import {
  filterRoutesByTimeWindow,
  searchDirectRoutes,
  type AppLanguage,
  type OperatorPriority,
  type TimeFormat,
  type TimeWindowHours,
} from '../lib/transitUtils';
import { BusRouteCard } from './BusRouteCard';
import { EmptyTransitState } from './EmptyTransitState';
import type { PublicTab } from './PublicHeader';
import { StopCombobox } from './StopCombobox';
import { TimeWindowFilterBar } from './TimeWindowFilterBar';

interface HomePageProps {
  t: PublicDictionary;
  lang: AppLanguage;
  timeFormat: TimeFormat;
  nowMinutes: number;
  dataset: TransitDataset;
  isLoading: boolean;
  onNavigateTab: (tab: PublicTab) => void;
  onSelectRoute: (routeId: string) => void;
}

export function HomePage({
  t,
  lang,
  timeFormat,
  nowMinutes,
  dataset,
  isLoading,
  onNavigateTab,
  onSelectRoute,
}: HomePageProps) {
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [submittedFrom, setSubmittedFrom] = useState('');
  const [submittedTo, setSubmittedTo] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | OperatorPriority>('ALL');
  const [timeWindowHours, setTimeWindowHours] = useState<TimeWindowHours>('ALL');

  const matchingRoutes = useMemo(
    () =>
      searchDirectRoutes({
        routes: dataset.routes,
        routeStops: dataset.routeStops,
        fromQuery: submittedFrom,
        toQuery: submittedTo,
        priorityFilter,
      }),
    [dataset.routes, dataset.routeStops, submittedFrom, submittedTo, priorityFilter],
  );

  const filteredWithSchedules = useMemo(
    () =>
      filterRoutesByTimeWindow({
        routes: matchingRoutes,
        departures: dataset.departures,
        nowMinutes,
        timeWindowHours,
      }),
    [matchingRoutes, dataset.departures, nowMinutes, timeWindowHours],
  );

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSubmittedFrom(fromInput);
    setSubmittedTo(toInput);
    setHasSearched(true);
  };

  const handleSwap = () => {
    setFromInput(toInput);
    setToInput(fromInput);
  };

  const handleClear = () => {
    setFromInput('');
    setToInput('');
    setSubmittedFrom('');
    setSubmittedTo('');
    setHasSearched(false);
    setPriorityFilter('ALL');
    setTimeWindowHours('ALL');
  };

  const priorityOptions: { id: 'ALL' | OperatorPriority; label: string }[] = [
    { id: 'ALL', label: t.priorityAll },
    { id: 'P0', label: t.priorityP0 },
    { id: 'P1', label: t.priorityP1 },
    { id: 'P2', label: t.priorityP2 },
  ];

  return (
    <div>
      <section className="border-b border-neutral-300 bg-white">
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-5 sm:py-5">
          <p className="text-xs font-semibold text-[#0F3D2E]">{t.heroTagline}</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            {t.heroHeading}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-neutral-700">{t.heroSubheading}</p>

          <form onSubmit={handleSearch} className="mt-4 border border-neutral-300 bg-neutral-50 p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[1fr_auto_1fr] md:items-end">
              <StopCombobox
                id="from-stop-input"
                label={t.fromLabel}
                placeholder={t.fromPlaceholder}
                value={fromInput}
                onChange={setFromInput}
                stops={dataset.stops}
                t={t}
                connectionReady={dataset.connectionReady}
              />

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSwap}
                  aria-label={t.swapStopsAria}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-none border border-neutral-400 bg-white text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#0F3D2E]"
                >
                  <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <StopCombobox
                id="to-stop-input"
                label={t.toLabel}
                placeholder={t.toPlaceholder}
                value={toInput}
                onChange={setToInput}
                stops={dataset.stops}
                t={t}
                connectionReady={dataset.connectionReady}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xs bg-[#0F3D2E] px-4 py-2 text-sm font-bold text-white hover:bg-[#0A2B20] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F3D2E]"
              >
                <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{t.searchBusButton}</span>
              </button>

              {(hasSearched ||
                fromInput ||
                toInput ||
                priorityFilter !== 'ALL' ||
                timeWindowHours !== 'ALL') && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xs border border-neutral-400 bg-white px-3.5 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100 whitespace-nowrap shrink-0"
                >
                  {t.clearSearchButton}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="border-b border-neutral-300 bg-neutral-50">
        <div className="mx-auto max-w-6xl space-y-3 px-3 py-3.5 sm:px-5">
          <div aria-label={t.priorityFilterHeading}>
            <h2 className="mb-1.5 text-xs font-bold text-neutral-800">{t.priorityFilterHeading}</h2>
            <div className="flex flex-wrap gap-1.5">
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

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onNavigateTab('routes')}
              className="flex min-h-[44px] items-center gap-3 border border-neutral-300 border-l-4 border-l-[#0F3D2E] bg-white px-3.5 py-2.5 text-left hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F3D2E]"
            >
              <Route className="h-5 w-5 shrink-0 text-[#0F3D2E]" aria-hidden="true" />
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-neutral-900">{t.quickBrowseRoutesTitle}</h2>
                <p className="text-xs text-neutral-700">{t.quickBrowseRoutesDesc}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('stops')}
              className="flex min-h-[44px] items-center gap-3 border border-neutral-300 border-l-4 border-l-[#1E3A8A] bg-white px-3.5 py-2.5 text-left hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F3D2E]"
            >
              <MapPin className="h-5 w-5 shrink-0 text-[#1E3A8A]" aria-hidden="true" />
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-neutral-900">{t.quickBrowseStopsTitle}</h2>
                <p className="text-xs text-neutral-700">{t.quickBrowseStopsDesc}</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section aria-live="polite" className="bg-white">
        <div className="mx-auto max-w-6xl space-y-3 px-3 py-4 sm:px-5">
          <div className="space-y-2.5">
            <h2 className="text-base font-bold text-neutral-900">{t.searchResultsHeading}</h2>
            <TimeWindowFilterBar
              t={t}
              lang={lang}
              timeFormat={timeFormat}
              nowMinutes={nowMinutes}
              selectedWindow={timeWindowHours}
              onSelectWindow={setTimeWindowHours}
            />
          </div>

          {isLoading ? (
            <div className="border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              {t.loadingMessage}
            </div>
          ) : dataset.routes.length === 0 ? (
            <EmptyTransitState t={t} connectionReady={dataset.connectionReady} />
          ) : matchingRoutes.length === 0 ? (
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
        </div>
      </section>
    </div>
  );
}
