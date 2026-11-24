import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyOperator,
  filterRoutesByTimeWindow,
  filterStopsForAutocomplete,
  formatTransitTime,
  generateComplaintReference,
  getCooldownRemainingSeconds,
  getRouteScheduleSummary,
  parseTimeToMinutes,
  searchDirectRoutes,
  type ScheduledDeparture,
  type TransitRoute,
  type TransitRouteStop,
  type TransitStop,
} from './transitUtils.ts';
import { PUBLIC_I18N } from './publicI18n.ts';

const SAMPLE_ROUTE: TransitRoute = {
  id: 'r1',
  routeCode: 'GTS-06',
  name: 'Pathikashram → GIFT City',
  origin: 'Pathikashram',
  destination: 'GIFT City',
  direction: 'Outbound',
  operatorId: 'op1',
  operatorName: 'GGTSL Green City',
  priority: 'P0',
  category: 'green_city',
  firstBusTime: null,
  lastBusTime: null,
  lastUpdated: '2026-11-20',
  verificationTier: 'verified',
  dataSourceName: null,
};

const SAMPLE_DEPARTURES: ScheduledDeparture[] = [
  { id: 'd1', routeId: 'r1', departureTime: '07:15:00', direction: 'Outbound', frequencyNote: null, verificationTier: 'verified' },
  { id: 'd2', routeId: 'r1', departureTime: '13:40:00', direction: 'Outbound', frequencyNote: null, verificationTier: 'verified' },
  { id: 'd3', routeId: 'r1', departureTime: '14:20:00', direction: 'Outbound', frequencyNote: null, verificationTier: 'verified' },
  { id: 'd4', routeId: 'r1', departureTime: '15:10:00', direction: 'Outbound', frequencyNote: null, verificationTier: 'verified' },
  { id: 'd5', routeId: 'r1', departureTime: '17:00:00', direction: 'Outbound', frequencyNote: null, verificationTier: 'verified' },
];

test('formatTransitTime formats 12h and 24h cleanly in both Gujarati and English without mixing scripts', () => {
  assert.equal(formatTransitTime('08:30:00', '24h', 'en'), '08:30');
  assert.equal(formatTransitTime('18:45:00', '24h', 'gu'), '18:45');
  assert.equal(formatTransitTime('08:30', '12h', 'en'), '08:30 AM');
  assert.equal(formatTransitTime('18:45', '12h', 'en'), '06:45 PM');
  assert.equal(formatTransitTime('08:30', '12h', 'gu'), 'સવારે 08:30');
  assert.equal(formatTransitTime('18:45', '12h', 'gu'), 'સાંજે 06:45');
  assert.equal(formatTransitTime('25:99', '12h', 'en'), null);
  assert.equal(formatTransitTime(null, '12h', 'gu'), null);
});

test('parseTimeToMinutes and getRouteScheduleSummary compute upcoming departures and time windows accurately', () => {
  assert.equal(parseTimeToMinutes('13:46:00'), 13 * 60 + 46);
  assert.equal(parseTimeToMinutes('invalid'), null);

  // At 13:46 with Next 2 hrs window (13:46 -> 15:46), matches 14:20 and 15:10 (count 2)
  const summary2h = getRouteScheduleSummary({
    route: SAMPLE_ROUTE,
    departures: SAMPLE_DEPARTURES,
    nowMinutes: 13 * 60 + 46,
    timeWindowHours: 2,
  });
  assert.equal(summary2h.hasTimetable, true);
  assert.equal(summary2h.nextDepartureTime, '14:20');
  assert.deepEqual(summary2h.upcomingTimes, ['14:20', '15:10']);
  assert.equal(summary2h.matchingWindowCount, 2);
  assert.equal(summary2h.allPassedToday, false);

  // At 13:46 with Next 4 hrs window (13:46 -> 17:46), matches 14:20, 15:10, 17:00
  const summary4h = getRouteScheduleSummary({
    route: SAMPLE_ROUTE,
    departures: SAMPLE_DEPARTURES,
    nowMinutes: 13 * 60 + 46,
    timeWindowHours: 4,
  });
  assert.equal(summary4h.matchingWindowCount, 3);
  assert.deepEqual(summary4h.upcomingTimes, ['14:20', '15:10', '17:00']);

  // After 17:00 (e.g. 21:00), service completed for today with tomorrow's first bus 07:15
  const summaryLate = getRouteScheduleSummary({
    route: SAMPLE_ROUTE,
    departures: SAMPLE_DEPARTURES,
    nowMinutes: 21 * 60,
    timeWindowHours: 'ALL',
  });
  assert.equal(summaryLate.allPassedToday, true);
  assert.equal(summaryLate.tomorrowFirstBusTime, '07:15');
  assert.equal(summaryLate.nextDepartureTime, null);

  // Window filtering excludes routes with 0 departures in window
  const filteredLate = filterRoutesByTimeWindow({
    routes: [SAMPLE_ROUTE],
    departures: SAMPLE_DEPARTURES,
    nowMinutes: 21 * 60,
    timeWindowHours: 2,
  });
  assert.equal(filteredLate.length, 0);
});

test('filterStopsForAutocomplete matches stop name, area, and landmark', () => {
  const stops: TransitStop[] = [
    { id: 's1', name: 'Sector 16 Bus Stand', area: 'Sector 16', landmark: 'Gh-3 Circle', verificationTier: 'verified' },
    { id: 's2', name: 'GIFT City Gate 1', area: 'GIFT SEZ', landmark: 'Tower A', verificationTier: 'verified' },
    { id: 's3', name: 'Mahatma Mandir', area: 'Sector 13', landmark: 'Convention Center', verificationTier: 'verified' },
  ];

  assert.equal(filterStopsForAutocomplete(stops, '').length, 3);
  assert.deepEqual(
    filterStopsForAutocomplete(stops, 'gh-3').map((s) => s.id),
    ['s1'],
  );
  assert.deepEqual(
    filterStopsForAutocomplete(stops, 'sez').map((s) => s.id),
    ['s2'],
  );
});

test('classifyOperator assigns P0, P1, P2 priorities and service categories accurately', () => {
  assert.deepEqual(classifyOperator('Gandhinagar Green City Bus (GGTSL)', 'PM eBus'), {
    priority: 'P0',
    category: 'green_city',
  });
  assert.deepEqual(classifyOperator('GSRTC', 'Express'), {
    priority: 'P1',
    category: 'gsrtc',
  });
  assert.deepEqual(classifyOperator('AMTS / BRTS', 'City'), {
    priority: 'P1',
    category: 'brts_amts',
  });
  assert.deepEqual(classifyOperator('GIFT Feeder', 'Shuttle'), {
    priority: 'P2',
    category: 'gift_local',
  });
});

test('searchDirectRoutes enforces ordered From -> To matching and priority sorting', () => {
  const routes: TransitRoute[] = [
    {
      ...SAMPLE_ROUTE,
      id: 'r2',
      routeCode: '202',
      name: 'GIFT Loop',
      origin: 'Sector 16',
      destination: 'GIFT City',
      operatorId: 'op2',
      operatorName: 'GIFT Feeder',
      priority: 'P2',
      category: 'gift_local',
      firstBusTime: '08:00',
      lastBusTime: '20:00',
    },
    SAMPLE_ROUTE,
  ];

  const routeStops: TransitRouteStop[] = [
    { id: 'rs1', routeId: 'r1', stopId: 's1', stopOrder: 1, stopName: 'Pathikashram', area: null },
    { id: 'rs2', routeId: 'r1', stopId: 's2', stopOrder: 2, stopName: 'Sector 16', area: null },
    { id: 'rs3', routeId: 'r1', stopId: 's3', stopOrder: 3, stopName: 'GIFT City', area: null },
  ];

  const forward = searchDirectRoutes({
    routes,
    routeStops,
    fromQuery: 'Sector 16',
    toQuery: 'GIFT City',
    priorityFilter: 'ALL',
  });
  assert.deepEqual(
    forward.map((r) => r.id),
    ['r1', 'r2'],
  );

  const reverse = searchDirectRoutes({
    routes,
    routeStops,
    fromQuery: 'GIFT City',
    toQuery: 'Sector 16',
    priorityFilter: 'ALL',
  });
  assert.equal(reverse.length, 0);

  const p0Only = searchDirectRoutes({
    routes,
    routeStops,
    fromQuery: '',
    toQuery: '',
    priorityFilter: 'P0',
  });
  assert.deepEqual(
    p0Only.map((r) => r.id),
    ['r1'],
  );
});

test('complaint cooldown and reference generation work deterministically', () => {
  assert.equal(getCooldownRemainingSeconds(null, 100000, 60), 0);
  assert.equal(getCooldownRemainingSeconds(100000, 125000, 60), 35);
  assert.equal(getCooldownRemainingSeconds(100000, 165000, 60), 0);

  const ref = generateComplaintReference(new Date('2026-11-24T00:00:00Z'));
  assert.match(ref, /^GB-20261124-[A-Z0-9]{4}$/);
});

test('PUBLIC_I18N maintains strict zero-mixing parity between Gujarati and English', () => {
  const guKeys = Object.keys(PUBLIC_I18N.gu).sort();
  const enKeys = Object.keys(PUBLIC_I18N.en).sort();
  assert.deepEqual(guKeys, enKeys);

  for (const key of enKeys) {
    const enVal = PUBLIC_I18N.en[key as keyof typeof PUBLIC_I18N.en];
    const guVal = PUBLIC_I18N.gu[key as keyof typeof PUBLIC_I18N.gu];
    assert.ok(enVal.trim().length > 0, `Empty en value for ${key}`);
    assert.ok(guVal.trim().length > 0, `Empty gu value for ${key}`);
    assert.equal(/[\u0A80-\u0AFF]/.test(enVal), false, `Gujarati chars leaked into en.${key}`);
    assert.equal(/[A-Za-z]/.test(guVal), false, `English letters leaked into gu.${key}`);
  }
});
