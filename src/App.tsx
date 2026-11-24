/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { HomePage } from './components/HomePage';
import { InfoPage } from './components/InfoPage';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PublicHeader, type PublicTab } from './components/PublicHeader';
import { RouteDetailsPage } from './components/RouteDetailsPage';
import { RoutesPage } from './components/RoutesPage';
import { StopDetailsPage } from './components/StopDetailsPage';
import { StopsPage } from './components/StopsPage';
import { PUBLIC_I18N } from './lib/publicI18n';
import { fetchPublicTransitData, type TransitDataset } from './lib/transitService';
import {
  getCurrentDeviceMinutes,
  type AppLanguage,
  type TimeFormat,
} from './lib/transitUtils';

const LANG_STORAGE_KEY = 'gb_lang';
const TIME_FORMAT_STORAGE_KEY = 'gb_time_format';

const EMPTY_DATASET: TransitDataset = {
  connectionReady: false,
  hasAnyVerifiedData: false,
  operators: [],
  routes: [],
  stops: [],
  routeStops: [],
  departures: [],
  dataSources: [],
  errorMessage: null,
};

function readStoredLanguage(): AppLanguage {
  try {
    const val = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (val === 'en' || val === 'gu') return val;
  } catch {
    // ignore storage access errors
  }
  return 'gu';
}

function readStoredTimeFormat(): TimeFormat {
  try {
    const val = window.localStorage.getItem(TIME_FORMAT_STORAGE_KEY);
    if (val === '12h' || val === '24h') return val;
  } catch {
    // ignore storage access errors
  }
  return '12h';
}

export default function App() {
  const [lang, setLang] = useState<AppLanguage>(readStoredLanguage);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(readStoredTimeFormat);
  const [nowMinutes, setNowMinutes] = useState<number>(() => getCurrentDeviceMinutes());
  const [activeTab, setActiveTab] = useState<PublicTab>('home');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [dataset, setDataset] = useState<TransitDataset>(EMPTY_DATASET);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const t = PUBLIC_I18N[lang];

  useEffect(() => {
    const syncClock = () => setNowMinutes(getCurrentDeviceMinutes());
    syncClock();
    const intervalId = window.setInterval(syncClock, 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const loadData = useCallback(async (activeLang: AppLanguage) => {
    setIsLoading(true);
    try {
      const nextData = await fetchPublicTransitData(activeLang);
      setDataset(nextData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(lang);
  }, [lang, loadData]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.seoTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', t.seoDescription);
    }
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang, t.seoTitle, t.seoDescription]);

  const handleToggleLanguage = () => {
    setLang((prev) => (prev === 'gu' ? 'en' : 'gu'));
  };

  const handleToggleTimeFormat = (fmt: TimeFormat) => {
    setTimeFormat(fmt);
    try {
      window.localStorage.setItem(TIME_FORMAT_STORAGE_KEY, fmt);
    } catch {
      // ignore
    }
  };

  const handleNavigateTab = (tab: PublicTab) => {
    setActiveTab(tab);
    setSelectedRouteId(null);
    setSelectedStopId(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
    setSelectedStopId(null);
    setActiveTab('routes');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleSelectStop = (stopId: string) => {
    setSelectedStopId(stopId);
    setSelectedRouteId(null);
    setActiveTab('stops');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const selectedRoute =
    selectedRouteId ? dataset.routes.find((r) => r.id === selectedRouteId) ?? null : null;
  const selectedStop =
    selectedStopId ? dataset.stops.find((s) => s.id === selectedStopId) ?? null : null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 pb-14 md:pb-0">
      <PublicHeader
        t={t}
        lang={lang}
        timeFormat={timeFormat}
        activeTab={activeTab}
        onNavigateTab={handleNavigateTab}
        onToggleLanguage={handleToggleLanguage}
        onToggleTimeFormat={handleToggleTimeFormat}
      />

      <main className="flex-1">
        {selectedRoute ? (
          <RouteDetailsPage
            route={selectedRoute}
            dataset={dataset}
            t={t}
            lang={lang}
            timeFormat={timeFormat}
            onBack={() => setSelectedRouteId(null)}
            onSelectStop={handleSelectStop}
          />
        ) : selectedStop ? (
          <StopDetailsPage
            stop={selectedStop}
            dataset={dataset}
            t={t}
            lang={lang}
            timeFormat={timeFormat}
            nowMinutes={nowMinutes}
            onBack={() => setSelectedStopId(null)}
            onSelectRoute={handleSelectRoute}
          />
        ) : activeTab === 'home' ? (
          <HomePage
            t={t}
            lang={lang}
            timeFormat={timeFormat}
            nowMinutes={nowMinutes}
            dataset={dataset}
            isLoading={isLoading}
            onNavigateTab={handleNavigateTab}
            onSelectRoute={handleSelectRoute}
          />
        ) : activeTab === 'routes' ? (
          <RoutesPage
            t={t}
            lang={lang}
            timeFormat={timeFormat}
            nowMinutes={nowMinutes}
            dataset={dataset}
            isLoading={isLoading}
            onSelectRoute={handleSelectRoute}
          />
        ) : activeTab === 'stops' ? (
          <StopsPage
            t={t}
            dataset={dataset}
            isLoading={isLoading}
            onSelectStop={handleSelectStop}
          />
        ) : (
          <InfoPage t={t} lang={lang} dataset={dataset} />
        )}
      </main>

      <footer className="border-t border-neutral-300 bg-neutral-100">
        <div className="mx-auto max-w-6xl px-3 py-3.5 text-xs font-medium text-neutral-700 sm:px-5">
          {t.footerText}
        </div>
      </footer>

      <MobileBottomNav t={t} activeTab={activeTab} onNavigateTab={handleNavigateTab} />
    </div>
  );
}
