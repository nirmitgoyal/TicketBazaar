// Version / cache invalidation runtime
// Polls server build id, purges caches & reloads on mismatch or stale chunk errors.

const BUILD_KEY = '__APP_BUILD_ID__';
// Auto reload disabled: converted to passive logging only
const POLL_INTERVAL_MS = 3 * 60 * 1000;
const FAST_RETRY_MS = 30 * 1000;
let currentBuild: string | null = null;
let polling = false;

function log(...args: any[]) {
  // eslint-disable-next-line no-console
  console.log('[version-check]', ...args);
}

async function forceReload(reason: string) {
  log('[auto-reload disabled] would reload for reason:', reason);
}
async function doReload(reason: string) { forceReload(reason); }

async function fetchBuildId(): Promise<string | null> {
  try {
    const res = await fetch(`/__version?ts=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.buildId || null;
  } catch {
    return null;
  }
}

async function initialSync() {
  // Passive: skip network build checks
  currentBuild = currentBuild || 'dev-disabled';
}

async function pollLoop() {
  if (polling) return;
  polling = true;
  while (true) {
    let serverBuild: string | null = null;
    try {
  // Poll disabled intentionally
    } catch {}
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
}

// Global error trap for stale chunk errors
window.addEventListener('error', (e) => {
  const msg = String((e as any)?.message || (e as any)?.error || '');
  if (msg.includes('useQueryClient is not defined') || msg.includes('Loading chunk') || msg.includes('chunk') && msg.includes('failed')) {
  log('Suppressed stale chunk error reload:', msg);
  }
});

window.addEventListener('unhandledrejection', (e) => {
  const msg = String((e as any)?.reason || '');
  if (msg.includes('Loading chunk') || msg.includes('useQueryClient is not defined')) {
  log('Suppressed stale chunk rejection reload:', msg);
  }
});

// Kick off
// Disabled auto logic
initialSync();
