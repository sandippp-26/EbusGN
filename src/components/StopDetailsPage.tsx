import { ArrowLeft } from 'lucide-react';
import type { PublicDictionary } from '../lib/publicI18n';
import type { TransitDataset } from '../lib/transitService';
import type { AppLanguage, TimeFormat, TransitStop } from '../lib/transitUtils';
import { BusRouteCard } from './BusRouteCard';

interface StopDetailsPageProps {
  stop: TransitStop;
  dataset: TransitDataset;
  t: PublicDictionary;
  lang: AppLanguage;
  timeFormat: TimeFormat;
  nowMinutes: number;
  onBack: () => void;
  onSelectRoute: (routeId: string) => void;
}

export function StopDetailsPage({
  stop,
  dataset,
  t,
  lang,
  timeFormat,
  nowMinutes,
  onBack,
  onSelectRoute,
}: StopDetailsPageProps) {
  const servingRouteIds = new Set(
    dataset.routeStops
      .filter((rs) => rs.stopId === stop.id || rs.stopName.toLowerCase() === stop.name.toLowerCase())
      .map((rs) => rs.routeId),
  );

  const servingRoutes = dataset.routes.filter((r) => servingRouteIds.has(r.id));

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-3 py-4 sm:px-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-[#0F3D2E] hover:underline underline-offset-4"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{t.backToStops}</span>
      </button>

      <section className="border border-neutral-300 border-l-4 border-l-[#1E3A8A] bg-white p-4">
        <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">{stop.name}</h1>
        <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-700">
          {stop.area && (
            <div>
              <span className="font-semibold text-neutral-600">{t.stopAreaLabel}: </span>
              <span className="text-neutral-900">{stop.area}</span>
            </div>
          )}
          {stop.landmark && (
            <div>
              <span className="font-semibold text-neutral-600">{t.stopLandmarkLabel}: </span>
              <span className="text-neutral-900">{stop.landmark}</span>
            </div>
          )}
        </dl>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-neutral-900">{t.busesThroughStopTitle}</h2>
        {servingRoutes.length === 0 ? (
          <div className="border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            {t.noRoutesForStop}
          </div>
        ) : (
          <div className="border border-neutral-300 divide-y divide-neutral-300 bg-white">
            {servingRoutes.map((route) => (
              <BusRouteCard
                key={route.id}
                route={route}
                departures={dataset.departures}
                nowMinutes={nowMinutes}
                timeWindowHours="ALL"
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
