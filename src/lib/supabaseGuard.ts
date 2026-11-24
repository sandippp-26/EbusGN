export const EXPECTED_PROJECT_REF = 'duktqsyayaieqysmwsqt';
export const EXPECTED_SUPABASE_URL = `https://${EXPECTED_PROJECT_REF}.supabase.co`;
export const EXPECTED_REGION = 'ap-south-1';

export type TablePolicyExpectation = 'public_read_restricted' | 'private_rls_blocked';

export interface ExpectedTableSpec {
  name: string;
  expectation: TablePolicyExpectation;
  purposeKey:
    | 'tableOperators'
    | 'tableRoutes'
    | 'tableStops'
    | 'tableRouteStops'
    | 'tableScheduledDepartures'
    | 'tableDataSources'
    | 'tableVerificationRecords';
}

export const EXISTING_TABLES: readonly ExpectedTableSpec[] = [
  { name: 'operators', expectation: 'public_read_restricted', purposeKey: 'tableOperators' },
  { name: 'routes', expectation: 'public_read_restricted', purposeKey: 'tableRoutes' },
  { name: 'stops', expectation: 'public_read_restricted', purposeKey: 'tableStops' },
  { name: 'route_stops', expectation: 'public_read_restricted', purposeKey: 'tableRouteStops' },
  {
    name: 'scheduled_departures',
    expectation: 'public_read_restricted',
    purposeKey: 'tableScheduledDepartures',
  },
  { name: 'data_sources', expectation: 'public_read_restricted', purposeKey: 'tableDataSources' },
  {
    name: 'verification_records',
    expectation: 'private_rls_blocked',
    purposeKey: 'tableVerificationRecords',
  },
] as const;

export type UrlValidationResult =
  | { valid: true; url: string }
  | {
      valid: false;
      code: 'invalid_url' | 'insecure_protocol' | 'project_ref_mismatch';
      message: string;
    };

export function validateSupabaseUrl(rawUrl?: string | null): UrlValidationResult {
  const candidate = (rawUrl ?? '').trim() || EXPECTED_SUPABASE_URL;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      valid: false,
      code: 'invalid_url',
      message: 'Configured Supabase URL is not a valid URL.',
    };
  }

  if (parsed.protocol !== 'https:') {
    return {
      valid: false,
      code: 'insecure_protocol',
      message: 'Supabase URL must use HTTPS.',
    };
  }

  const normalizedOrigin = parsed.origin;
  if (normalizedOrigin !== EXPECTED_SUPABASE_URL) {
    return {
      valid: false,
      code: 'project_ref_mismatch',
      message: `Supabase URL must point to the existing project (${EXPECTED_PROJECT_REF}).`,
    };
  }

  return { valid: true, url: normalizedOrigin };
}

export type KeyValidationResult =
  | { valid: true; keyType: 'publishable' | 'anon_jwt' }
  | {
      valid: false;
      code:
        | 'missing_key'
        | 'placeholder_key'
        | 'secret_key_rejected'
        | 'service_role_rejected'
        | 'project_ref_mismatch'
        | 'malformed_key';
      message: string;
    };

function decodeBase64UrlToUtf8(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + '='.repeat(padLen);

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf8');
  }
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function validatePublishableKey(rawKey?: string | null): KeyValidationResult {
  const trimmed = (rawKey ?? '').trim();
  if (!trimmed) {
    return {
      valid: false,
      code: 'missing_key',
      message:
        'Supabase Publishable API Key is not configured. Add VITE_SUPABASE_PUBLISHABLE_KEY or SUPABASE_PUBLISHABLE_KEY in AI Studio Secrets.',
    };
  }

  const upper = trimmed.toUpperCase();
  if (
    upper.startsWith('MY_') ||
    upper.startsWith('YOUR_') ||
    upper.includes('PLACEHOLDER') ||
    trimmed.length < 16
  ) {
    return {
      valid: false,
      code: 'placeholder_key',
      message: 'Configured Supabase key appears to be a placeholder or incomplete value.',
    };
  }

  if (trimmed.startsWith('sb_secret_')) {
    return {
      valid: false,
      code: 'secret_key_rejected',
      message:
        'Security guard rejected a Supabase secret key (sb_secret_*). Use only the public Publishable API Key.',
    };
  }

  if (trimmed.startsWith('sb_publishable_')) {
    return { valid: true, keyType: 'publishable' };
  }

  const jwtParts = trimmed.split('.');
  if (jwtParts.length === 3) {
    try {
      const payloadJson = decodeBase64UrlToUtf8(jwtParts[1]);
      const payload = JSON.parse(payloadJson) as Record<string, unknown>;
      const role = typeof payload.role === 'string' ? payload.role : '';
      const ref = typeof payload.ref === 'string' ? payload.ref : '';

      if (role === 'service_role' || role === 'supabase_admin') {
        return {
          valid: false,
          code: 'service_role_rejected',
          message:
            'Security guard rejected a privileged service_role key. Configure only the public anon/publishable key.',
        };
      }

      if (ref && ref !== EXPECTED_PROJECT_REF) {
        return {
          valid: false,
          code: 'project_ref_mismatch',
          message: `Configured key belongs to project "${ref}", expected "${EXPECTED_PROJECT_REF}".`,
        };
      }

      if (role === 'anon' || role === 'authenticated') {
        return { valid: true, keyType: 'anon_jwt' };
      }

      return {
        valid: false,
        code: 'malformed_key',
        message: 'JWT key does not have a valid public anon role.',
      };
    } catch {
      return {
        valid: false,
        code: 'malformed_key',
        message: 'Configured key could not be validated as a valid Supabase publishable or anon key.',
      };
    }
  }

  return {
    valid: false,
    code: 'malformed_key',
    message: 'Unrecognized Supabase key format. Expected a publishable key (sb_publishable_*) or anon JWT.',
  };
}

export type TableInspectionOutcome =
  | 'accessible_with_rows'
  | 'accessible_empty_or_rls_filtered'
  | 'rls_blocked_as_expected'
  | 'unexpected_exposure'
  | 'query_error';

export interface TableInspectionSummary {
  tableName: string;
  expectation: TablePolicyExpectation;
  outcome: TableInspectionOutcome;
  statusCode: number | null;
  rowCount: number | null;
  columns: string[];
  errorMessage: string | null;
}

export function classifyTableInspectionResult(input: {
  tableName: string;
  expectation: TablePolicyExpectation;
  statusCode: number | null;
  rowCount: number | null;
  errorMessage: string | null;
}): TableInspectionOutcome {
  const { expectation, statusCode, rowCount, errorMessage } = input;

  if (expectation === 'private_rls_blocked') {
    if (errorMessage || statusCode === 401 || statusCode === 403) {
      return 'rls_blocked_as_expected';
    }
    if (rowCount === 0 || rowCount === null) {
      return 'rls_blocked_as_expected';
    }
    return 'unexpected_exposure';
  }

  if (errorMessage) {
    return 'query_error';
  }

  if (typeof rowCount === 'number' && rowCount > 0) {
    return 'accessible_with_rows';
  }

  return 'accessible_empty_or_rls_filtered';
}

export type DataVerificationTier =
  | 'verified'
  | 'partially_verified'
  | 'conflicting'
  | 'unverified';

export function normalizeVerificationTier(rawStatus: unknown): DataVerificationTier {
  if (typeof rawStatus !== 'string') {
    return 'unverified';
  }
  const normalized = rawStatus.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized === 'verified' || normalized === 'confirmed') {
    return 'verified';
  }
  if (normalized === 'partially_verified' || normalized === 'partial') {
    return 'partially_verified';
  }
  if (normalized === 'conflicting' || normalized === 'conflict' || normalized === 'disputed') {
    return 'conflicting';
  }
  return 'unverified';
}
