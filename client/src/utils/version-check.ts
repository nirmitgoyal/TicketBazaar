// Version / cache invalidation runtime
// Polls server build id, purges caches & reloads on mismatch or stale chunk errors.

const BUILD_KEY = '__APP_BUILD_ID__';
const POLL_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
const FAST_RETRY_MS = 30 * 1000;
let currentBuild: string | null = localStorage.getItem(BUILD_KEY);
let polling = false;

function log(...args: any[]) {
  // eslint-disable-next-line no-console
  console.log('[version-check]', ...args);
}

async function forceReload(reason: string) {
  log('Preparing reload:', reason);
  // Create a lightweight banner if not already shown
  let banner = document.getElementById('app-reload-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'app-reload-banner';
    banner.setAttribute('role', 'alert');
    banner.style.cssText = 'position:fixed;inset-inline:0;bottom:0;z-index:2147483647;background:#111827;color:#fff;padding:12px 16px;font:14px/1.4 system-ui,Roboto,sans-serif;display:flex;align-items:center;gap:12px;box-shadow:0 -2px 8px rgba(0,0,0,.3)';
    banner.innerHTML = '<strong style="font-weight:600">Update available</strong><span id="app-reload-msg" style="flex:1;opacity:.9">A new version is ready. Reloading in <span id="app-reload-count">5</span>s…</span><button id="app-reload-now" style="background:#2563eb;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-weight:500">Reload now</button>';
    document.body.appendChild(banner);
    const btn = document.getElementById('app-reload-now');
    btn?.addEventListener('click', () => doReload(reason + ' (manual)'));
  }
  let remaining = 5;
  const elCount = document.getElementById('app-reload-count');
  const timer = setInterval(() => {
    remaining -= 1;
    if (elCount) elCount.textContent = String(remaining);
    if (remaining <= 0) {
      clearInterval(timer);
      doReload(reason + ' (auto)');
    }
  }, 1000);
}

async function doReload(reason: string) {
  log('Reloading now:', reason);
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k).catch(() => {})));
    }
    sessionStorage.clear();
  } catch {}
  const url = new URL(window.location.href);
  url.searchParams.set('v', Date.now().toString());
  window.location.replace(url.toString());
}

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
  const serverBuild = await fetchBuildId();
  if (!serverBuild) {
    // Retry soon if we failed to get version initially
    setTimeout(initialSync, FAST_RETRY_MS);
    return;
  }
  if (!currentBuild) {
    currentBuild = serverBuild;
    localStorage.setItem(BUILD_KEY, serverBuild);
    log('Initialized build id:', serverBuild);
    return;
  }
  if (currentBuild !== serverBuild) {
    await forceReload('initial mismatch ' + currentBuild + ' -> ' + serverBuild);
  }
}

async function pollLoop() {
  if (polling) return;
  polling = true;
  while (true) {
    let serverBuild: string | null = null;
    try {
      serverBuild = await fetchBuildId();
      if (serverBuild && currentBuild && serverBuild !== currentBuild) {
        await forceReload('detected new build ' + serverBuild);
        return;
      }
    } catch {}
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
}

// Global error trap for stale chunk errors
window.addEventListener('error', (e) => {
  const msg = String((e as any)?.message || (e as any)?.error || '');
  if (msg.includes('useQueryClient is not defined') || msg.includes('Loading chunk') || msg.includes('chunk') && msg.includes('failed')) {
    forceReload('stale chunk error');
  }
});

window.addEventListener('unhandledrejection', (e) => {
  const msg = String((e as any)?.reason || '');
  if (msg.includes('Loading chunk') || msg.includes('useQueryClient is not defined')) {
    forceReload('stale chunk rejection');
  }
});

// Kick off
initialSync();
setTimeout(pollLoop, 10_000);
