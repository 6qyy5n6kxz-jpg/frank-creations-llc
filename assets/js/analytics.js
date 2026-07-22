const outboundDestinations = [
  { host: "wineandcanvas.com", destination: "wine_and_canvas" },
  { host: "achangeofplansmusic.com", destination: "a_change_of_plans" }
];

export const trackConversion = (eventName, properties = {}) => {
  const detail = { event: eventName, ...properties };

  // Cloudflare Zaraz provides custom, consent-aware events when enabled in the dashboard.
  if (window.zaraz?.track) {
    window.zaraz.track(eventName, properties);
  }

  // This local event keeps tracking testable without sending data to another provider.
  window.dispatchEvent(new CustomEvent("frank:conversion", { detail }));
};

export const initializeConversionTracking = () => {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    if (href.startsWith("mailto:")) {
      trackConversion("email_click", { location: window.location.pathname });
      return;
    }

    if (href.startsWith("tel:")) {
      trackConversion("phone_click", { location: window.location.pathname });
      return;
    }

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    const match = outboundDestinations.find(({ host }) => url.hostname === host || url.hostname.endsWith(`.${host}`));
    if (match) {
      trackConversion("outbound_click", {
        destination: match.destination,
        target_url: url.href,
        location: window.location.pathname
      });
    }
  });
};
