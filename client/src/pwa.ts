const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "::1" ||
  window.location.hostname === "[::1]";

const canRegisterServiceWorker =
  "serviceWorker" in navigator &&
  import.meta.env.PROD &&
  (window.isSecureContext || isLocalhost);

export function registerPWAServiceWorker() {
  if (!canRegisterServiceWorker) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) {
            return;
          }

          installingWorker.addEventListener("statechange", () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              installingWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch((error) => {
        console.warn("TicketBazaar PWA service worker registration failed", error);
      });
  });
}
