import type { DataVerificationTier } from './supabaseGuard.ts';

export type AppLanguage = 'gu' | 'en';
export type TimeFormat = '12h' | '24h';
export type OperatorPriority = 'P0' | 'P1' | 'P2';
export type ServiceCategory = 'green_city' | 'brts_amts' | 'gsrtc' | 'gift_local';
export type IssueType = 'wrong_route' | 'wrong_stop' | 'wrong_timing' | 'other';
export type TimeWindowHours = 'ALL' | 2 | 3 | 4;

export interface TransitOperator {
  id: string;
  name: string;
  shortName: string;
  serviceType: string;
  priority: OperatorPriority;
  category: ServiceCategory;
}

export interface TransitStop {
  id: string;
  name: string;
  area: string | null;
  landmark: string | null;
  verificationTier: DataVerificationTier;
}

export interface TransitRouteStop {
  id: string;
  routeId: string;
  stopId: string;
  stopOrder: number;
  stopName: string;
  area: string | null;
}

export interface ScheduledDeparture {
  id: string;
  routeId: string;
  departureTime: string;
  direction: string | null;
  frequencyNote: string | null;
  verificationTier: DataVerificationTier;
}

export interface TransitDataSource {
  id: string;
  name: string;
  sourceType: string | null;
  referenceUrl: string | null;
}

export interface TransitRoute {
  id: string;
  routeCode: string;
  name: string;
  origin: string;
  destination: string;
  direction: string | null;
  operatorId: string | null;
  operatorName: string;
  priority: OperatorPriority;
  category: ServiceCategory;
  firstBusTime: string | null;
  lastBusTime: string | null;
  lastUpdated: string | null;
  verificationTier: DataVerificationTier;
  dataSourceName: string | null;
}

export interface ServiceColorTheme {
  leftBorder: string;
  solidBadge: string;
  operatorOutline: string;
}

export function getServiceColorTheme(category: ServiceCategory): ServiceColorTheme {
  switch (category) {
    case 'green_city':
      return {
        leftBorder: 'border-l-4 border-l-[#0F3D2E]',
        solidBadge: 'bg-[#0F3D2E] text-white',
        operatorOutline: 'border-[#0F3D2E] text-[#0F3D2E] bg-emerald-50/50',
      };
    case 'brts_amts':
      return {
        leftBorder: 'border-l-4 border-l-[#1E3A8A]',
        solidBadge: 'bg-[#1E3A8A] text-white',
        operatorOutline: 'border-[#1E3A8A] text-[#1E3A8A] bg-blue-50/50',
      };
    case 'gsrtc':
      return {
        leftBorder: 'border-l-4 border-l-[#7F1D1D]',
        solidBadge: 'bg-[#7F1D1D] text-white',
        operatorOutline: 'border-[#7F1D1D] text-[#7F1D1D] bg-rose-50/50',
      };
    case 'gift_local':
    default:
      return {
        leftBorder: 'border-l-4 border-l-[#134E4A]',
        solidBadge: 'bg-[#134E4A] text-white',
        operatorOutline: 'border-[#134E4A] text-[#134E4A] bg-teal-50/50',
      };
  }
}

export function classifyOperator(
  operatorName: string,
  serviceType?: string | null,
): { priority: OperatorPriority; category: ServiceCategory } {
  const combined = `${operatorName} ${serviceType ?? ''}`.toLowerCase();

  if (
    combined.includes('ggtsl') ||
    combined.includes('green city') ||
    combined.includes('pm ebus') ||
    combined.includes('pm-ebus') ||
    combined.includes('e-bus') ||
    combined.includes('gandhinagar municipal') ||
    combined.includes('gmc')
  ) {
    return { priority: 'P0', category: 'green_city' };
  }

  if (combined.includes('gsrtc') || combined.includes('st bus') || combined.includes('state transport')) {
    return { priority: 'P1', category: 'gsrtc' };
  }

  if (
    combined.includes('brts') ||
    combined.includes('amts') ||
    combined.includes('janmarg') ||
    combined.includes('ajl')
  ) {
    return { priority: 'P1', category: 'brts_amts' };
  }

  if (combined.includes('gift') || combined.includes('feeder') || combined.includes('local')) {
    return { priority: 'P2', category: 'gift_local' };
  }

  return { priority: 'P2', category: 'gift_local' };
}

export function parseTimeToMinutes(rawTime: string | null | undefined): number | null {
  if (!rawTime) return null;
  const trimmed = rawTime.trim();
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(trimmed);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return hours * 60 + minutes;
}

export function getCurrentDeviceMinutes(now: Date = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

export function formatMinutesToTimeString(minutesTotal: number): string {
  const clamped = ((Math.floor(minutesTotal) % 1440) + 1440) % 1440;
  const hh = String(Math.floor(clamped / 60)).padStart(2, '0');
  const mm = String(clamped % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function formatTransitTime(
  rawTime: string | null | undefined,
  format: TimeFormat,
  lang: AppLanguage,
): string | null {
  const totalMinutes = parseTimeToMinutes(rawTime);
  if (totalMinutes === null) return null;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const mm = String(minutes).padStart(2, '0');

  if (format === '24h') {
    const hh24 = String(hours).padStart(2, '0');
    return `${hh24}:${mm}`;
  }

  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const hh12 = String(hour12).padStart(2, '0');

  if (lang === 'en') {
    const period = hours < 12 ? 'AM' : 'PM';
    return `${hh12}:${mm} ${period}`;
  }

  let periodGu = 'રાત્રે';
  if (hours >= 4 && hours < 12) {
    periodGu = 'સવારે';
  } else if (hours >= 12 && hours < 16) {
    periodGu = 'બપોરે';
  } else if (hours >= 16 && hours < 20) {
    periodGu = 'સાંજે';
  }
  return `${periodGu} ${hh12}:${mm}`;
}

export interface RouteScheduleSummary {
  hasTimetable: boolean;
  hasDetailedDepartures: boolean;
  firstBusTime: string | null;
  lastBusTime: string | null;
  nextDepartureTime: string | null;
  upcomingTimes: string[];
  matchingWindowCount: number;
  allPassedToday: boolean;
  tomorrowFirstBusTime: string | null;
}

export function getRouteScheduleSummary(input: {
  route: TransitRoute;
  departures: ScheduledDeparture[];
  nowMinutes: number;
  timeWindowHours: TimeWindowHours;
}): RouteScheduleSummary {
  const { route, departures, nowMinutes, timeWindowHours } = input;

  const parsedEntries: { minutes: number; raw: string }[] = [];
  const seenMinutes = new Set<number>();

  for (const dep of departures) {
    if (dep.routeId !== route.id) continue;
    const mins = parseTimeToMinutes(dep.departureTime);
    if (mins === null || seenMinutes.has(mins)) continue;
    seenMinutes.add(mins);
    parsedEntries.push({ minutes: mins, raw: formatMinutesToTimeString(mins) });
  }

  parsedEntries.sort((a, b) => a.minutes - b.minutes);

  if (parsedEntries.length > 0) {
    const firstBusTime = parsedEntries[0].raw;
    const lastBusTime = parsedEntries[parsedEntries.length - 1].raw;
    const upcomingToday = parsedEntries.filter((e) => e.minutes >= nowMinutes);

    if (timeWindowHours === 'ALL') {
      const allPassedToday = upcomingToday.length === 0;
      return {
        hasTimetable: true,
        hasDetailedDepartures: true,
        firstBusTime,
        lastBusTime,
        nextDepartureTime: upcomingToday[0]?.raw ?? null,
        upcomingTimes: upcomingToday.slice(0, 3).map((e) => e.raw),
        matchingWindowCount: upcomingToday.length,
        allPassedToday,
        tomorrowFirstBusTime: allPassedToday ? firstBusTime : null,
      };
    }

    const windowEndMinutes = nowMinutes + timeWindowHours * 60;
    const inWindow = upcomingToday.filter((e) => e.minutes <= windowEndMinutes);

    return {
      hasTimetable: true,
      hasDetailedDepartures: true,
      firstBusTime,
      lastBusTime,
      nextDepartureTime: inWindow[0]?.raw ?? null,
      upcomingTimes: inWindow.slice(0, 3).map((e) => e.raw),
      matchingWindowCount: inWindow.length,
      allPassedToday: upcomingToday.length === 0,
      tomorrowFirstBusTime: upcomingToday.length === 0 ? firstBusTime : null,
    };
  }

  const firstMins = parseTimeToMinutes(route.firstBusTime);
  const lastMins = parseTimeToMinutes(route.lastBusTime);
  if (firstMins !== null || lastMins !== null) {
    const fallbackFirst = firstMins !== null ? formatMinutesToTimeString(firstMins) : null;
    const fallbackLast = lastMins !== null ? formatMinutesToTimeString(lastMins) : null;
    const allPassedToday = lastMins !== null ? nowMinutes > lastMins : false;

    let matchingWindowCount = 0;
    if (timeWindowHours !== 'ALL') {
      const windowEnd = nowMinutes + timeWindowHours * 60;
      if (firstMins !== null && lastMins !== null) {
        if (lastMins >= nowMinutes && firstMins <= windowEnd) {
          matchingWindowCount = 1;
        }
      } else if (firstMins !== null && firstMins >= nowMinutes && firstMins <= windowEnd) {
        matchingWindowCount = 1;
      } else if (lastMins !== null && lastMins >= nowMinutes && lastMins <= windowEnd) {
        matchingWindowCount = 1;
      }
    }

    return {
      hasTimetable: true,
      hasDetailedDepartures: false,
      firstBusTime: fallbackFirst,
      lastBusTime: fallbackLast,
      nextDepartureTime:
        !allPassedToday && firstMins !== null && firstMins >= nowMinutes ? fallbackFirst : null,
      upcomingTimes:
        !allPassedToday && firstMins !== null && firstMins >= nowMinutes && fallbackFirst
          ? [fallbackFirst]
          : [],
      matchingWindowCount,
      allPassedToday,
      tomorrowFirstBusTime: allPassedToday ? fallbackFirst : null,
    };
  }

  return {
    hasTimetable: false,
    hasDetailedDepartures: false,
    firstBusTime: null,
    lastBusTime: null,
    nextDepartureTime: null,
    upcomingTimes: [],
    matchingWindowCount: 0,
    allPassedToday: false,
    tomorrowFirstBusTime: null,
  };
}

export function filterRoutesByTimeWindow(input: {
  routes: TransitRoute[];
  departures: ScheduledDeparture[];
  nowMinutes: number;
  timeWindowHours: TimeWindowHours;
}): { route: TransitRoute; schedule: RouteScheduleSummary }[] {
  const { routes, departures, nowMinutes, timeWindowHours } = input;
  const mapped = routes.map((route) => ({
    route,
    schedule: getRouteScheduleSummary({
      route,
      departures,
      nowMinutes,
      timeWindowHours,
    }),
  }));

  if (timeWindowHours === 'ALL') {
    return mapped;
  }

  return mapped
    .filter((item) => item.schedule.matchingWindowCount > 0)
    .sort((a, b) => {
      const aNext = parseTimeToMinutes(a.schedule.nextDepartureTime) ?? 9999;
      const bNext = parseTimeToMinutes(b.schedule.nextDepartureTime) ?? 9999;
      if (aNext !== bNext) return aNext - bNext;
      return a.route.routeCode.localeCompare(b.route.routeCode);
    });
}

export function filterStopsForAutocomplete(
  stops: TransitStop[],
  query: string,
  limit = 40,
): TransitStop[] {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? stops.filter(
        (stop) =>
          stop.name.toLowerCase().includes(q) ||
          (stop.area ?? '').toLowerCase().includes(q) ||
          (stop.landmark ?? '').toLowerCase().includes(q),
      )
    : stops;

  return filtered.slice(0, limit);
}

export function searchDirectRoutes(input: {
  routes: TransitRoute[];
  routeStops: TransitRouteStop[];
  fromQuery: string;
  toQuery: string;
  priorityFilter: 'ALL' | OperatorPriority;
}): TransitRoute[] {
  const { routes, routeStops, fromQuery, toQuery, priorityFilter } = input;
  const fromNorm = fromQuery.trim().toLowerCase();
  const toNorm = toQuery.trim().toLowerCase();

  const stopsByRoute = new Map<string, TransitRouteStop[]>();
  for (const rs of routeStops) {
    const list = stopsByRoute.get(rs.routeId) ?? [];
    list.push(rs);
    stopsByRoute.set(rs.routeId, list);
  }
  for (const list of stopsByRoute.values()) {
    list.sort((a, b) => a.stopOrder - b.stopOrder);
  }

  const priorityRank: Record<OperatorPriority, number> = { P0: 0, P1: 1, P2: 2 };

  return routes
    .filter((route) => {
      if (priorityFilter !== 'ALL' && route.priority !== priorityFilter) {
        return false;
      }

      if (!fromNorm && !toNorm) {
        return true;
      }

      const orderedStops = stopsByRoute.get(route.id) ?? [];
      const textMatch = (val: string, q: string) => val.toLowerCase().includes(q);

      if (fromNorm && !toNorm) {
        const matchesHeader =
          textMatch(route.origin, fromNorm) ||
          textMatch(route.name, fromNorm) ||
          textMatch(route.routeCode, fromNorm);
        const matchesStop = orderedStops.some((s) => textMatch(s.stopName, fromNorm));
        return matchesHeader || matchesStop;
      }

      if (!fromNorm && toNorm) {
        const matchesHeader =
          textMatch(route.destination, toNorm) ||
          textMatch(route.name, toNorm) ||
          textMatch(route.routeCode, toNorm);
        const matchesStop = orderedStops.some((s) => textMatch(s.stopName, toNorm));
        return matchesHeader || matchesStop;
      }

      if (orderedStops.length >= 2) {
        const fromIndices = orderedStops
          .map((s, idx) => (textMatch(s.stopName, fromNorm) ? idx : -1))
          .filter((idx) => idx >= 0);
        const toIndices = orderedStops
          .map((s, idx) => (textMatch(s.stopName, toNorm) ? idx : -1))
          .filter((idx) => idx >= 0);

        if (fromIndices.some((fi) => toIndices.some((ti) => fi < ti))) {
          return true;
        }
      }

      return textMatch(route.origin, fromNorm) && textMatch(route.destination, toNorm);
    })
    .sort((a, b) => {
      const rankDiff = priorityRank[a.priority] - priorityRank[b.priority];
      if (rankDiff !== 0) return rankDiff;
      return a.routeCode.localeCompare(b.routeCode);
    });
}

export function getCooldownRemainingSeconds(
  lastSubmitEpochMs: number | null,
  nowEpochMs: number,
  cooldownSeconds = 60,
): number {
  if (!lastSubmitEpochMs || lastSubmitEpochMs <= 0) return 0;
  const elapsedSec = Math.floor((nowEpochMs - lastSubmitEpochMs) / 1000);
  if (elapsedSec >= cooldownSeconds || elapsedSec < 0) return 0;
  return cooldownSeconds - elapsedSec;
}

export function generateComplaintReference(date: Date = new Date()): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GB-${yyyy}${mm}${dd}-${suffix}`;
}
