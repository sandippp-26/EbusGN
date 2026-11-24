import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  EXPECTED_SUPABASE_URL,
  validatePublishableKey,
  validateSupabaseUrl,
  type KeyValidationResult,
  type UrlValidationResult,
} from './supabaseGuard';

export interface PublicSupabaseConfig {
  configured: boolean;
  url: string;
  publishableKey: string | null;
  source: 'vite_env' | 'server_env' | 'none';
  errorCode: string | null;
  errorMessage: string | null;
}

let cachedClient: SupabaseClient | null = null;
let cachedSignature: string | null = null;

function resolveLocalViteConfig(): PublicSupabaseConfig {
  const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || EXPECTED_SUPABASE_URL;
  const rawKey =
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
    '';

  const urlCheck: UrlValidationResult = validateSupabaseUrl(rawUrl);
  if (!urlCheck.valid) {
    return {
      configured: false,
      url: EXPECTED_SUPABASE_URL,
      publishableKey: null,
      source: 'none',
      errorCode: urlCheck.code,
      errorMessage: urlCheck.message,
    };
  }

  const keyCheck: KeyValidationResult = validatePublishableKey(rawKey);
  if (!keyCheck.valid) {
    return {
      configured: false,
      url: urlCheck.url,
      publishableKey: null,
      source: 'none',
      errorCode: keyCheck.code,
      errorMessage: keyCheck.message,
    };
  }

  return {
    configured: true,
    url: urlCheck.url,
    publishableKey: rawKey.trim(),
    source: 'vite_env',
    errorCode: null,
    errorMessage: null,
  };
}

export async function loadSupabaseConfig(): Promise<PublicSupabaseConfig> {
  const localConfig = resolveLocalViteConfig();
  if (localConfig.configured) {
    return localConfig;
  }

  if (
    localConfig.errorCode === 'secret_key_rejected' ||
    localConfig.errorCode === 'service_role_rejected'
  ) {
    return localConfig;
  }

  try {
    const response = await fetch('/api/public-config', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return localConfig;
    }
    const payload = (await response.json()) as {
      configured?: boolean;
      url?: string;
      publishableKey?: string | null;
      errorCode?: string | null;
      errorMessage?: string | null;
    };

    const urlCheck = validateSupabaseUrl(payload.url);
    if (!urlCheck.valid) {
      return {
        configured: false,
        url: EXPECTED_SUPABASE_URL,
        publishableKey: null,
        source: 'none',
        errorCode: urlCheck.code,
        errorMessage: urlCheck.message,
      };
    }

    if (payload.configured && payload.publishableKey) {
      const keyCheck = validatePublishableKey(payload.publishableKey);
      if (!keyCheck.valid) {
        return {
          configured: false,
          url: urlCheck.url,
          publishableKey: null,
          source: 'none',
          errorCode: keyCheck.code,
          errorMessage: keyCheck.message,
        };
      }

      return {
        configured: true,
        url: urlCheck.url,
        publishableKey: payload.publishableKey.trim(),
        source: 'server_env',
        errorCode: null,
        errorMessage: null,
      };
    }

    return {
      configured: false,
      url: urlCheck.url,
      publishableKey: null,
      source: 'none',
      errorCode: payload.errorCode ?? localConfig.errorCode,
      errorMessage: payload.errorMessage ?? localConfig.errorMessage,
    };
  } catch {
    return localConfig;
  }
}

export async function getSupabaseClient(): Promise<{
  client: SupabaseClient | null;
  config: PublicSupabaseConfig;
}> {
  const config = await loadSupabaseConfig();
  if (!config.configured || !config.publishableKey) {
    cachedClient = null;
    cachedSignature = null;
    return { client: null, config };
  }

  const signature = `${config.url}::${config.publishableKey.slice(0, 12)}`;
  if (!cachedClient || cachedSignature !== signature) {
    cachedClient = createClient(config.url, config.publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    cachedSignature = signature;
  }

  return { client: cachedClient, config };
}
