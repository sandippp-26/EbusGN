import { ArrowLeft } from 'lucide-react';
import { getOperatorPriorityLabel, type PublicDictionary } from '../lib/publicI18n';
import type { TransitDataset } from '../lib/transitService';
import {
  formatTransitTime,
  getServiceColorTheme,
  type AppLanguage,
  type TimeFormat,
  type TransitRoute,
} from '../lib/transitUtils';

interface RouteDetailsPageProps {
  route: TransitRoute;
  dataset: TransitDataset;
  t: PublicDictionary;
  lang: AppLanguage;
  timeFormat: TimeFormat;
  onBack: () => void;
  onSelectStop: (stopId: string) => void;
}

export function RouteDetailsPage({
  route,
  dataset,
  t,
  lang,
  timeFormat,
  onBack,
  onSelectStop,
}: RouteDetailsPageProps) {
  const theme = getServiceColorTheme(route.category);
  const orderedStops = dataset.routeStops
    .filter((rs) => rs.routeId === route.id)
    .sort((a, b) => a.stopOrder - b.stopOrder);

  const departures = dataset.departures
    .filter((d) => d.routeId === route.id)
    .sort((a, b) => a.departureTime.localeCompare(b.departureTime));

  const priorityTag = getOperatorPriorityLabel(route.priority, t);
  const operatorDisplay = route.operatorName || priorityTag;

  const verificationText =
    route.verificationTier === 'verified'
      ? t.statusVerified
      : route.verificationTier === 'partially_verified'
        ? t.statusPartiallyVerified
        : route.verificationTier === 'conflicting'
          ? t.statusConflicting
          : t.statusUnverified;

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-3 py-4 sm:px-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[36px] items-center gap-1.5 text-sm font-bold text-[#0F3D2E] hover:underline underline-offset-4"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{t.backToRoutes}</span>
      </button>

      <section className={`border border-neutral-300 bg-white p-4 ${theme.leftBorder}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-block rounded-xs px-2.5 py-0.5 font-mono text-sm font-bold tabular-nums ${theme.solidBadge}`}
            >
              {route.routeCode}
            </span>
            <span
              className={`inline-block border px-2 py-0.5 text-xs font-semibold rounded-xs ${theme.operatorOutline}`}
            >
              {operatorDisplay}
            </span>
          </div>
          <span className="text-xs font-bold text-neutral-900">{verificationText}</span>
        </div>

        <h1 className="mt-2.5 text-xl font-bold text-neutral-900 sm:text-2xl">
          {route.origin && route.destination
            ? `${route.origin} → ${route.destination}`
            : route.name}
        </h1>

        <dl className="mt-3 grid grid-cols-1 gap-2 border-t border-neutral-300 pt-3 text-xs sm:grid-cols-3">
          <div>
            <dt className="font-semibold text-neutral-600">{t.routeDirectionLabel}</dt>
            <dd className="mt-0.5 text-sm font-medium text-neutral-900">{route.direction || '—'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-neutral-600">{t.lastUpdatedLabel}</dt>
            <dd className="mt-0.5 font-mono text-sm text-neutral-900 tabular-nums">
              {route.lastUpdated ?? t.lastUpdatedUnavailable}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-neutral-600">{t.dataSourceLabel}</dt>
            <dd className="mt-0.5 text-sm text-neutral-900">
              {route.dataSourceName ?? t.dataSourceUnavailable}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <section className="border border-neutral-300 bg-white">
          <div className="border-b border-neutral-300 bg-neutral-100 px-3.5 py-2.5">
            <h2 className="text-sm font-bold text-neutral-900">{t.intermediateStopsTitle}</h2>
          </div>

          {orderedStops.length === 0 ? (
            <p className="px-3.5 py-4 text-sm text-neutral-700">{t.noStopsRecorded}</p>
          ) : (
            <ol className="divide-y divide-neutral-200">
              {orderedStops.map((stop, idx) => (
                <li key={stop.id}>
                  <button
                    type="button"
                    onClick={() => stop.stopId && onSelectStop(stop.stopId)}
                    className="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 shrink-0 font-mono text-xs font-bold text-neutral-600 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-900">
                          {stop.stopName}
                        </p>
                        {stop.area && <p className="truncate text-xs text-neutral-600">{stop.area}</p>}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="border border-neutral-300 bg-white">
          <div className="border-b border-neutral-300 bg-neutral-100 px-3.5 py-2.5">
            <h2 className="text-sm font-bold text-neutral-900">{t.scheduledDeparturesTitle}</h2>
          </div>

          {departures.length === 0 ? (
            <p className="px-3.5 py-4 text-sm text-neutral-700">{t.timetableUnavailable}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-neutral-300 bg-neutral-50 font-bold text-neutral-800">
                    <th className="px-3.5 py-2">{t.departureTimeCol}</th>
                    <th className="px-3.5 py-2">{t.departureDirectionCol}</th>
                    <th className="px-3.5 py-2">{t.departureNotesCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {departures.map((dep) => (
                    <tr key={dep.id} className="hover:bg-neutral-50">
                      <td className="px-3.5 py-2 font-mono font-bold text-neutral-900 tabular-nums whitespace-nowrap">
                        {formatTransitTime(dep.departureTime, timeFormat, lang) ??
                          t.timetableUnavailable}
                      </td>
                      <td className="px-3.5 py-2 text-neutral-800">{dep.direction ?? '—'}</td>
                      <td className="px-3.5 py-2 text-neutral-700">{dep.frequencyNote ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="border border-neutral-300 bg-neutral-50 px-3.5 py-3 text-xs text-neutral-800">
        <span className="font-bold">{t.verificationNoteTitle}: </span>
        <span>
          {route.verificationTier === 'verified'
            ? t.verificationNoteVerified
            : t.verificationNoteCaution}
        </span>
      </section>
    </div>
  );
}
