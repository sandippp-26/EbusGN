import { useMemo, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import type { PublicDictionary } from '../lib/publicI18n';
import type { TransitDataset } from '../lib/transitService';
import { EmptyTransitState } from './EmptyTransitState';

interface StopsPageProps {
  t: PublicDictionary;
  dataset: TransitDataset;
  isLoading: boolean;
  onSelectStop: (stopId: string) => void;
}

export function StopsPage({ t, dataset, isLoading, onSelectStop }: StopsPageProps) {
  const [query, setQuery] = useState('');

  const filteredStops = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dataset.stops.filter((stop) => {
      if (!q) return true;
      return (
        stop.name.toLowerCase().includes(q) ||
        (stop.area ?? '').toLowerCase().includes(q) ||
        (stop.landmark ?? '').toLowerCase().includes(q)
      );
    });
  }, [dataset.stops, query]);

  return (
    <div>
      <section className="border-b border-neutral-300 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
              {t.stopsPageTitle}
            </h1>
            <p className="mt-0.5 text-sm text-neutral-700">{t.stopsPageSubtitle}</p>
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
                placeholder={t.stopsSearchPlaceholder}
                aria-label={t.stopsSearchPlaceholder}
                className="min-h-[44px] w-full rounded-none border border-neutral-400 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[#0F3D2E] focus:outline-2 focus:outline-offset-0 focus:outline-[#0F3D2E]"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-3 py-4 sm:px-5">
          {isLoading ? (
            <div className="border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              {t.loadingMessage}
            </div>
          ) : dataset.stops.length === 0 ? (
            <EmptyTransitState t={t} connectionReady={dataset.connectionReady} />
          ) : filteredStops.length === 0 ? (
            <EmptyTransitState
              t={t}
              connectionReady={dataset.connectionReady}
              customMessage={t.emptySearchMatches}
            />
          ) : (
            <div className="border border-neutral-300 divide-y divide-neutral-300 bg-white">
              {filteredStops.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => onSelectStop(stop.id)}
                  className="flex min-h-[44px] w-full items-center justify-between gap-3 border-l-4 border-l-[#1E3A8A] px-3.5 py-2.5 text-left hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0F3D2E]"
                >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-neutral-900">{stop.name}</p>
                  {(stop.area || stop.landmark) && (
                    <p className="truncate text-xs text-neutral-600">
                      {[stop.area, stop.landmark].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
