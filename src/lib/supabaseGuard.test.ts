import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EXPECTED_PROJECT_REF,
  EXPECTED_SUPABASE_URL,
  EXISTING_TABLES,
  classifyTableInspectionResult,
  normalizeVerificationTier,
  validatePublishableKey,
  validateSupabaseUrl,
} from './supabaseGuard.ts';

function makeUnsignedJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.sig_test_123456`;
}

test('validateSupabaseUrl accepts exact existing project URL and rejects mismatches', () => {
  const defaultRes = validateSupabaseUrl(undefined);
  assert.equal(defaultRes.valid, true);
  if (defaultRes.valid) {
    assert.equal(defaultRes.url, EXPECTED_SUPABASE_URL);
  }

  const mismatchRes = validateSupabaseUrl('https://otherproject.supabase.co');
  assert.equal(mismatchRes.valid, false);
  if (!mismatchRes.valid) {
    assert.equal(mismatchRes.code, 'project_ref_mismatch');
  }

  const httpRes = validateSupabaseUrl(`http://${EXPECTED_PROJECT_REF}.supabase.co`);
  assert.equal(httpRes.valid, false);
  if (!httpRes.valid) {
    assert.equal(httpRes.code, 'insecure_protocol');
  }
});

test('validatePublishableKey blocks secret and service_role keys', () => {
  const missing = validatePublishableKey('');
  assert.equal(missing.valid, false);
  if (!missing.valid) assert.equal(missing.code, 'missing_key');

  const secretKey = validatePublishableKey('sb_secret_1234567890abcdef1234');
  assert.equal(secretKey.valid, false);
  if (!secretKey.valid) assert.equal(secretKey.code, 'secret_key_rejected');

  const serviceJwt = validatePublishableKey(
    makeUnsignedJwt({ role: 'service_role', ref: EXPECTED_PROJECT_REF }),
  );
  assert.equal(serviceJwt.valid, false);
  if (!serviceJwt.valid) assert.equal(serviceJwt.code, 'service_role_rejected');

  const wrongRefJwt = validatePublishableKey(
    makeUnsignedJwt({ role: 'anon', ref: 'differentprojectref' }),
  );
  assert.equal(wrongRefJwt.valid, false);
  if (!wrongRefJwt.valid) assert.equal(wrongRefJwt.code, 'project_ref_mismatch');
});

test('validatePublishableKey accepts valid publishable and anon JWT keys', () => {
  const pub = validatePublishableKey('sb_publishable_valid_example_key_value_12345');
  assert.equal(pub.valid, true);
  if (pub.valid) assert.equal(pub.keyType, 'publishable');

  const anon = validatePublishableKey(
    makeUnsignedJwt({ role: 'anon', ref: EXPECTED_PROJECT_REF }),
  );
  assert.equal(anon.valid, true);
  if (anon.valid) assert.equal(anon.keyType, 'anon_jwt');
});

test('classifyTableInspectionResult enforces RLS rules on verification_records vs public tables', () => {
  assert.equal(EXISTING_TABLES.length, 7);

  assert.equal(
    classifyTableInspectionResult({
      tableName: 'verification_records',
      expectation: 'private_rls_blocked',
      statusCode: 401,
      rowCount: null,
      errorMessage: 'permission denied for table verification_records',
    }),
    'rls_blocked_as_expected',
  );

  assert.equal(
    classifyTableInspectionResult({
      tableName: 'verification_records',
      expectation: 'private_rls_blocked',
      statusCode: 200,
      rowCount: 0,
      errorMessage: null,
    }),
    'rls_blocked_as_expected',
  );

  assert.equal(
    classifyTableInspectionResult({
      tableName: 'verification_records',
      expectation: 'private_rls_blocked',
      statusCode: 200,
      rowCount: 3,
      errorMessage: null,
    }),
    'unexpected_exposure',
  );

  assert.equal(
    classifyTableInspectionResult({
      tableName: 'routes',
      expectation: 'public_read_restricted',
      statusCode: 200,
      rowCount: 12,
      errorMessage: null,
    }),
    'accessible_with_rows',
  );

  assert.equal(
    classifyTableInspectionResult({
      tableName: 'routes',
      expectation: 'public_read_restricted',
      statusCode: 200,
      rowCount: 0,
      errorMessage: null,
    }),
    'accessible_empty_or_rls_filtered',
  );
});

test('normalizeVerificationTier handles all 4 verification tiers safely', () => {
  assert.equal(normalizeVerificationTier('verified'), 'verified');
  assert.equal(normalizeVerificationTier('Partially Verified'), 'partially_verified');
  assert.equal(normalizeVerificationTier('conflicting'), 'conflicting');
  assert.equal(normalizeVerificationTier('unknown'), 'unverified');
  assert.equal(normalizeVerificationTier(null), 'unverified');
});
