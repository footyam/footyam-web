export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}