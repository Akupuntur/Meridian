// Minimal service worker registration for the "14 Meridian Akupunktur" PWA.
//
// The service worker is located at `${PUBLIC_URL}/service-worker.js`, so it
// works correctly both on the Emergent preview (PUBLIC_URL === "") and under
// the GitHub Pages sub-path `/14-meridian-akupunktur/`.
//
// Only registers in production builds and on secure contexts.

export const registerServiceWorker = () => {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;
  if (!("serviceWorker" in navigator)) return;

  // Register after `load` so it doesn't compete with the initial render.
  window.addEventListener("load", () => {
    const swUrl = `${process.env.PUBLIC_URL || ""}/service-worker.js`;
    navigator.serviceWorker.register(swUrl).catch((err) => {
      // Non-fatal: the site still works fine without a service worker.
      // eslint-disable-next-line no-console
      console.warn("[PWA] Service worker registration failed:", err);
    });
  });
};
