import { getSupabaseClient } from './supabase';
import { normalizeVerificationTier } from './supabaseGuard';
import {
  classifyOperator,
  generateComplaintReference,
  type AppLanguage,
  type IssueType,
  type ScheduledDeparture,
  type TransitDataSource,
  type TransitOperator,
  type TransitRoute,
  type TransitRouteStop,
  type TransitStop,
} from './transitUtils';

export interface TransitDataset {
  connectionReady: boolean;
  hasAnyVerifiedData: boolean;
  operators: TransitOperator[];
  routes: TransitRoute[];
  stops: TransitStop[];
  routeStops: TransitRouteStop[];
  departures: ScheduledDeparture[];
  dataSources: TransitDataSource[];
  errorMessage: string | null;
}

function pickStr(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const val = row[key];
    if (typeof val === 'string' && val.trim().length > 0) {
      return val.trim();
    }
  }
  return null;
}

function pickNum(row: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const val = row[key];
    if (typeof val === 'number' && Number.isFinite(val)) {
      return val;
    }
    if (typeof val === 'string' && val.trim().length > 0) {
      const parsed = Number(val);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function pickId(row: Record<string, unknown>, fallback: string): string {
  const raw = row.id ?? row.uuid ?? row.code;
  if (typeof raw === 'string' || typeof raw === 'number') {
    return String(raw);
  }
  return fallback;
}

function localizedNameKeys(lang: AppLanguage, baseKeys: string[]): string[] {
  if (lang === 'gu') {
    return [
      ...baseKeys.map((k) => `${k}_gu`),
      ...baseKeys,
      ...baseKeys.map((k) => `${k}_en`),
    ];
  }
  return [
    ...baseKeys.map((k) => `${k}_en`),
    ...baseKeys,
    ...baseKeys.map((k) => `${k}_gu`),
  ];
}

function resolveVerificationTier(row: Record<string, unknown>) {
  const rawStatus =
    row.verification_status ??
    row.status ??
    (row.is_verified === true ? 'verified' : row.is_verified === false ? 'unverified' : null);
  return normalizeVerificationTier(rawStatus);
}

export async function fetchPublicTransitData(lang: AppLanguage): Promise<TransitDataset> {
  const { client, config } = await getSupabaseClient();

  if (!client || !config.configured) {
    return {
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
  }

  try {
    // Query ONLY the 6 permitted public tables; NEVER query verification_records.
    const [opRes, routesRes, stopsRes, routeStopsRes, depRes, sourcesRes] = await Promise.all([
      client.from('operators').select('*').limit(200),
      client.from('routes').select('*').limit(500),
      client.from('stops').select('*').limit(1000),
      client.from('route_stops').select('*').limit(2500),
      client.from('scheduled_departures').select('*').limit(2500),
      client.from('data_sources').select('*').limit(100),
    ]);

    const rawOperators = Array.isArray(opRes.data) ? (opRes.data as Record<string, unknown>[]) : [];
    const rawRoutes = Array.isArray(routesRes.data) ? (routesRes.data as Record<string, unknown>[]) : [];
    const rawStops = Array.isArray(stopsRes.data) ? (stopsRes.data as Record<string, unknown>[]) : [];
    const rawRouteStops = Array.isArray(routeStopsRes.data)
      ? (routeStopsRes.data as Record<string, unknown>[])
      : [];
    const rawDepartures = Array.isArray(depRes.data) ? (depRes.data as Record<string, unknown>[]) : [];
    const rawSources = Array.isArray(sourcesRes.data)
      ? (sourcesRes.data as Record<string, unknown>[])
      : [];

    const dataSources: TransitDataSource[] = rawSources.map((row, idx) => ({
      id: pickId(row, `src-${idx}`),
      name:
        pickStr(row, localizedNameKeys(lang, ['name', 'title', 'source_name'])) ??
        'Public Transit Record',
      sourceType: pickStr(row, ['source_type', 'type', 'category']),
      referenceUrl: pickStr(row, ['url', 'source_url', 'reference_url']),
    }));
    const sourceById = new Map(dataSources.map((s) => [s.id, s]));

    const operators: TransitOperator[] = rawOperators.map((row, idx) => {
      const name =
        pickStr(row, localizedNameKeys(lang, ['name', 'operator_name'])) ??
        pickStr(row, ['short_name', 'code']) ??
        '';
      const shortName = pickStr(row, ['short_name', 'code']) ?? name;
      const serviceType = pickStr(row, ['service_type', 'type', 'category']) ?? '';
      const classification = classifyOperator(name, serviceType);

      return {
        id: pickId(row, `op-${idx}`),
        name,
        shortName,
        serviceType,
        priority: classification.priority,
        category: classification.category,
      };
    });
    const operatorById = new Map(operators.map((op) => [op.id, op]));

    const stops: TransitStop[] = rawStops
      .map((row, idx) => ({
        id: pickId(row, `stop-${idx}`),
        name:
          pickStr(row, localizedNameKeys(lang, ['name', 'stop_name', 'title'])) ?? '',
        area: pickStr(row, localizedNameKeys(lang, ['area', 'sector', 'locality'])),
        landmark: pickStr(row, localizedNameKeys(lang, ['landmark', 'description'])),
        verificationTier: resolveVerificationTier(row),
      }))
      .filter((s) => s.name.length > 0 && s.verificationTier !== 'unverified');
    const stopById = new Map(stops.map((s) => [s.id, s]));

    const routeStops: TransitRouteStop[] = rawRouteStops
      .map((row, idx) => {
        const routeId = String(row.route_id ?? '');
        const stopId = String(row.stop_id ?? '');
        const linkedStop = stopById.get(stopId);
        const stopName =
          linkedStop?.name ??
          pickStr(row, localizedNameKeys(lang, ['stop_name', 'name'])) ??
          '';
        return {
          id: pickId(row, `rs-${idx}`),
          routeId,
          stopId,
          stopOrder: pickNum(row, ['stop_order', 'sequence_number', 'stop_sequence', 'order_index']) ?? idx + 1,
          stopName,
          area: linkedStop?.area ?? null,
        };
      })
      .filter((rs) => rs.routeId.length > 0 && rs.stopName.length > 0)
      .sort((a, b) => a.stopOrder - b.stopOrder);

    const departures: ScheduledDeparture[] = rawDepartures
      .map((row, idx) => ({
        id: pickId(row, `dep-${idx}`),
        routeId: String(row.route_id ?? row.route ?? ''),
        departureTime:
          pickStr(row, [
            'departure_time',
            'scheduled_time',
            'time',
            'dep_time',
            'start_time',
          ]) ?? '',
        direction: pickStr(row, localizedNameKeys(lang, ['direction', 'trip_direction'])),
        frequencyNote: pickStr(
          row,
          localizedNameKeys(lang, ['frequency_note', 'notes', 'days_of_operation']),
        ),
        verificationTier: resolveVerificationTier(row),
      }))
      .filter(
        (d) =>
          d.routeId.length > 0 &&
          d.departureTime.length > 0 &&
          d.verificationTier !== 'unverified',
      );

    const routes: TransitRoute[] = rawRoutes
      .map((row, idx) => {
        const operatorId = row.operator_id ? String(row.operator_id) : null;
        const linkedOperator = operatorId ? operatorById.get(operatorId) : undefined;
        const operatorName =
          linkedOperator?.name ??
          pickStr(row, localizedNameKeys(lang, ['operator_name'])) ??
          '';
        const serviceType =
          linkedOperator?.serviceType ?? pickStr(row, ['service_type', 'bus_type']) ?? '';
        const classification = classifyOperator(operatorName, serviceType);
        const dataSourceId = row.data_source_id ? String(row.data_source_id) : null;

        const verificationTier = resolveVerificationTier(row);
        const routeCode =
          pickStr(row, ['route_code', 'code', 'route_number', 'number']) ?? '';
        const origin =
          pickStr(row, localizedNameKeys(lang, ['origin', 'origin_name', 'start_stop', 'from_stop'])) ??
          '';
        const destination =
          pickStr(
            row,
            localizedNameKeys(lang, ['destination', 'destination_name', 'end_stop', 'to_stop']),
          ) ?? '';
        const name =
          pickStr(row, localizedNameKeys(lang, ['name', 'route_name'])) ??
          (origin && destination ? `${origin} → ${destination}` : routeCode);

        return {
          id: pickId(row, `route-${idx}`),
          routeCode,
          name,
          origin,
          destination,
          direction: pickStr(row, localizedNameKeys(lang, ['direction', 'route_direction'])),
          operatorId,
          operatorName,
          priority: linkedOperator?.priority ?? classification.priority,
          category: linkedOperator?.category ?? classification.category,
          firstBusTime: pickStr(row, ['first_bus_time', 'first_departure', 'start_time']),
          lastBusTime: pickStr(row, ['last_bus_time', 'last_departure', 'end_time']),
          lastUpdated: pickStr(row, ['last_updated', 'updated_at', 'verified_at']),
          verificationTier,
          dataSourceName: dataSourceId ? (sourceById.get(dataSourceId)?.name ?? null) : null,
        };
      })
      .filter((r) => r.verificationTier !== 'unverified' && (r.routeCode.length > 0 || r.name.length > 0));

    return {
      connectionReady: true,
      hasAnyVerifiedData: routes.length > 0 || stops.length > 0,
      operators,
      routes,
      stops,
      routeStops,
      departures,
      dataSources,
      errorMessage: null,
    };
  } catch (err) {
    return {
      connectionReady: false,
      hasAnyVerifiedData: false,
      operators: [],
      routes: [],
      stops: [],
      routeStops: [],
      departures: [],
      dataSources: [],
      errorMessage: err instanceof Error ? err.message : 'Database read failed',
    };
  }
}

export interface ComplaintSubmissionPayload {
  issueType: IssueType;
  routeOrStopName: string;
  description: string;
  lang: AppLanguage;
}

export interface ComplaintSubmissionResult {
  ok: boolean;
  referenceNumber?: string;
  cooldownSeconds?: number;
  error?: string;
}

export async function submitPublicComplaint(
  payload: ComplaintSubmissionPayload,
): Promise<ComplaintSubmissionResult> {
  try {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as {
      ok?: boolean;
      referenceNumber?: string;
      cooldownSeconds?: number;
      error?: string;
    };

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        cooldownSeconds: data.cooldownSeconds,
        error: data.error ?? 'Submission failed',
      };
    }

    return {
      ok: true,
      referenceNumber: data.referenceNumber ?? generateComplaintReference(),
    };
  } catch {
    return { ok: false, error: 'Network error' };
  }
}
