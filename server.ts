import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXPECTED_PROJECT_REF,
  EXPECTED_SUPABASE_URL,
  validatePublishableKey,
  validateSupabaseUrl,
} from './src/lib/supabaseGuard.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      projectRef: EXPECTED_PROJECT_REF,
      expectedUrl: EXPECTED_SUPABASE_URL,
    });
  });

  app.get('/api/public-config', (_req, res) => {
    const rawUrl =
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      EXPECTED_SUPABASE_URL;

    const rawKey =
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      '';

    const urlValidation = validateSupabaseUrl(rawUrl);
    if (!urlValidation.valid) {
      res.json({
        configured: false,
        url: EXPECTED_SUPABASE_URL,
        publishableKey: null,
        errorCode: urlValidation.code,
        errorMessage: urlValidation.message,
      });
      return;
    }

    const keyValidation = validatePublishableKey(rawKey);
    if (!keyValidation.valid) {
      res.json({
        configured: false,
        url: urlValidation.url,
        publishableKey: null,
        errorCode: keyValidation.code,
        errorMessage: keyValidation.message,
      });
      return;
    }

    res.json({
      configured: true,
      url: urlValidation.url,
      publishableKey: rawKey.trim(),
      errorCode: null,
      errorMessage: null,
    });
  });

  const complaintRateMap = new Map<string, number[]>();
  const ALLOWED_ISSUE_TYPES = new Set(['wrong_route', 'wrong_stop', 'wrong_timing', 'other']);

  app.post('/api/complaints', (req, res) => {
    const body = req.body as Record<string, unknown> | undefined;
    const issueType = typeof body?.issueType === 'string' ? body.issueType.trim() : '';
    const routeOrStopName =
      typeof body?.routeOrStopName === 'string' ? body.routeOrStopName.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';

    if (
      !ALLOWED_ISSUE_TYPES.has(issueType) ||
      routeOrStopName.length < 2 ||
      routeOrStopName.length > 120 ||
      description.length < 10 ||
      description.length > 1000
    ) {
      res.status(400).json({ ok: false, error: 'invalid_input' });
      return;
    }

    const clientKey = req.ip || 'unknown';
    const now = Date.now();
    const recent = (complaintRateMap.get(clientKey) ?? []).filter((ts) => now - ts < 600_000);
    const lastTs = recent.length > 0 ? recent[recent.length - 1] : 0;

    if (lastTs && now - lastTs < 60_000) {
      const remaining = Math.ceil((60_000 - (now - lastTs)) / 1000);
      res.status(429).json({ ok: false, cooldownSeconds: remaining, error: 'rate_limited' });
      return;
    }

    if (recent.length >= 5) {
      res.status(429).json({ ok: false, cooldownSeconds: 600, error: 'rate_limited' });
      return;
    }

    recent.push(now);
    complaintRateMap.set(clientKey, recent);

    const datePart = new Date(now).toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const referenceNumber = `GB-${datePart}-${suffix}`;

    res.status(201).json({
      ok: true,
      referenceNumber,
      status: 'pending_admin_review',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`GANDHINAGAR BUS server listening on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err instanceof Error ? err.message : 'Unknown error');
  process.exit(1);
});
