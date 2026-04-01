#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://ordenv.org';
const AUTH_BEARER = process.env.SMOKE_BEARER_TOKEN || '';
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 12000);
const ONLY_GROUP = process.env.SMOKE_ONLY_GROUP || ''; // api|admin|dashboard

const manifestPath = path.join('.next', 'server', 'app-paths-manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('Missing .next build artifacts. Run npm run build first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const sample = {
  id: '00000000-0000-0000-0000-000000000000',
  slug: 'sample-slug',
  key: 'sample-key',
  code: '80',
  category: 'support',
  categorySlug: 'pochatkovyi-krok',
  articleSlug: 'yak-staty-chlenom',
  userId: '00000000-0000-0000-0000-000000000000',
};

function toPublicRoute(key) {
  let route = key;
  route = route.replace(/\/(page|route)$/, '');
  route = route.replace(/\/\([^/]+\)/g, '');
  route = route || '/';
  if (!route.startsWith('/')) route = `/${route}`;

  route = route.replace(/\[\[\.\.\.([^\]]+)\]\]/g, (_, p1) => sample[p1] || 'sample');
  route = route.replace(/\[\.\.\.([^\]]+)\]/g, (_, p1) => sample[p1] || 'sample');
  route = route.replace(/\[([^\]]+)\]/g, (_, p1) => sample[p1] || (p1.toLowerCase().includes('slug') ? 'sample-slug' : sample.id));

  return route || '/';
}

function withQuery(route) {
  if (route === '/api/user/search') return `${route}?q=test`;
  if (route === '/api/help/articles/search') return `${route}?q=test`;
  if (route === '/api/help/tooltips/sample-slug') return '/api/help/tooltips/dashboard-home';
  if (route === '/api/resources/sample-slug') return '/api/resources/support';
  if (route === '/api/admin/search') return `${route}?q=test`;
  return route;
}

function groupOf(route) {
  if (route.startsWith('/api')) return 'api';
  if (route.startsWith('/admin')) return 'admin';
  if (route.startsWith('/dashboard')) return 'dashboard';
  return 'other';
}

async function hit(route) {
  const fullRoute = withQuery(route);
  const url = `${BASE_URL}${fullRoute}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = Date.now();

  try {
    const headers = { 'User-Agent': 'ordenv-smoke/1.0' };
    if (AUTH_BEARER) headers.Authorization = `Bearer ${AUTH_BEARER}`;

    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers,
    });

    let body = '';
    try {
      body = await res.text();
    } catch {
      body = '';
    }

    return {
      route,
      requestPath: fullRoute,
      status: res.status,
      ms: Date.now() - started,
      bodySnippet: body.replace(/\s+/g, ' ').trim().slice(0, 220),
    };
  } catch (error) {
    return {
      route,
      requestPath: fullRoute,
      status: 0,
      ms: Date.now() - started,
      error: error?.name === 'AbortError' ? 'timeout' : String(error?.message || error),
      bodySnippet: '',
    };
  } finally {
    clearTimeout(timeout);
  }
}

const allRoutes = [...new Set(Object.keys(manifest).map(toPublicRoute))]
  .filter((r) => r.startsWith('/api') || r.startsWith('/admin') || r.startsWith('/dashboard'))
  .filter((r) => (ONLY_GROUP ? groupOf(r) === ONLY_GROUP : true));

const results = [];
for (const route of allRoutes) {
  results.push(await hit(route));
}

function counts(arr) {
  return arr.reduce((acc, r) => {
    const key = String(r.status);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function fmt(obj) {
  return Object.entries(obj)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([k, v]) => `${k}=${v}`)
    .join(' ');
}

const grouped = {
  api: results.filter((r) => groupOf(r.route) === 'api'),
  admin: results.filter((r) => groupOf(r.route) === 'admin'),
  dashboard: results.filter((r) => groupOf(r.route) === 'dashboard'),
};

const hardFailures = results.filter((r) => r.status >= 500 || r.status === 0);

console.log('SMOKE SUMMARY');
for (const [name, arr] of Object.entries(grouped)) {
  if (!arr.length) continue;
  console.log(`${name}: total=${arr.length} ${fmt(counts(arr))}`);
}
console.log(`overall: total=${results.length} ${fmt(counts(results))}`);
console.log(`hard_failures(>=500|timeout)=${hardFailures.length}`);

if (hardFailures.length) {
  console.log('FAIL LIST');
  for (const f of hardFailures) {
    console.log(`${f.status} ${f.requestPath} ${f.error ? `(${f.error})` : ''} ${f.bodySnippet}`.trim());
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  withAuth: Boolean(AUTH_BEARER),
  onlyGroup: ONLY_GROUP || null,
  total: results.length,
  hardFailureCount: hardFailures.length,
  results,
};

const outFile = process.env.SMOKE_OUTPUT_FILE || 'tmp_smoke_results.json';
fs.writeFileSync(outFile, JSON.stringify(output, null, 2));
console.log(`saved ${outFile}`);

process.exit(hardFailures.length ? 2 : 0);
