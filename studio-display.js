function normalizeBasePath(path) {
  if (!path || path === "/") {
    return "";
  }

  return `/${String(path).replace(/^\/+|\/+$/g, "")}`;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getPath(source, path) {
  return String(path)
    .split(".")
    .reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), source);
}

function getFirstPath(source, paths) {
  for (const path of paths) {
    const value = getPath(source, path);
    if (value !== undefined && value !== null && !(typeof value === "string" && value.trim() === "")) {
      return value;
    }
  }

  return undefined;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function decodeHtml(value) {
  if (!isNonEmptyString(value)) {
    return "";
  }

  const node = document.createElement("textarea");
  node.innerHTML = value;
  return node.value.trim();
}

function stripHtml(value) {
  if (!isNonEmptyString(value)) {
    return "";
  }

  const node = document.createElement("div");
  node.innerHTML = value;
  return (node.textContent || node.innerText || "").replace(/\s+/g, " ").trim();
}

function encodeSvg(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s{2,}/g, " ").trim())}`;
}

function hashString(value) {
  return Array.from(String(value)).reduce((hash, character) => {
    const next = ((hash << 5) - hash) + character.charCodeAt(0);
    return next & next;
  }, 0);
}

function firstUsable(...values) {
  for (const value of values) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === "string" && value.trim() === "") {
      continue;
    }

    return value;
  }

  return undefined;
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["1", "true", "yes", "y", "on", "active", "published", "sold out"].includes(normalized);
  }

  return false;
}

function normalizeToId(value) {
  return String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function truncateText(value, maxLength) {
  if (!isNonEmptyString(value) || value.length <= maxLength) {
    return value || "";
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function normalizeUrl(value) {
  if (!isNonEmptyString(value)) {
    return "";
  }

  try {
    return new URL(value, window.location.href).toString();
  } catch (error) {
    return "";
  }
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (isPlainObject(item)) {
          return firstUsable(item.label, item.title, item.text, item.value, item.name);
        }

        return "";
      })
      .map((item) => stripHtml(String(item)))
      .filter(Boolean);
  }

  if (isNonEmptyString(value)) {
    return value
      .split(/[\n,|]+/)
      .map((item) => stripHtml(item))
      .filter(Boolean);
  }

  return [];
}

function uniqueStrings(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

function extractRenderedText(value) {
  if (typeof value === "string") {
    return decodeHtml(value);
  }

  if (isPlainObject(value)) {
    return decodeHtml(firstUsable(value.rendered, value.raw, value.text, value.title, value.label, value.name) || "");
  }

  return "";
}

function normalizeDateKey(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const matched = value.match(/\d{4}-\d{2}-\d{2}/);
    if (matched) {
      return matched[0];
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return normalizeDateKey(new Date());
}

function formatDate(dateString, options = {}) {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
    ...options
  }).format(date);
}

function formatShortDate(dateString) {
  return formatDate(dateString, { year: undefined });
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatPriceDisplay(value) {
  return Number.isFinite(value) ? formatPrice(value) : "See site";
}

function formatFreshness(updatedAt) {
  if (!updatedAt) {
    return "Waiting for data";
  }

  const diffMinutes = Math.round((Date.now() - updatedAt.getTime()) / 60000);
  if (diffMinutes <= 0) {
    return "Updated just now";
  }

  if (diffMinutes === 1) {
    return "Updated 1 minute ago";
  }

  if (diffMinutes < 60) {
    return `Updated ${diffMinutes} minutes ago`;
  }

  return `Updated ${new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(updatedAt)}`;
}

function parseDateValue(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTimeValue(value) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit"
    }).format(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{1,2}:\d{2}\s*(?:AM|PM)$/i.test(trimmed)) {
      return trimmed.toUpperCase();
    }

    if (/^\d{1,2}:\d{2}:\d{2}$/.test(trimmed)) {
      const [hoursValue, minutesValue] = trimmed.split(":");
      const hours = Number(hoursValue);
      const minutes = Number(minutesValue);
      if (Number.isFinite(hours) && Number.isFinite(minutes)) {
        const period = hours >= 12 ? "PM" : "AM";
        const twelveHour = hours % 12 || 12;
        return `${twelveHour}:${String(minutes).padStart(2, "0")} ${period}`;
      }
    }

    const parsed = parseDateValue(trimmed);
    if (parsed) {
      return formatTimeValue(parsed);
    }

    return trimmed;
  }

  return "";
}

function formatTimeRange(startValue, endValue) {
  const start = formatTimeValue(startValue);
  const end = formatTimeValue(endValue);

  if (start && end && start !== end) {
    return `${start} - ${end}`;
  }

  return start || end || "See site";
}

function createPosterAsset({ title, subtitle, tag, palette }) {
  const colorSets = {
    meadow: ["#fff4ea", "#ffc85a", "#eb6f59", "#2c7f80", "#5a9f66"],
    dateNight: ["#fff1f6", "#9b2759", "#f0a43d", "#2c6a7b", "#f7cf75"],
    glass: ["#f3fbff", "#4bb4cf", "#ffd77d", "#ffffff", "#2b4955"],
    sunset: ["#fff4eb", "#f28a58", "#ffc964", "#734fa0", "#2c6773"],
    plum: ["#fff3f4", "#6d1f42", "#ee9b4d", "#f7cc74", "#274f66"],
    kids: ["#fffdf3", "#2fb7d5", "#ffd454", "#f17155", "#86c65f"]
  };

  const [base, accent, pop, deep, soft] = colorSets[palette] || colorSets.meadow;
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const safeTag = escapeXml(tag);

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1000" role="img" aria-label="${safeTitle}">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${base}" />
          <stop offset="55%" stop-color="${soft}" />
          <stop offset="100%" stop-color="${pop}" />
        </linearGradient>
        <linearGradient id="swash" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="${deep}" stop-opacity="0.92" />
        </linearGradient>
      </defs>
      <rect width="1400" height="1000" rx="44" fill="url(#bg)"/>
      <circle cx="1180" cy="180" r="160" fill="${accent}" fill-opacity="0.18"/>
      <circle cx="260" cy="810" r="180" fill="${deep}" fill-opacity="0.12"/>
      <path d="M210 160 C 440 80 520 340 740 250 C 915 175 1000 50 1220 155" fill="none" stroke="url(#swash)" stroke-width="44" stroke-linecap="round" opacity="0.9"/>
      <path d="M240 720 C 430 585 620 760 820 670 C 980 595 1080 640 1200 760" fill="none" stroke="${pop}" stroke-width="48" stroke-linecap="round" opacity="0.65"/>
      <rect x="86" y="84" width="196" height="52" rx="26" fill="rgba(255,255,255,0.78)"/>
      <text x="184" y="118" text-anchor="middle" font-size="26" font-family="Arial, sans-serif" font-weight="700" fill="${deep}">${safeTag}</text>
      <rect x="86" y="566" width="760" height="270" rx="32" fill="rgba(255,255,255,0.62)"/>
      <text x="132" y="652" font-size="74" font-family="Georgia, serif" font-weight="700" fill="${deep}">${safeTitle}</text>
      <text x="132" y="736" font-size="36" font-family="Arial, sans-serif" font-weight="600" fill="${accent}">${safeSubtitle}</text>
      <rect x="930" y="390" width="320" height="230" rx="32" fill="rgba(255,255,255,0.76)"/>
      <circle cx="1090" cy="505" r="88" fill="${accent}" fill-opacity="0.24"/>
      <path d="M1042 470 c24 -25 84 -25 108 0 c-8 35 -23 59 -54 92 c-31 -33 -45 -57 -54 -92" fill="none" stroke="${deep}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M1060 536 h60" stroke="${deep}" stroke-width="18" stroke-linecap="round"/>
      <path d="M1075 553 h30" stroke="${deep}" stroke-width="18" stroke-linecap="round"/>
    </svg>
  `);
}

function createQrPlaceholder({ label, accent }) {
  const size = 25;
  const cell = 18;
  const margin = 32;
  const seed = Math.abs(hashString(label));
  let squares = "";

  const finder = (x, y) => `
    <rect x="${x}" y="${y}" width="${cell * 7}" height="${cell * 7}" rx="8" fill="#111111"/>
    <rect x="${x + cell}" y="${y + cell}" width="${cell * 5}" height="${cell * 5}" rx="5" fill="#ffffff"/>
    <rect x="${x + cell * 2}" y="${y + cell * 2}" width="${cell * 3}" height="${cell * 3}" rx="4" fill="#111111"/>
  `;

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const inTopLeft = row < 7 && column < 7;
      const inTopRight = row < 7 && column > 17;
      const inBottomLeft = row > 17 && column < 7;
      if (inTopLeft || inTopRight || inBottomLeft) {
        continue;
      }

      const bit = ((row * size) + column + seed) % 3 === 0 || ((row + seed) ^ (column * 7)) % 5 === 0;
      if (bit) {
        squares += `<rect x="${margin + (column * cell)}" y="${margin + (row * cell)}" width="${cell}" height="${cell}" rx="3" fill="#111111"/>`;
      }
    }
  }

  const safeLabel = escapeXml(label);
  const safeAccent = escapeXml(accent);
  const boardSize = margin * 2 + size * cell;

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${boardSize} ${boardSize + 92}" role="img" aria-label="${safeLabel}">
      <rect width="${boardSize}" height="${boardSize + 92}" rx="38" fill="#ffffff"/>
      <rect x="0" y="0" width="${boardSize}" height="${boardSize}" rx="38" fill="#ffffff"/>
      ${finder(margin, margin)}
      ${finder(margin + cell * 18, margin)}
      ${finder(margin, margin + cell * 18)}
      ${squares}
      <rect x="${boardSize / 2 - 64}" y="${boardSize / 2 - 64}" width="128" height="128" rx="32" fill="${safeAccent}"/>
      <text x="${boardSize / 2}" y="${boardSize / 2 + 14}" text-anchor="middle" font-size="34" font-family="Arial, sans-serif" font-weight="800" fill="#ffffff">SCAN</text>
      <text x="${boardSize / 2}" y="${boardSize + 56}" text-anchor="middle" font-size="34" font-family="Arial, sans-serif" font-weight="700" fill="#111111">${safeLabel}</text>
    </svg>
  `);
}

const CONFIG = {
  rotationIntervalMs: 7500,
  dataRefreshMs: 5 * 60 * 1000,
  clockRefreshMs: 30 * 1000,
  fetchTimeoutMs: 4500,
  eventLimit: 6,
  artLimit: 3,
  promoLimit: 4
};

const RUNTIME_CONFIG = window.STUDIO_DISPLAY_CONFIG || {};

const WORDPRESS_CONFIG = {
  // Integration point:
  // Change `wpBasePath` if WordPress is not mounted at `/toledo`.
  wpBasePath: normalizeBasePath(RUNTIME_CONFIG.wpBasePath || "/toledo"),
  bookingUrl: RUNTIME_CONFIG.bookingUrl || "https://wineandcanvas.com/toledo/",
  privatePartyUrl: RUNTIME_CONFIG.privatePartyUrl || "https://wineandcanvas.com/toledo/parties/",
  artShopUrl: RUNTIME_CONFIG.artShopUrl || "https://frankcreationsllc.com/shop/"
};

const state = {
  data: null,
  rotationSequence: [],
  rotationIndex: 0,
  rotationTimer: null,
  refreshTimer: null,
  clockTimer: null,
  lastUpdatedAt: null,
  reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  imageFallbackBound: false
};

const elements = {
  clock: document.querySelector("[data-clock]"),
  dateLine: document.querySelector("[data-date-line]"),
  freshness: document.querySelector("[data-freshness]"),
  dataMode: document.querySelector("[data-data-mode]"),
  stageLabel: document.querySelector("[data-stage-label]"),
  stageCount: document.querySelector("[data-stage-count]"),
  stageContent: document.querySelector("[data-stage-content]"),
  stageDots: document.querySelector("[data-stage-dots]"),
  stageProgress: document.querySelector("[data-stage-progress]"),
  primaryQr: document.querySelector("[data-primary-qr]"),
  secondaryCtas: document.querySelector("[data-secondary-ctas]"),
  reassuranceList: document.querySelector("[data-reassurance-list]"),
  railNote: document.querySelector("[data-rail-note]"),
  tickerTrack: document.querySelector("[data-ticker-track]")
};

function buildWpUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${WORDPRESS_CONFIG.wpBasePath}${normalizedPath}`, window.location.origin).toString();
}

function resolveQrLinks(overrides = {}) {
  return {
    booking: normalizeUrl(firstUsable(overrides.booking, overrides.book)) || WORDPRESS_CONFIG.bookingUrl,
    privateParty: normalizeUrl(firstUsable(overrides.privateParty, overrides.party)) || WORDPRESS_CONFIG.privatePartyUrl,
    artShop: normalizeUrl(firstUsable(overrides.artShop, overrides.shop)) || WORDPRESS_CONFIG.artShopUrl
  };
}

function buildFallbackEvent(data) {
  const fallbackImage = createPosterAsset({
    title: data.posterTitle || data.title,
    subtitle: data.posterSubtitle || data.availabilityText,
    tag: data.posterTag || data.badge || "Now Booking",
    palette: data.posterPalette || "meadow"
  });

  return {
    ...data,
    image: fallbackImage,
    fallbackImage
  };
}

function buildFallbackArt(data) {
  const fallbackImage = createPosterAsset({
    title: data.posterTitle || data.title,
    subtitle: data.posterSubtitle || "Local pickup duplicate painting",
    tag: data.posterTag || "Pickup Ready",
    palette: data.posterPalette || "plum"
  });

  return {
    ...data,
    image: fallbackImage,
    fallbackImage
  };
}

function buildFallbackPromo(data) {
  const fallbackImage = createPosterAsset({
    title: data.posterTitle || data.title,
    subtitle: data.posterSubtitle || data.eyebrow,
    tag: data.posterTag || "Studio Promo",
    palette: data.posterPalette || (data.theme === "sun" ? "kids" : "dateNight")
  });

  return {
    ...data,
    image: fallbackImage,
    fallbackImage
  };
}

function buildFallbackStudioDisplayData() {
  const qrLinks = resolveQrLinks();

  return {
    studio: {
      name: "Wine & Canvas Toledo",
      railNote: "Beginner-friendly public classes, private parties, and local pickup art all share one easy next step: scan, save your seat, and come back soon."
    },
    qrLinks,
    reassurancePoints: [
      "Beginner-friendly",
      "BYOB-friendly where applicable",
      "No experience needed",
      "Great for date nights and groups"
    ],
    tickerItems: [
      "Date Nights",
      "Private Parties",
      "Girls' Night Out",
      "Team Events",
      "Cookies & Canvas",
      "No Experience Needed",
      "BYOB Fun",
      "Wine Glass Painting",
      "Local Pickup Art"
    ],
    upcomingEvents: [
      buildFallbackEvent({
        id: "wildflower-wine-night",
        title: "Wildflower Wine Night",
        date: "2026-04-24",
        time: "6:30 PM",
        price: 39,
        availabilityText: "Few easels left for Friday night",
        status: "few-seats",
        badge: "Few Seats",
        ctaLabel: "Scan to Book",
        ctaUrl: qrLinks.booking,
        posterSubtitle: "Floral paint-and-sip favorite",
        posterTag: "Now Booking",
        posterPalette: "meadow"
      }),
      buildFallbackEvent({
        id: "moonlit-bloom-date-night",
        title: "Moonlit Bloom Date Night",
        date: "2026-04-30",
        time: "7:00 PM",
        price: 45,
        availabilityText: "Great for pairs, pals, and a very fun second date",
        status: "now-booking",
        badge: "Now Booking",
        ctaLabel: "Scan to Book",
        ctaUrl: qrLinks.booking,
        posterTitle: "Moonlit Bloom",
        posterSubtitle: "Better than dinner. Way more fun.",
        posterTag: "Date Night",
        posterPalette: "dateNight"
      }),
      buildFallbackEvent({
        id: "garden-glass-party",
        title: "Garden Glass Painting",
        date: "2026-05-02",
        time: "2:00 PM",
        price: 34,
        availabilityText: "Sold out. Join the waitlist for the next pour-friendly round.",
        status: "sold-out",
        badge: "Sold Out",
        ctaLabel: "Join Waitlist",
        ctaUrl: qrLinks.booking,
        posterTitle: "Garden Glass Party",
        posterSubtitle: "Wine glass painting with spring color",
        posterTag: "Popular Pick",
        posterPalette: "glass"
      }),
      buildFallbackEvent({
        id: "lake-erie-sunset",
        title: "Lake Erie Sunset Canvas",
        date: "2026-05-07",
        time: "6:30 PM",
        price: 39,
        availabilityText: "Open seats and a very forgiving sky blend",
        status: "now-booking",
        badge: "Now Booking",
        ctaLabel: "Scan to Book",
        ctaUrl: qrLinks.booking,
        posterTitle: "Lake Erie Sunset",
        posterSubtitle: "Beginner-friendly shoreline glow",
        posterTag: "Public Class",
        posterPalette: "sunset"
      }),
      buildFallbackEvent({
        id: "porch-blooms-board-art",
        title: "Porch Blooms Board Art",
        date: "2026-05-10",
        time: "1:00 PM",
        price: 46,
        availabilityText: "Fresh board-art twist for repeat painters",
        status: "now-booking",
        badge: "Now Booking",
        ctaLabel: "Scan to Book",
        ctaUrl: qrLinks.booking,
        posterTitle: "Porch Blooms",
        posterSubtitle: "Paint-and-sip meets take-home porch charm",
        posterTag: "Board Art",
        posterPalette: "plum"
      })
    ],
    featuredArt: [
      buildFallbackArt({
        id: "midnight-bloom",
        title: "Midnight Bloom",
        price: 48,
        description: "Duplicate studio painting with moody florals and rich plum detail. Local pickup only, so the drive home is the only shipping step.",
        ctaLabel: "Scan to Claim It",
        ctaUrl: qrLinks.artShop,
        posterTitle: "Midnight Bloom",
        posterSubtitle: "Local pickup duplicate painting",
        posterTag: "Pickup Ready",
        posterPalette: "plum"
      }),
      buildFallbackArt({
        id: "sunset-terrace",
        title: "Sunset Terrace",
        price: 52,
        description: "Warm patio skies, cheerful texture, and instant date-night souvenir energy.",
        ctaLabel: "Scan to Claim It",
        ctaUrl: qrLinks.artShop,
        posterTitle: "Sunset Terrace",
        posterSubtitle: "Finished and ready for a Toledo wall",
        posterTag: "Featured Art",
        posterPalette: "sunset"
      }),
      buildFallbackArt({
        id: "meadow-mason-jar",
        title: "Meadow Mason Jar",
        price: 42,
        description: "Soft florals, bright stems, and a cheerful beginner-favorite palette.",
        ctaLabel: "Scan to Claim It",
        ctaUrl: qrLinks.artShop,
        posterTitle: "Meadow Mason Jar",
        posterSubtitle: "Love it? Take it home.",
        posterTag: "Duplicate Painting",
        posterPalette: "meadow"
      })
    ],
    promos: [
      buildFallbackPromo({
        id: "private-party",
        type: "promo",
        theme: "plum",
        eyebrow: "Private Parties + Date Nights",
        title: "Better than dinner. Way more fun.",
        body: "Birthdays, bridal showers, team outings, fundraisers, and date nights all get the same easy formula: guided painting, lots of laughs, and zero pressure to be the artsy friend.",
        quote: "Bring the group. We’ll bring the brushes, the setup, and the 'wait, I actually love mine' moment.",
        chips: ["Birthdays", "Bridal Showers", "Team Events", "Date Nights"],
        ctaLabel: "Scan to Plan Your Party",
        ctaUrl: qrLinks.privateParty,
        stats: [
          { value: "10-20", label: "Studio private guests" },
          { value: "We travel", label: "Mobile party option" },
          { value: "All supplies", label: "Included" }
        ],
        posterTitle: "Plan the Party",
        posterSubtitle: "Warm, easy, and built for groups",
        posterTag: "Private Events",
        posterPalette: "dateNight"
      }),
      buildFallbackPromo({
        id: "cookies-canvas",
        type: "promo",
        theme: "sun",
        eyebrow: "Cookies & Canvas",
        title: "Tiny artists. Big fridge-worthy energy.",
        body: "Kid-friendly sessions keep things cheerful, guided, and very parent-approved. Think birthdays, school-break outings, scout troops, and creative afternoons with a little extra cookie-powered confidence.",
        quote: "No experience? Perfect. Messy fun and proud smiles are both very on-brand here.",
        chips: ["Kids Birthdays", "Family Outings", "School Break Fun", "Scout Groups"],
        ctaLabel: "Scan for Kids Events",
        ctaUrl: qrLinks.booking,
        stats: [
          { value: "Kid-friendly", label: "Low-pressure format" },
          { value: "Bright themes", label: "Cheerful projects" },
          { value: "Easy yes", label: "Beginner approved" }
        ],
        posterTitle: "Cookies & Canvas",
        posterSubtitle: "Playful, colorful, and family-friendly",
        posterTag: "Kids Promo",
        posterPalette: "kids"
      })
    ],
    actionRail: {
      primary: {
        title: "Book Your Next Class",
        copy: "Public classes, date nights, wine glass painting, and beginner-friendly favorites all live behind this main code.",
        note: "Primary QR points to the live booking calendar.",
        url: qrLinks.booking,
        qrLabel: "Book Classes"
      },
      secondary: [
        {
          title: "Buy Featured Art",
          copy: "Claim duplicate paintings for local pickup before someone else says, 'Wait, I need that one.'",
          note: "Featured art / shop page",
          url: qrLinks.artShop,
          qrLabel: "Featured Art"
        },
        {
          title: "Plan a Private Party",
          copy: "Birthdays, showers, team nights, and paint-first date nights start here.",
          note: "Private party inquiry page",
          url: qrLinks.privateParty,
          qrLabel: "Private Party"
        }
      ]
    },
    rotationModules: [],
    meta: {
      mode: "backup",
      statusLabel: "Using backup content",
      detail: "Using the local backup dataset until WordPress responds."
    }
  };
}

function cloneDisplayData(data) {
  return JSON.parse(JSON.stringify(data));
}

function mergeDisplayData(baseData, overrideData = {}) {
  return {
    ...cloneDisplayData(baseData),
    ...cloneDisplayData(overrideData),
    studio: {
      ...(baseData.studio || {}),
      ...(overrideData.studio || {})
    },
    qrLinks: {
      ...(baseData.qrLinks || {}),
      ...(overrideData.qrLinks || {})
    },
    actionRail: {
      ...(baseData.actionRail || {}),
      ...(overrideData.actionRail || {}),
      primary: {
        ...(baseData.actionRail?.primary || {}),
        ...(overrideData.actionRail?.primary || {})
      },
      secondary: Array.isArray(overrideData.actionRail?.secondary)
        ? cloneDisplayData(overrideData.actionRail.secondary)
        : cloneDisplayData(baseData.actionRail?.secondary || [])
    },
    reassurancePoints: Array.isArray(overrideData.reassurancePoints)
      ? cloneDisplayData(overrideData.reassurancePoints)
      : cloneDisplayData(baseData.reassurancePoints || []),
    tickerItems: Array.isArray(overrideData.tickerItems)
      ? cloneDisplayData(overrideData.tickerItems)
      : cloneDisplayData(baseData.tickerItems || []),
    upcomingEvents: Array.isArray(overrideData.upcomingEvents)
      ? cloneDisplayData(overrideData.upcomingEvents)
      : cloneDisplayData(baseData.upcomingEvents || []),
    featuredArt: Array.isArray(overrideData.featuredArt)
      ? cloneDisplayData(overrideData.featuredArt)
      : cloneDisplayData(baseData.featuredArt || []),
    promos: Array.isArray(overrideData.promos)
      ? cloneDisplayData(overrideData.promos)
      : cloneDisplayData(baseData.promos || []),
    rotationModules: Array.isArray(overrideData.rotationModules)
      ? cloneDisplayData(overrideData.rotationModules)
      : cloneDisplayData(baseData.rotationModules || []),
    meta: {
      ...(baseData.meta || {}),
      ...(overrideData.meta || {})
    }
  };
}

function buildEndpointGroups() {
  const todayKey = getTodayKey();

  return {
    events: [
      // Assumed primary feed for The Events Calendar or similar event plugin.
      { label: "tribe-events", url: buildWpUrl(`/wp-json/tribe/events/v1/events?per_page=${CONFIG.eventLimit}&start_date=${todayKey}`) },
      // Common custom post type routes exposed through the WP REST API.
      { label: "wp-v2-tribe-events", url: buildWpUrl(`/wp-json/wp/v2/tribe_events?per_page=${CONFIG.eventLimit}&_embed`) },
      { label: "wp-v2-events", url: buildWpUrl(`/wp-json/wp/v2/events?per_page=${CONFIG.eventLimit}&_embed`) },
      { label: "wp-v2-event", url: buildWpUrl(`/wp-json/wp/v2/event?per_page=${CONFIG.eventLimit}&_embed`) }
    ],
    art: [
      // WooCommerce Store API is the most common zero-auth product feed.
      { label: "wc-store-featured", url: buildWpUrl(`/wp-json/wc/store/products?per_page=${CONFIG.artLimit}&featured=true`) },
      { label: "wc-store-products", url: buildWpUrl(`/wp-json/wc/store/products?per_page=${CONFIG.artLimit}`) },
      // Backup guesses for product-like custom post types.
      { label: "wp-v2-product", url: buildWpUrl(`/wp-json/wp/v2/product?per_page=${CONFIG.artLimit}&_embed`) },
      { label: "wp-v2-products", url: buildWpUrl(`/wp-json/wp/v2/products?per_page=${CONFIG.artLimit}&_embed`) }
    ],
    settings: [
      // ACF options endpoints are the likeliest place for QR URLs, ticker copy, and overrides.
      { label: "acf-studio-display", url: buildWpUrl("/wp-json/acf/v3/options/studio-display") },
      { label: "acf-options", url: buildWpUrl("/wp-json/acf/v3/options/options") },
      // Optional page-based settings if a dedicated config page is used instead of ACF options.
      { label: "wp-page-studio-display-settings", url: buildWpUrl("/wp-json/wp/v2/pages?slug=studio-display-settings&_embed") },
      { label: "wp-page-studio-display", url: buildWpUrl("/wp-json/wp/v2/pages?slug=studio-display&_embed") }
    ],
    promos: [
      { label: "wp-v2-studio-promo", url: buildWpUrl(`/wp-json/wp/v2/studio-promo?per_page=${CONFIG.promoLimit}&_embed`) },
      { label: "wp-v2-promos", url: buildWpUrl(`/wp-json/wp/v2/promos?per_page=${CONFIG.promoLimit}&_embed`) },
      { label: "wp-v2-promo", url: buildWpUrl(`/wp-json/wp/v2/promo?per_page=${CONFIG.promoLimit}&_embed`) }
    ]
  };
}

async function fetchJsonWithTimeout(url, timeoutMs = CONFIG.fetchTimeoutMs) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      credentials: "same-origin",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payloadText = await response.text();
    return payloadText ? JSON.parse(payloadText) : null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function fetchFromCandidates(candidates, label) {
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const payload = await fetchJsonWithTimeout(candidate.url);
      return {
        payload,
        url: candidate.url,
        label: candidate.label
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`${label} unavailable${lastError ? ` (${lastError.message})` : ""}`);
}

function extractCollection(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.events)) {
    return payload.events;
  }

  if (Array.isArray(payload?.products)) {
    return payload.products;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function extractPriceFromSource(raw) {
  if (isPlainObject(raw?.prices) && isNonEmptyString(raw.prices.price)) {
    const minorUnit = toNumber(raw.prices.currency_minor_unit) ?? 2;
    const price = Number(raw.prices.price) / (10 ** minorUnit);
    return Number.isFinite(price) ? price : null;
  }

  const directValue = getFirstPath(raw, [
    "cost",
    "price",
    "acf.price",
    "acf.cost",
    "meta._EventCost",
    "ticket_price",
    "regular_price"
  ]);

  return toNumber(directValue);
}

function resolveImageUrl(raw) {
  return normalizeUrl(firstUsable(
    getFirstPath(raw, ["image.url", "image.full.url", "image.sizes.full.url", "image.src"]),
    getFirstPath(raw, ["featured_image", "featured_image_url", "jetpack_featured_media_url"]),
    getFirstPath(raw, ["acf.image.url", "acf.featured_image.url", "acf.hero_image.url"]),
    getFirstPath(raw, ["_embedded.wp:featuredmedia.0.source_url"]),
    getFirstPath(raw, ["yoast_head_json.og_image.0.url"]),
    getFirstPath(raw, ["images.0.src"]),
    typeof raw?.image === "string" ? raw.image : ""
  ));
}

function buildEventTimeLabel(raw, dateSource) {
  const explicitTime = firstUsable(
    getFirstPath(raw, ["time", "start_time", "acf.start_time", "meta.start_time"]),
    getFirstPath(raw, ["start_date_details.time", "start_date_details.value"])
  );

  const explicitEndTime = firstUsable(
    getFirstPath(raw, ["end_time", "acf.end_time", "meta.end_time"]),
    getFirstPath(raw, ["end_date_details.time", "end_date_details.value"])
  );

  if (explicitTime || explicitEndTime) {
    return formatTimeRange(explicitTime, explicitEndTime);
  }

  const startDate = parseDateValue(firstUsable(dateSource, getFirstPath(raw, ["start_date", "date"])));
  const endDate = parseDateValue(firstUsable(getFirstPath(raw, ["end_date", "end"]), dateSource));

  if (startDate || endDate) {
    return formatTimeRange(startDate, endDate);
  }

  return "See site";
}

function buildAvailabilityText(raw) {
  const explicitText = stripHtml(extractRenderedText(firstUsable(
    getFirstPath(raw, ["availability_text", "availability", "tickets_left_text", "stock_status_text"]),
    getFirstPath(raw, ["acf.availability", "acf.availability_text"])
  )));

  const seatsLeft = toNumber(firstUsable(
    getFirstPath(raw, ["tickets_left", "available_tickets", "stock_quantity", "inventory.remaining"]),
    getFirstPath(raw, ["acf.tickets_left", "acf.available_seats"])
  ));

  const stockStatus = String(firstUsable(
    getFirstPath(raw, ["stock_status", "status", "event_status"]),
    getFirstPath(raw, ["acf.status"])
  ) || "").toLowerCase();

  const textHaystack = `${explicitText} ${stockStatus}`.toLowerCase();
  if (parseBoolean(getFirstPath(raw, ["sold_out", "is_sold_out"])) || textHaystack.includes("sold out") || textHaystack.includes("unavailable")) {
    return explicitText || "Sold out for now";
  }

  if (Number.isFinite(seatsLeft)) {
    if (seatsLeft <= 0) {
      return "Sold out for now";
    }

    if (seatsLeft <= 6) {
      return `${seatsLeft} seats left`;
    }

    return `${seatsLeft} seats left`;
  }

  return explicitText || "Now booking";
}

function buildEventStatus(raw, availabilityText) {
  const seatsLeft = toNumber(firstUsable(
    getFirstPath(raw, ["tickets_left", "available_tickets", "stock_quantity", "inventory.remaining"]),
    getFirstPath(raw, ["acf.tickets_left", "acf.available_seats"])
  ));

  const haystack = `${availabilityText} ${firstUsable(getFirstPath(raw, ["stock_status", "status"]), "")}`.toLowerCase();
  if (parseBoolean(getFirstPath(raw, ["sold_out", "is_sold_out"])) || haystack.includes("sold out")) {
    return "sold-out";
  }

  if (Number.isFinite(seatsLeft) && seatsLeft <= 6) {
    return "few-seats";
  }

  if (
    haystack.includes("few seats")
    || /\b[1-6]\s+(?:seats|spots|tickets)\s+left\b/.test(haystack)
  ) {
    return "few-seats";
  }

  return "now-booking";
}

function inferEventPalette(title) {
  const haystack = title.toLowerCase();
  if (haystack.includes("glass")) {
    return "glass";
  }

  if (haystack.includes("date")) {
    return "dateNight";
  }

  if (haystack.includes("sunset") || haystack.includes("lake")) {
    return "sunset";
  }

  if (haystack.includes("board")) {
    return "plum";
  }

  if (haystack.includes("cookie") || haystack.includes("kid")) {
    return "kids";
  }

  return "meadow";
}

function normalizeEventItem(raw, defaultUrl) {
  const title = firstUsable(
    extractRenderedText(raw?.title),
    stripHtml(firstUsable(raw?.name, raw?.post_title, raw?.event_title))
  );
  const dateSource = firstUsable(
    getFirstPath(raw, ["start_date", "EventStartDate", "meta._EventStartDate", "acf.event_date"]),
    getFirstPath(raw, ["date", "date_gmt"])
  );
  const date = normalizeDateKey(dateSource);

  if (!title || !date) {
    return null;
  }

  const availabilityText = buildAvailabilityText(raw);
  const status = buildEventStatus(raw, availabilityText);
  const badge = status === "sold-out"
    ? "Sold Out"
    : status === "few-seats"
      ? "Few Seats"
      : "Now Booking";
  const fallbackImage = createPosterAsset({
    title,
    subtitle: availabilityText,
    tag: badge,
    palette: inferEventPalette(title)
  });

  return {
    id: normalizeToId(firstUsable(raw?.slug, raw?.id, title)),
    title,
    date,
    time: buildEventTimeLabel(raw, dateSource),
    price: extractPriceFromSource(raw),
    availabilityText,
    status,
    badge,
    ctaLabel: status === "sold-out" ? "Join Waitlist" : "Scan to Book",
    ctaUrl: normalizeUrl(firstUsable(
      getFirstPath(raw, ["website", "url", "link", "permalink"]),
      getFirstPath(raw, ["acf.ticket_url", "acf.cta_url", "tickets_url", "ticket_url"])
    )) || defaultUrl,
    image: resolveImageUrl(raw) || fallbackImage,
    fallbackImage,
    description: truncateText(stripHtml(extractRenderedText(firstUsable(
      raw?.excerpt,
      raw?.summary,
      raw?.description,
      raw?.content
    ))), 190),
    venue: stripHtml(extractRenderedText(firstUsable(
      getFirstPath(raw, ["venue.venue", "venue.title", "venue.name", "location", "event_location"]),
      getFirstPath(raw, ["acf.venue_name", "acf.location"])
    )))
  };
}

function isPublicEvent(event) {
  const haystack = `${event.title} ${event.description} ${event.venue}`.toLowerCase();
  return !haystack.includes("private");
}

function compareEvents(left, right) {
  if (left.date !== right.date) {
    return left.date.localeCompare(right.date);
  }

  const score = (event) => {
    const haystack = `${event.title} ${event.venue}`.toLowerCase();
    let total = 0;
    if (haystack.includes("toledo")) {
      total += 3;
    }
    if (haystack.includes("wine & canvas") || haystack.includes("studio")) {
      total += 2;
    }
    if (haystack.includes("date night") || haystack.includes("wine glass")) {
      total += 1;
    }
    return total;
  };

  return score(right) - score(left);
}

function normalizeEventCollection(payload, defaultUrl) {
  return extractCollection(payload)
    .map((item) => normalizeEventItem(item, defaultUrl))
    .filter(Boolean)
    .filter((event) => event.date >= getTodayKey())
    .filter(isPublicEvent)
    .sort(compareEvents)
    .slice(0, CONFIG.eventLimit);
}

function buildArtAvailability(raw) {
  const stockStatus = String(firstUsable(
    getFirstPath(raw, ["stock_status", "status"]),
    getFirstPath(raw, ["acf.pickup_status", "acf.availability"])
  ) || "").toLowerCase();

  if (stockStatus.includes("outofstock") || stockStatus.includes("sold")) {
    return "Claimed";
  }

  const explicit = stripHtml(extractRenderedText(firstUsable(
    getFirstPath(raw, ["acf.pickup_availability", "acf.pickup_note", "availability_text"]),
    getFirstPath(raw, ["pickup_availability", "pickup_note"])
  )));

  return explicit || "Local pickup available";
}

function looksLikeArtProduct(raw, normalized) {
  const categoryNames = extractCollection(raw?.categories || raw?.product_categories || [])
    .map((category) => `${category.slug || ""} ${category.name || ""}`.toLowerCase())
    .join(" ");
  const haystack = `${normalized.title} ${normalized.description} ${categoryNames}`.toLowerCase();

  if (haystack.includes("gift certificate") || haystack.includes("egift") || haystack.includes("private party")) {
    return false;
  }

  if (haystack.includes("duplicate") || haystack.includes("pickup") || haystack.includes("painting") || haystack.includes("canvas art")) {
    return true;
  }

  return /\bart\b|\bpaint\b|\bcanvas\b/.test(haystack);
}

function normalizeArtItem(raw, defaultUrl) {
  const title = firstUsable(
    extractRenderedText(raw?.title),
    stripHtml(firstUsable(raw?.name, raw?.post_title))
  );

  if (!title) {
    return null;
  }

  const description = truncateText(stripHtml(extractRenderedText(firstUsable(
    raw?.short_description,
    raw?.description,
    raw?.excerpt,
    raw?.content,
    getFirstPath(raw, ["acf.short_description", "acf.description"])
  ))), 180);

  const pickupAvailability = buildArtAvailability(raw);
  const fallbackImage = createPosterAsset({
    title,
    subtitle: pickupAvailability,
    tag: "Pickup Ready",
    palette: title.toLowerCase().includes("sunset") ? "sunset" : "plum"
  });

  const normalized = {
    id: normalizeToId(firstUsable(raw?.slug, raw?.id, title)),
    title,
    price: extractPriceFromSource(raw),
    description: description || "Finished painting available for local pickup.",
    ctaLabel: "Scan to Claim It",
    ctaUrl: normalizeUrl(firstUsable(
      raw?.permalink,
      raw?.link,
      raw?.url,
      getFirstPath(raw, ["acf.claim_url", "acf.purchase_url"])
    )) || defaultUrl,
    image: resolveImageUrl(raw) || fallbackImage,
    fallbackImage,
    pickupAvailability
  };

  return looksLikeArtProduct(raw, normalized) ? normalized : null;
}

function normalizeArtCollection(payload, defaultUrl) {
  return extractCollection(payload)
    .map((item) => normalizeArtItem(item, defaultUrl))
    .filter(Boolean)
    .filter((item) => item.pickupAvailability !== "Claimed")
    .slice(0, CONFIG.artLimit);
}

function buildDefaultPromoStats(theme) {
  if (theme === "sun") {
    return [
      { value: "Kid-friendly", label: "Low-pressure format" },
      { value: "Bright themes", label: "Cheerful projects" },
      { value: "Easy yes", label: "Beginner approved" }
    ];
  }

  return [
    { value: "10-20", label: "Studio private guests" },
    { value: "We travel", label: "Mobile party option" },
    { value: "All supplies", label: "Included" }
  ];
}

function normalizeStatsList(value, theme) {
  const list = Array.isArray(value) ? value : [];
  const stats = list
    .map((item) => {
      if (isPlainObject(item)) {
        const statValue = stripHtml(firstUsable(item.value, item.stat, item.number, item.title));
        const statLabel = stripHtml(firstUsable(item.label, item.caption, item.text, item.description));
        return statValue && statLabel ? { value: statValue, label: statLabel } : null;
      }

      return null;
    })
    .filter(Boolean);

  return stats.length ? stats : buildDefaultPromoStats(theme);
}

function inferPromoTheme(rawTitle, rawBody) {
  const haystack = `${rawTitle} ${rawBody}`.toLowerCase();
  return haystack.includes("kid") || haystack.includes("cookie") ? "sun" : "plum";
}

function inferPromoUrl(theme, qrLinks) {
  return theme === "sun" ? qrLinks.booking : qrLinks.privateParty;
}

function inferPromoLabel(theme, title) {
  if (theme === "sun") {
    return "Scan for Kids Events";
  }

  if (title.toLowerCase().includes("date")) {
    return "Scan to Book Date Night";
  }

  return "Scan to Plan Your Party";
}

function normalizePromoItem(raw, qrLinks, index = 0) {
  const source = raw?.acf ? { ...raw, ...raw.acf } : raw;
  const title = firstUsable(
    extractRenderedText(source?.title),
    stripHtml(firstUsable(source?.promo_title, source?.name, source?.headline))
  );

  if (!title) {
    return null;
  }

  const body = truncateText(stripHtml(extractRenderedText(firstUsable(
    source?.body,
    source?.promo_body,
    source?.description,
    source?.content,
    source?.excerpt
  ))), 260);

  const eyebrow = stripHtml(firstUsable(
    source?.eyebrow,
    source?.promo_eyebrow,
    source?.subtitle,
    source?.category
  )) || "Studio Promo";
  const theme = firstUsable(source?.theme, source?.color_theme) || inferPromoTheme(title, body);
  const chips = uniqueStrings(normalizeStringList(firstUsable(source?.chips, source?.promo_tags, source?.services)).slice(0, 4));
  const ctaUrl = normalizeUrl(firstUsable(
    source?.cta_url,
    source?.url,
    source?.link,
    source?.permalink
  )) || inferPromoUrl(theme, qrLinks);
  const ctaLabel = stripHtml(firstUsable(source?.cta_label, source?.button_label)) || inferPromoLabel(theme, title);
  const quote = truncateText(stripHtml(extractRenderedText(firstUsable(
    source?.quote,
    source?.pull_quote,
    source?.promo_quote
  ))), 160);
  const fallbackImage = createPosterAsset({
    title,
    subtitle: eyebrow,
    tag: theme === "sun" ? "Kids Promo" : "Studio Promo",
    palette: theme === "sun" ? "kids" : "dateNight"
  });

  if (parseBoolean(firstUsable(source?.active, source?.enabled)) === false) {
    return null;
  }

  return {
    id: normalizeToId(firstUsable(source?.slug, source?.id, title)),
    type: "promo",
    theme: theme === "sun" ? "sun" : "plum",
    eyebrow,
    title,
    body: body || "Creative, welcoming, and built for groups that want an easy yes.",
    quote: quote || (theme === "sun"
      ? "No experience? Perfect. Proud smiles count as success here."
      : "Bring the group. We’ll bring the brushes, the setup, and the easy fun."),
    chips: chips.length ? chips : (theme === "sun"
      ? ["Kids Birthdays", "Family Outings", "School Break Fun"]
      : ["Birthdays", "Bridal Showers", "Team Events"]),
    ctaLabel,
    ctaUrl,
    stats: normalizeStatsList(firstUsable(source?.stats, source?.promo_stats), theme),
    image: resolveImageUrl(source) || fallbackImage,
    fallbackImage,
    priority: toNumber(firstUsable(source?.display_priority, source?.priority, source?.menu_order)) ?? index + 1
  };
}

function normalizePromoCollection(payload, qrLinks) {
  const collection = Array.isArray(payload) ? payload : extractCollection(payload);

  return collection
    .map((item, index) => normalizePromoItem(item, qrLinks, index))
    .filter(Boolean)
    .sort((left, right) => left.priority - right.priority)
    .slice(0, CONFIG.promoLimit);
}

function normalizeActionRailSettings(source) {
  const primary = {
    title: stripHtml(firstUsable(source?.primary_cta_title, source?.action_rail_primary_title)),
    copy: stripHtml(firstUsable(source?.primary_cta_copy, source?.action_rail_primary_copy)),
    note: stripHtml(firstUsable(source?.primary_cta_note, source?.action_rail_primary_note)),
    url: normalizeUrl(firstUsable(source?.primary_cta_url, source?.action_rail_primary_url)),
    qrLabel: stripHtml(firstUsable(source?.primary_qr_label, source?.action_rail_primary_qr_label))
  };

  const secondarySource = Array.isArray(firstUsable(source?.secondary_ctas, source?.action_rail_secondary))
    ? firstUsable(source?.secondary_ctas, source?.action_rail_secondary)
    : [];

  const secondary = secondarySource
    .map((item) => ({
      title: stripHtml(firstUsable(item?.title, item?.cta_title)),
      copy: stripHtml(firstUsable(item?.copy, item?.body, item?.description)),
      note: stripHtml(firstUsable(item?.note, item?.eyebrow)),
      url: normalizeUrl(firstUsable(item?.url, item?.cta_url)),
      qrLabel: stripHtml(firstUsable(item?.qr_label, item?.label))
    }))
    .filter((item) => item.title);

  const hasPrimary = Object.values(primary).some(Boolean);
  return hasPrimary || secondary.length
    ? {
        primary: hasPrimary ? primary : undefined,
        secondary
      }
    : null;
}

function normalizeRotationModuleCollection(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const type = firstUsable(item?.type, item?.module_type);
      const promoId = firstUsable(item?.promoId, item?.promo_id);
      if (!type) {
        return null;
      }

      if (parseBoolean(firstUsable(item?.active, item?.enabled)) === false) {
        return null;
      }

      return {
        id: normalizeToId(firstUsable(item?.id, `${type}-${promoId || item?.label || "module"}`)),
        label: stripHtml(firstUsable(item?.label, item?.title, "Studio Module")),
        type,
        promoId: promoId ? normalizeToId(promoId) : undefined,
        weight: toNumber(firstUsable(item?.weight, item?.priority)) || 1,
        theme: stripHtml(firstUsable(item?.theme, item?.color_theme))
      };
    })
    .filter(Boolean);
}

function normalizeSettingsPayload(payload) {
  const raw = Array.isArray(payload) ? payload[0] : payload;
  const source = raw?.acf ? { ...raw, ...raw.acf } : raw;

  if (!source) {
    return null;
  }

  const qrLinks = {
    booking: normalizeUrl(firstUsable(
      source?.booking_url,
      source?.book_url,
      getFirstPath(source, ["qr_links.booking", "qr_links.booking_url"])
    )),
    privateParty: normalizeUrl(firstUsable(
      source?.private_party_url,
      source?.party_url,
      getFirstPath(source, ["qr_links.private_party", "qr_links.private_party_url"])
    )),
    artShop: normalizeUrl(firstUsable(
      source?.featured_art_url,
      source?.art_shop_url,
      source?.shop_url,
      getFirstPath(source, ["qr_links.art_shop", "qr_links.featured_art"])
    ))
  };

  const settings = {
    studioName: stripHtml(firstUsable(source?.studio_name, source?.display_name)),
    railNote: stripHtml(firstUsable(source?.rail_note, source?.studio_note, source?.action_rail_note)),
    reassurancePoints: normalizeStringList(firstUsable(source?.reassurance_points, source?.why_guests_say_yes)),
    tickerItems: normalizeStringList(firstUsable(source?.ticker_items, source?.studio_ticker, source?.value_props)),
    qrLinks,
    actionRail: normalizeActionRailSettings(source),
    promos: normalizePromoCollection(firstUsable(source?.promos, source?.studio_promos), resolveQrLinks(qrLinks)),
    rotationModules: normalizeRotationModuleCollection(firstUsable(source?.rotation_modules, source?.display_modules))
  };

  const hasContent = Boolean(
    settings.studioName ||
    settings.railNote ||
    settings.reassurancePoints.length ||
    settings.tickerItems.length ||
    settings.promos.length ||
    settings.rotationModules.length ||
    settings.actionRail ||
    settings.qrLinks.booking ||
    settings.qrLinks.privateParty ||
    settings.qrLinks.artShop
  );

  return hasContent ? settings : null;
}

async function fetchLiveEvents() {
  try {
    const endpoints = buildEndpointGroups().events;
    const response = await fetchFromCandidates(endpoints, "events");
    return {
      ok: true,
      items: normalizeEventCollection(response.payload, WORDPRESS_CONFIG.bookingUrl),
      sourceUrl: response.url
    };
  } catch (error) {
    console.warn(`[studio-display] Live events unavailable. ${error.message}`);
    return {
      ok: false,
      error
    };
  }
}

async function fetchLiveArt() {
  try {
    const endpoints = buildEndpointGroups().art;
    const response = await fetchFromCandidates(endpoints, "featured art");
    return {
      ok: true,
      items: normalizeArtCollection(response.payload, WORDPRESS_CONFIG.artShopUrl),
      sourceUrl: response.url
    };
  } catch (error) {
    console.warn(`[studio-display] Featured art feed unavailable. ${error.message}`);
    return {
      ok: false,
      error
    };
  }
}

async function fetchLiveSettings() {
  try {
    const endpoints = buildEndpointGroups().settings;
    const response = await fetchFromCandidates(endpoints, "studio settings");
    const settings = normalizeSettingsPayload(response.payload);

    if (!settings) {
      return {
        ok: false,
        error: new Error("No usable settings fields")
      };
    }

    return {
      ok: true,
      settings,
      sourceUrl: response.url
    };
  } catch (error) {
    console.warn(`[studio-display] Studio settings unavailable. ${error.message}`);
    return {
      ok: false,
      error
    };
  }
}

async function fetchLivePromos(qrLinks) {
  try {
    const endpoints = buildEndpointGroups().promos;
    const response = await fetchFromCandidates(endpoints, "studio promos");
    return {
      ok: true,
      items: normalizePromoCollection(response.payload, qrLinks),
      sourceUrl: response.url
    };
  } catch (error) {
    console.warn(`[studio-display] Studio promo feed unavailable. ${error.message}`);
    return {
      ok: false,
      error
    };
  }
}

function ensureEventShape(event, qrLinks) {
  const title = stripHtml(firstUsable(event?.title, "Paint & Sip Favorite"));
  const date = normalizeDateKey(firstUsable(event?.date, getTodayKey())) || getTodayKey();
  const status = ["few-seats", "sold-out", "now-booking"].includes(event?.status) ? event.status : "now-booking";
  const badge = stripHtml(firstUsable(
    event?.badge,
    status === "sold-out" ? "Sold Out" : status === "few-seats" ? "Few Seats" : "Now Booking"
  ));
  const fallbackImage = event?.fallbackImage || createPosterAsset({
    title,
    subtitle: stripHtml(firstUsable(event?.availabilityText, "Now booking")),
    tag: badge,
    palette: inferEventPalette(title)
  });

  return {
    id: normalizeToId(firstUsable(event?.id, title)),
    title,
    date,
    time: stripHtml(firstUsable(event?.time, "See site")),
    price: Number.isFinite(event?.price) ? event.price : null,
    availabilityText: stripHtml(firstUsable(event?.availabilityText, "Now booking")),
    status,
    badge,
    ctaLabel: stripHtml(firstUsable(event?.ctaLabel, status === "sold-out" ? "Join Waitlist" : "Scan to Book")),
    ctaUrl: normalizeUrl(firstUsable(event?.ctaUrl, qrLinks.booking)) || qrLinks.booking,
    image: normalizeUrl(event?.image) || event?.image || fallbackImage,
    fallbackImage,
    description: stripHtml(firstUsable(event?.description, "")),
    venue: stripHtml(firstUsable(event?.venue, ""))
  };
}

function ensureArtShape(item, qrLinks) {
  const title = stripHtml(firstUsable(item?.title, "Featured Painting"));
  const fallbackImage = item?.fallbackImage || createPosterAsset({
    title,
    subtitle: stripHtml(firstUsable(item?.pickupAvailability, "Local pickup available")),
    tag: "Pickup Ready",
    palette: title.toLowerCase().includes("sunset") ? "sunset" : "plum"
  });

  return {
    id: normalizeToId(firstUsable(item?.id, title)),
    title,
    price: Number.isFinite(item?.price) ? item.price : null,
    description: stripHtml(firstUsable(item?.description, "Finished art available for local pickup.")),
    ctaLabel: stripHtml(firstUsable(item?.ctaLabel, "Scan to Claim It")),
    ctaUrl: normalizeUrl(firstUsable(item?.ctaUrl, qrLinks.artShop)) || qrLinks.artShop,
    image: normalizeUrl(item?.image) || item?.image || fallbackImage,
    fallbackImage,
    pickupAvailability: stripHtml(firstUsable(item?.pickupAvailability, "Local pickup available"))
  };
}

function ensurePromoShape(item, qrLinks) {
  const title = stripHtml(firstUsable(item?.title, "Studio Promo"));
  const theme = item?.theme === "sun" ? "sun" : "plum";
  const fallbackImage = item?.fallbackImage || createPosterAsset({
    title,
    subtitle: stripHtml(firstUsable(item?.eyebrow, "Studio Promo")),
    tag: theme === "sun" ? "Kids Promo" : "Private Events",
    palette: theme === "sun" ? "kids" : "dateNight"
  });

  return {
    id: normalizeToId(firstUsable(item?.id, title)),
    type: "promo",
    theme,
    eyebrow: stripHtml(firstUsable(item?.eyebrow, "Studio Promo")),
    title,
    body: stripHtml(firstUsable(item?.body, "Creative, welcoming, and easy to book.")),
    quote: stripHtml(firstUsable(item?.quote, theme === "sun"
      ? "No experience? Perfect. Proud smiles count as success here."
      : "Bring the group. We’ll bring the brushes, the setup, and the easy fun.")),
    chips: uniqueStrings(normalizeStringList(item?.chips).slice(0, 4)),
    ctaLabel: stripHtml(firstUsable(item?.ctaLabel, inferPromoLabel(theme, title))),
    ctaUrl: normalizeUrl(firstUsable(item?.ctaUrl, inferPromoUrl(theme, qrLinks))) || inferPromoUrl(theme, qrLinks),
    stats: normalizeStatsList(item?.stats, theme),
    image: normalizeUrl(item?.image) || item?.image || fallbackImage,
    fallbackImage,
    priority: toNumber(item?.priority) || 1
  };
}

function buildActionRail(actionRail, qrLinks, fallbackActionRail) {
  const basePrimary = fallbackActionRail.primary;
  const baseSecondary = fallbackActionRail.secondary;
  const primarySource = {
    ...basePrimary,
    ...(actionRail?.primary || {})
  };
  const primaryUrl = normalizeUrl(firstUsable(primarySource.url, qrLinks.booking)) || qrLinks.booking;
  const primaryQrLabel = stripHtml(firstUsable(primarySource.qrLabel, "Book Classes"));

  const primary = {
    title: stripHtml(firstUsable(primarySource.title, basePrimary.title)),
    copy: stripHtml(firstUsable(primarySource.copy, basePrimary.copy)),
    note: stripHtml(firstUsable(primarySource.note, basePrimary.note)),
    url: primaryUrl,
    qrLabel: primaryQrLabel,
    qrImage: primarySource.qrImage || createQrPlaceholder({ label: primaryQrLabel.toUpperCase().replace(/\s+/g, " ").slice(0, 10), accent: "#6d1f42" })
  };

  const secondaryInput = Array.isArray(actionRail?.secondary) && actionRail.secondary.length
    ? actionRail.secondary
    : baseSecondary;
  const defaultUrls = [qrLinks.artShop, qrLinks.privateParty];
  const defaultAccents = ["#2d7f80", "#f1a33c"];

  const secondary = secondaryInput.slice(0, 2).map((item, index) => {
    const fallbackItem = baseSecondary[index] || baseSecondary[0];
    const merged = {
      ...fallbackItem,
      ...item
    };
    const qrLabel = stripHtml(firstUsable(merged.qrLabel, fallbackItem.qrLabel, index === 0 ? "Featured Art" : "Private Party"));

    return {
      title: stripHtml(firstUsable(merged.title, fallbackItem.title)),
      copy: stripHtml(firstUsable(merged.copy, fallbackItem.copy)),
      note: stripHtml(firstUsable(merged.note, fallbackItem.note)),
      url: normalizeUrl(firstUsable(merged.url, defaultUrls[index])) || defaultUrls[index],
      qrLabel,
      qrImage: merged.qrImage || createQrPlaceholder({
        label: qrLabel.toUpperCase().replace(/\s+/g, " ").slice(0, 10),
        accent: defaultAccents[index]
      })
    };
  });

  return { primary, secondary };
}

function buildDefaultRotationModules(data) {
  const modules = [];
  const hasEvents = data.upcomingEvents.length > 0;
  const hasMultipleEvents = data.upcomingEvents.length > 1;
  const hasArt = data.featuredArt.length > 0;

  modules.push({
    id: "events-grid",
    label: hasEvents ? "Upcoming Events" : "Calendar",
    type: "events-grid",
    weight: hasEvents ? 3 : 2,
    theme: "event"
  });

  if (hasMultipleEvents) {
    modules.push({
      id: "events-spotlight",
      label: "Featured Event",
      type: "events-spotlight",
      weight: 2,
      theme: "event"
    });
  }

  if (hasArt) {
    modules.push({
      id: "featured-art",
      label: "Featured Art",
      type: "featured-art",
      weight: 1,
      theme: "art"
    });
  }

  data.promos.slice(0, 2).forEach((promo) => {
    modules.push({
      id: `promo-${promo.id}`,
      label: promo.eyebrow || promo.title,
      type: "promo",
      promoId: promo.id,
      weight: 1,
      theme: promo.theme
    });
  });

  return modules;
}

function buildRotationModules(data) {
  const sourceModules = Array.isArray(data.rotationModules) && data.rotationModules.length
    ? data.rotationModules
    : buildDefaultRotationModules(data);

  return sourceModules.filter((module) => {
    if (module.type === "featured-art") {
      return data.featuredArt.length > 0;
    }

    if (module.type === "promo") {
      return data.promos.some((promo) => promo.id === module.promoId);
    }

    if (module.type === "events-spotlight") {
      return data.upcomingEvents.length > 1;
    }

    return true;
  });
}

function finalizeDisplayData(data, fallbackData) {
  data.qrLinks = resolveQrLinks(data.qrLinks);
  data.reassurancePoints = uniqueStrings(normalizeStringList(data.reassurancePoints));
  if (!data.reassurancePoints.length) {
    data.reassurancePoints = fallbackData.reassurancePoints;
  }

  data.tickerItems = uniqueStrings(normalizeStringList(data.tickerItems));
  if (!data.tickerItems.length) {
    data.tickerItems = fallbackData.tickerItems;
  }

  data.upcomingEvents = (Array.isArray(data.upcomingEvents) ? data.upcomingEvents : [])
    .map((event) => ensureEventShape(event, data.qrLinks))
    .slice(0, CONFIG.eventLimit);

  data.featuredArt = (Array.isArray(data.featuredArt) ? data.featuredArt : [])
    .map((item) => ensureArtShape(item, data.qrLinks))
    .slice(0, CONFIG.artLimit);

  data.promos = (Array.isArray(data.promos) ? data.promos : [])
    .map((promo) => ensurePromoShape(promo, data.qrLinks))
    .sort((left, right) => left.priority - right.priority)
    .slice(0, CONFIG.promoLimit);

  data.actionRail = buildActionRail(data.actionRail, data.qrLinks, fallbackData.actionRail);
  data.rotationModules = buildRotationModules(data);

  if (!data.rotationModules.length) {
    data.rotationModules = buildDefaultRotationModules(mergeDisplayData(fallbackData, data));
  }
}

function applySettingsOverrides(data, settings) {
  if (!settings) {
    return;
  }

  if (settings.studioName) {
    data.studio.name = settings.studioName;
  }

  if (settings.railNote) {
    data.studio.railNote = settings.railNote;
  }

  if (settings.reassurancePoints.length) {
    data.reassurancePoints = settings.reassurancePoints;
  }

  if (settings.tickerItems.length) {
    data.tickerItems = settings.tickerItems;
  }

  if (settings.promos.length) {
    data.promos = settings.promos;
  }

  if (settings.rotationModules.length) {
    data.rotationModules = settings.rotationModules;
  }

  if (settings.actionRail) {
    data.actionRail = {
      ...data.actionRail,
      ...settings.actionRail,
      primary: {
        ...(data.actionRail?.primary || {}),
        ...(settings.actionRail.primary || {})
      },
      secondary: settings.actionRail.secondary?.length
        ? settings.actionRail.secondary
        : (data.actionRail?.secondary || [])
    };
  }

  data.qrLinks = resolveQrLinks({
    ...data.qrLinks,
    ...settings.qrLinks
  });
}

function buildDataMeta(mode, sectionSources, detail) {
  return {
    mode,
    statusLabel: mode === "live" ? "Live data" : "Using backup content",
    detail,
    sectionSources
  };
}

function describeSectionSources(sectionSources, usedExisting) {
  if (usedExisting) {
    return "Refresh failed. Showing the last successful content.";
  }

  return Object.entries(sectionSources)
    .map(([section, source]) => `${section}: ${source}`)
    .join(" • ");
}

async function fetchStudioDisplayData(previousData = null) {
  const fallbackData = buildFallbackStudioDisplayData();
  const mergedBase = previousData
    ? mergeDisplayData(fallbackData, previousData)
    : cloneDisplayData(fallbackData);
  const initialQrLinks = resolveQrLinks(mergedBase.qrLinks);

  const [eventsResult, artResult, settingsResult, promosResult] = await Promise.all([
    fetchLiveEvents(),
    fetchLiveArt(),
    fetchLiveSettings(),
    fetchLivePromos(initialQrLinks)
  ]);

  const sectionSources = {
    events: "backup",
    art: "backup",
    settings: "backup",
    promos: "backup"
  };
  let liveSectionCount = 0;

  if (settingsResult.ok) {
    applySettingsOverrides(mergedBase, settingsResult.settings);
    sectionSources.settings = "live";
    liveSectionCount += 1;
  } else if (previousData) {
    sectionSources.settings = "stale";
  }

  mergedBase.qrLinks = resolveQrLinks(mergedBase.qrLinks);

  if (eventsResult.ok) {
    mergedBase.upcomingEvents = eventsResult.items;
    sectionSources.events = "live";
    liveSectionCount += 1;
  } else if (previousData?.upcomingEvents?.length) {
    sectionSources.events = "stale";
  }

  if (artResult.ok) {
    mergedBase.featuredArt = artResult.items;
    sectionSources.art = "live";
    liveSectionCount += 1;
  } else if (previousData?.featuredArt?.length) {
    sectionSources.art = "stale";
  }

  if (promosResult.ok && promosResult.items.length) {
    mergedBase.promos = promosResult.items;
    sectionSources.promos = "live";
    liveSectionCount += 1;
  } else if (settingsResult.ok && settingsResult.settings.promos.length) {
    sectionSources.promos = "live";
  } else if (previousData?.promos?.length) {
    sectionSources.promos = "stale";
  }

  if (liveSectionCount === 0 && previousData) {
    const staleData = mergeDisplayData(fallbackData, previousData);
    finalizeDisplayData(staleData, fallbackData);
    staleData.meta = buildDataMeta("backup", sectionSources, describeSectionSources(sectionSources, true));

    return {
      data: staleData,
      didUpdate: false,
      loadedAt: null
    };
  }

  finalizeDisplayData(mergedBase, fallbackData);
  mergedBase.meta = buildDataMeta(
    liveSectionCount > 0 ? "live" : "backup",
    sectionSources,
    describeSectionSources(sectionSources, false)
  );

  return {
    data: mergedBase,
    didUpdate: true,
    loadedAt: new Date()
  };
}

function buildRotationSequence(modules) {
  const pool = modules.map((module, index) => ({
    ...module,
    order: index,
    remaining: module.weight || 1
  }));
  const sequence = [];
  let previousId = "";

  while (pool.some((module) => module.remaining > 0)) {
    const next = pool
      .filter((module) => module.remaining > 0 && module.id !== previousId)
      .sort((left, right) => {
        if (right.remaining !== left.remaining) {
          return right.remaining - left.remaining;
        }

        return left.order - right.order;
      })[0] || pool
      .filter((module) => module.remaining > 0)
      .sort((left, right) => left.order - right.order)[0];

    if (!next) {
      break;
    }

    sequence.push(next);
    next.remaining -= 1;
    previousId = next.id;
  }

  return sequence;
}

function renderLoadingState(message = "Loading tonight’s creative lineup...", detail = "Pulling upcoming events, featured art, and studio promos from WordPress.") {
  elements.stageLabel.textContent = "Loading";
  elements.stageCount.textContent = "Connecting";
  elements.stageContent.innerHTML = `
    <article class="module-placeholder module-placeholder-loading">
      <div class="module-shell">
        <p class="module-eyebrow">Loading</p>
        <h3 class="module-title">${escapeHtml(message)}</h3>
        <p class="module-copy">${escapeHtml(detail)}</p>
      </div>
    </article>
  `;
  elements.stageDots.innerHTML = "";
  restartProgressAnimation();
}

function renderManagedImage({ className, src, fallbackSrc, alt }) {
  const resolvedSource = src || fallbackSrc;
  return `<img class="${escapeHtml(className)}" src="${escapeHtml(resolvedSource)}" alt="${escapeHtml(alt)}" data-fallback-image="${escapeHtml(fallbackSrc || resolvedSource)}" loading="eager" decoding="async">`;
}

function bindImageResilience() {
  if (state.imageFallbackBound) {
    return;
  }

  document.addEventListener("error", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement) || !target.dataset.fallbackImage) {
      return;
    }

    if (target.dataset.fallbackApplied === "true") {
      return;
    }

    target.dataset.fallbackApplied = "true";
    target.classList.add("is-image-fallback");
    target.src = target.dataset.fallbackImage;
  }, true);

  state.imageFallbackBound = true;
}

function updateDataModeIndicator(meta = { mode: "loading", statusLabel: "Loading data", detail: "Connecting to WordPress." }) {
  if (!elements.dataMode) {
    return;
  }

  const mode = meta.mode || "loading";
  elements.dataMode.textContent = meta.statusLabel || "Loading data";
  elements.dataMode.dataset.mode = mode;
  elements.dataMode.className = `meta-status meta-status-${mode === "live" ? "live" : mode === "backup" ? "backup" : "loading"}`;
  elements.dataMode.title = meta.detail || "";
}

function renderActionRail(data) {
  const primary = data.actionRail.primary;
  const secondary = data.actionRail.secondary;

  elements.primaryQr.innerHTML = `
    <a class="qr-card qr-card-primary" href="${escapeHtml(primary.url)}" target="_blank" rel="noreferrer">
      <p class="module-eyebrow">Primary QR</p>
      <h3 class="rail-card-title">${escapeHtml(primary.title)}</h3>
      <p class="rail-card-copy">${escapeHtml(primary.copy)}</p>
      <div class="qr-image-wrap">
        <img class="qr-image" src="${primary.qrImage}" alt="QR code for ${escapeHtml(primary.title)}">
        <span class="qr-label">${escapeHtml(primary.qrLabel)}</span>
      </div>
      <p class="rail-card-note">${escapeHtml(primary.note)}</p>
    </a>
  `;

  elements.secondaryCtas.innerHTML = secondary.map((item) => `
    <a class="secondary-cta" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">
      <div class="secondary-body">
        <p class="module-eyebrow">${escapeHtml(item.note)}</p>
        <h3 class="secondary-title">${escapeHtml(item.title)}</h3>
        <p class="secondary-copy">${escapeHtml(item.copy)}</p>
      </div>
      <div class="qr-image-wrap">
        <img class="secondary-qr" src="${item.qrImage}" alt="QR code for ${escapeHtml(item.title)}">
        <span class="qr-label">${escapeHtml(item.qrLabel)}</span>
      </div>
    </a>
  `).join("");

  elements.reassuranceList.innerHTML = data.reassurancePoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("");
  elements.railNote.textContent = data.studio.railNote;
}

function renderTicker(items) {
  const trackItems = [...items, ...items];
  elements.tickerTrack.innerHTML = trackItems.map((item) => `<span class="ticker-item">${escapeHtml(item)}</span>`).join("");
}

function renderStageDots() {
  elements.stageDots.innerHTML = state.rotationSequence.map((module, index) => `
    <button
      class="stage-dot${index === state.rotationIndex ? " is-active" : ""}"
      type="button"
      data-stage-dot="${index}"
      aria-label="Show ${escapeHtml(module.label)}"
      aria-current="${index === state.rotationIndex ? "true" : "false"}"
    ></button>
  `).join("");
}

function renderEventCard(event) {
  const statusClass = event.status === "few-seats"
    ? "status-badge status-badge-few-seats"
    : event.status === "sold-out"
      ? "status-badge status-badge-sold-out"
      : "status-badge";

  const cardStateClass = event.status === "few-seats"
    ? "event-card is-few-seats"
    : event.status === "sold-out"
      ? "event-card is-sold-out"
      : "event-card";

  return `
    <article class="${cardStateClass}">
      <div class="event-image">
        ${renderManagedImage({
          className: "",
          src: event.image,
          fallbackSrc: event.fallbackImage,
          alt: `${event.title} event artwork`
        })}
        <span class="${statusClass}">${escapeHtml(event.badge)}</span>
      </div>
      <div class="event-body">
        <h3 class="event-title">${escapeHtml(event.title)}</h3>
        <div class="event-meta">
          <span>${escapeHtml(formatShortDate(event.date))}</span>
          <span>${escapeHtml(event.time)}</span>
          <span>${escapeHtml(formatPriceDisplay(event.price))}</span>
        </div>
        <p class="event-availability">${escapeHtml(event.availabilityText)}</p>
        <a class="cta-button" href="${escapeHtml(event.ctaUrl)}" target="_blank" rel="noreferrer">${escapeHtml(event.ctaLabel)}</a>
      </div>
    </article>
  `;
}

function renderNoEventsModule(data) {
  return `
    <article class="module theme-event">
      <div class="module-shell">
        <div class="module-story">
          <div class="module-heading">
            <p class="module-eyebrow">Upcoming Events</p>
            <h3 class="module-title">Fresh dates are on the way.</h3>
            <p class="module-copy">Tonight&rsquo;s live calendar did not return a public class yet, but the booking page is still the best place to catch the next date-night, floral favorite, or wine-glass round before it pops up on the studio screen.</p>
            <div class="summary-row">
              <span class="summary-chip">Live booking page</span>
              <span class="summary-chip">No experience needed</span>
              <span class="summary-chip">BYOB fun</span>
            </div>
            <a class="module-action" href="${escapeHtml(data.qrLinks.booking)}" target="_blank" rel="noreferrer">Scan to Book</a>
          </div>
          <figure class="module-visual">
            ${renderManagedImage({
              className: "",
              src: createPosterAsset({
                title: "Paint. Sip. Repeat.",
                subtitle: "Your next masterpiece is one scan away.",
                tag: "Calendar",
                palette: "meadow"
              }),
              fallbackSrc: createPosterAsset({
                title: "Paint. Sip. Repeat.",
                subtitle: "Your next masterpiece is one scan away.",
                tag: "Calendar",
                palette: "meadow"
              }),
              alt: "Wine and Canvas calendar placeholder"
            })}
            <figcaption>Scan for the latest dates.</figcaption>
          </figure>
        </div>
      </div>
    </article>
  `;
}

function renderEventsGridModule(data) {
  if (!data.upcomingEvents.length) {
    return renderNoEventsModule(data);
  }

  const featured = data.upcomingEvents[0];
  const cards = data.upcomingEvents.slice(0, 3);
  const fewSeatsCount = data.upcomingEvents.filter((event) => event.status === "few-seats").length;

  return `
    <article class="module theme-event">
      <div class="module-shell">
        <div class="module-story">
          <div class="module-heading">
            <p class="module-eyebrow">Upcoming Events</p>
            <h3 class="module-title">Paint. Sip. Repeat.</h3>
            <p class="module-copy">Your next masterpiece is one scan away. Pick a floral favorite, grab a date-night seat, or try a wine-glass class that feels way less intimidating than it sounds.</p>
            <div class="summary-row">
              <span class="summary-chip">${data.upcomingEvents.length} upcoming classes</span>
              <span class="summary-chip">${fewSeatsCount} class${fewSeatsCount === 1 ? "" : "es"} with few seats</span>
              <span class="summary-chip">No experience? Perfect.</span>
            </div>
            <a class="module-action" href="${escapeHtml(data.qrLinks.booking)}" target="_blank" rel="noreferrer">Scan to Book</a>
          </div>
          <figure class="module-visual">
            ${renderManagedImage({
              className: "",
              src: featured.image,
              fallbackSrc: featured.fallbackImage,
              alt: `${featured.title} class feature`
            })}
            <figcaption>Seats dry fast.</figcaption>
          </figure>
        </div>
        <div class="event-grid">
          ${cards.map(renderEventCard).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderEventsSpotlightModule(data) {
  if (!data.upcomingEvents.length) {
    return renderNoEventsModule(data);
  }

  const spotlight = data.upcomingEvents.find((event) => event.status === "few-seats") || data.upcomingEvents[1] || data.upcomingEvents[0];
  const nextEvents = data.upcomingEvents.filter((event) => event.id !== spotlight.id).slice(0, 2);

  return `
    <article class="module theme-event">
      <div class="module-shell spotlight-layout">
        <figure class="spotlight-image">
          ${renderManagedImage({
            className: "",
            src: spotlight.image,
            fallbackSrc: spotlight.fallbackImage,
            alt: `${spotlight.title} event artwork`
          })}
          <figcaption>${escapeHtml(spotlight.badge)}</figcaption>
        </figure>
        <div class="spotlight-panel">
          <div>
            <p class="module-eyebrow">Featured Event</p>
            <h3 class="spotlight-title">${escapeHtml(spotlight.title)}</h3>
          </div>
          <p class="module-copy">Better than dinner. Way more fun. This one is easy on beginners, strong on color, and exactly the kind of night guests rebook before cleanup starts.</p>
          <div class="spotlight-details">
            <div class="detail-card"><span>Date</span><strong>${escapeHtml(formatShortDate(spotlight.date))}</strong></div>
            <div class="detail-card"><span>Time</span><strong>${escapeHtml(spotlight.time)}</strong></div>
            <div class="detail-card"><span>Price</span><strong>${escapeHtml(formatPriceDisplay(spotlight.price))}</strong></div>
            <div class="detail-card"><span>Availability</span><strong>${escapeHtml(spotlight.availabilityText)}</strong></div>
          </div>
          <a class="module-action" href="${escapeHtml(spotlight.ctaUrl)}" target="_blank" rel="noreferrer">${escapeHtml(spotlight.ctaLabel)}</a>
          <div class="spotlight-subgrid">
            ${nextEvents.map((event) => `
              <article class="mini-event-card">
                <p class="module-eyebrow">${escapeHtml(event.badge)}</p>
                <h4 class="mini-event-title">${escapeHtml(event.title)}</h4>
                <p class="mini-event-meta">${escapeHtml(formatShortDate(event.date))} • ${escapeHtml(event.time)}</p>
                <p class="mini-event-meta">${escapeHtml(event.availabilityText)}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedArtModule(data) {
  if (!data.featuredArt.length) {
    return "";
  }

  const [featured, ...rest] = data.featuredArt;

  return `
    <article class="module theme-art">
      <div class="module-shell art-layout">
        <div class="module-story">
          <div class="module-heading">
            <p class="module-eyebrow">Featured Painting for Pickup</p>
            <h3 class="module-title">Love it? Take it home.</h3>
            <p class="module-copy">Finished duplicate paintings are available for local pickup, which means the piece that caught your eye tonight can be hanging on your wall before the cork goes back in the drawer.</p>
            <div class="module-pill-row">
              <span class="pill-chip">Local pickup</span>
              <span class="pill-chip">Ready-made art</span>
              <span class="pill-chip">Great gift move</span>
            </div>
            <a class="module-action" href="${escapeHtml(featured.ctaUrl)}" target="_blank" rel="noreferrer">${escapeHtml(featured.ctaLabel)}</a>
          </div>
          <div class="art-feature">
            <figure class="art-feature-visual">
              ${renderManagedImage({
                className: "",
                src: featured.image,
                fallbackSrc: featured.fallbackImage,
                alt: `${featured.title} featured art`
              })}
            </figure>
            <div class="art-feature-copy">
              <p class="module-eyebrow">Pickup-ready favorite</p>
              <h4 class="art-feature-title">${escapeHtml(featured.title)}</h4>
              <p class="art-price">${escapeHtml(formatPriceDisplay(featured.price))}</p>
              <p class="art-copy">${escapeHtml(featured.description)}</p>
              <p class="art-copy">${escapeHtml(featured.pickupAvailability)}</p>
            </div>
          </div>
        </div>
        <div class="art-grid">
          ${rest.map((item) => `
            <article class="art-card">
              <div class="art-card-image">
                ${renderManagedImage({
                  className: "",
                  src: item.image,
                  fallbackSrc: item.fallbackImage,
                  alt: `${item.title} duplicate art`
                })}
              </div>
              <div class="art-card-body">
                <p class="module-eyebrow">Available now</p>
                <h4 class="art-card-title">${escapeHtml(item.title)}</h4>
                <p class="art-price">${escapeHtml(formatPriceDisplay(item.price))}</p>
                <p class="art-copy">${escapeHtml(item.description)}</p>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderPromoModule(data, promoId) {
  const promo = data.promos.find((item) => item.id === promoId);
  if (!promo) {
    return "";
  }

  return `
    <article class="module theme-${escapeHtml(promo.theme)}">
      <div class="module-shell promo-layout">
        <div class="promo-panel">
          <p class="module-eyebrow">${escapeHtml(promo.eyebrow)}</p>
          <h3 class="promo-title">${escapeHtml(promo.title)}</h3>
          <p class="promo-copy-text">${escapeHtml(promo.body)}</p>
          <div class="promo-chip-row">
            ${promo.chips.map((chip) => `<span class="promo-chip">${escapeHtml(chip)}</span>`).join("")}
          </div>
          <p class="module-quote">${escapeHtml(promo.quote)}</p>
          <a class="module-action" href="${escapeHtml(promo.ctaUrl)}" target="_blank" rel="noreferrer">${escapeHtml(promo.ctaLabel)}</a>
        </div>
        <div class="promo-visual">
          <figure class="promo-visual-card">
            ${renderManagedImage({
              className: "",
              src: promo.image,
              fallbackSrc: promo.fallbackImage,
              alt: `${promo.title} promo artwork`
            })}
          </figure>
          <div class="stats-grid">
            ${promo.stats.map((stat) => `
              <article class="stat-card">
                <strong>${escapeHtml(stat.value)}</strong>
                <span>${escapeHtml(stat.label)}</span>
              </article>
            `).join("")}
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderCurrentModule() {
  if (!state.data || !state.rotationSequence.length) {
    return;
  }

  const current = state.rotationSequence[state.rotationIndex];
  let markup = "";

  if (current.type === "events-grid") {
    markup = renderEventsGridModule(state.data);
  } else if (current.type === "events-spotlight") {
    markup = renderEventsSpotlightModule(state.data);
  } else if (current.type === "featured-art") {
    markup = renderFeaturedArtModule(state.data);
  } else if (current.type === "promo") {
    markup = renderPromoModule(state.data, current.promoId);
  }

  if (!markup) {
    markup = renderEventsGridModule(state.data);
  }

  elements.stageLabel.textContent = current.label;
  elements.stageCount.textContent = `${state.rotationIndex + 1} of ${state.rotationSequence.length}`;
  elements.stageContent.innerHTML = markup;
  renderStageDots();
  restartProgressAnimation();
}

function restartProgressAnimation() {
  if (!elements.stageProgress) {
    return;
  }

  elements.stageProgress.classList.remove("is-animating");
  void elements.stageProgress.offsetWidth;

  if (!state.reduceMotion) {
    elements.stageProgress.style.animationDuration = `${CONFIG.rotationIntervalMs}ms`;
    elements.stageProgress.classList.add("is-animating");
  }
}

function goToModule(index) {
  if (!state.rotationSequence.length) {
    return;
  }

  state.rotationIndex = (index + state.rotationSequence.length) % state.rotationSequence.length;
  renderCurrentModule();
  startRotation();
}

function startRotation() {
  window.clearInterval(state.rotationTimer);
  if (state.rotationSequence.length <= 1) {
    return;
  }

  state.rotationTimer = window.setInterval(() => {
    state.rotationIndex = (state.rotationIndex + 1) % state.rotationSequence.length;
    renderCurrentModule();
  }, CONFIG.rotationIntervalMs);
}

function updateClock() {
  const now = new Date();

  if (elements.clock) {
    elements.clock.textContent = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit"
    }).format(now);
  }

  if (elements.dateLine) {
    elements.dateLine.textContent = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    }).format(now);
  }
}

function updateFreshness() {
  if (elements.freshness) {
    elements.freshness.textContent = formatFreshness(state.lastUpdatedAt);
  }
}

async function refreshDisplayData({ preserveModule = true } = {}) {
  const previousModuleId = preserveModule && state.rotationSequence[state.rotationIndex]
    ? state.rotationSequence[state.rotationIndex].id
    : "";

  const result = await fetchStudioDisplayData(state.data);

  if (!result.didUpdate && state.data) {
    state.data.meta = result.data.meta;
    updateDataModeIndicator(result.data.meta);
    updateFreshness();
    return;
  }

  state.data = result.data;
  if (result.loadedAt) {
    state.lastUpdatedAt = result.loadedAt;
  }

  state.rotationSequence = buildRotationSequence(result.data.rotationModules);
  const nextIndex = previousModuleId
    ? state.rotationSequence.findIndex((module) => module.id === previousModuleId)
    : -1;
  state.rotationIndex = nextIndex >= 0 ? nextIndex : 0;

  renderActionRail(result.data);
  renderTicker(result.data.tickerItems);
  renderCurrentModule();
  updateDataModeIndicator(result.data.meta);
  updateFreshness();
}

function bindEvents() {
  elements.stageDots?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-stage-dot]");
    if (!button) {
      return;
    }

    const index = Number(button.getAttribute("data-stage-dot"));
    if (!Number.isNaN(index)) {
      goToModule(index);
    }
  });

  bindImageResilience();
}

async function init() {
  try {
    updateClock();
    updateFreshness();
    updateDataModeIndicator({
      mode: "loading",
      statusLabel: "Loading data",
      detail: "Connecting to WordPress."
    });
    renderLoadingState();
    bindEvents();

    await refreshDisplayData({ preserveModule: false });
    startRotation();

    state.clockTimer = window.setInterval(() => {
      updateClock();
      updateFreshness();
    }, CONFIG.clockRefreshMs);

    state.refreshTimer = window.setInterval(async () => {
      try {
        await refreshDisplayData();
      } catch (error) {
        console.warn(`[studio-display] Refresh failed. ${error.message}`);
        updateDataModeIndicator({
          mode: "backup",
          statusLabel: "Using backup content",
          detail: "Refresh failed. Showing the last successful content."
        });
      }
    }, CONFIG.dataRefreshMs);
  } catch (error) {
    console.error("Studio display could not initialize.", error);
    updateDataModeIndicator({
      mode: "backup",
      statusLabel: "Using backup content",
      detail: "Initialization failed. Showing backup content."
    });
    renderLoadingState(
      "Using backup content.",
      "WordPress did not respond cleanly, so the kiosk kept its local backup lineup instead of going blank."
    );
  }
}

init();
