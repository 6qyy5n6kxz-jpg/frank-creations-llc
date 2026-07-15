const page = document.body.dataset.page || "";
const siteRoot = document.body.dataset.siteRoot || ".";

const navItems = [
  { id: "services", label: "Services", href: "/#our-services", activePages: ["home", "wine", "cookies", "music"] },
  { id: "enhancements", label: "Event Enhancements", href: "/event-enhancements/", activePages: ["enhancements", "photo-booth"] },
  { id: "packages", label: "Packages", href: "/packages/" },
  { id: "contact", label: "Contact", href: "/contact/" }
];

const brandAssets = {
  horizontalLogo: "images/fc-horizontal-logo-trimmed.png",
  monogram: "images/fc-monogram-trimmed.png",
  fullLogo: "images/frank-creations-llc-logo.png",
  faviconIco: "favicon.ico",
  favicon16: "images/favicon-16x16.png",
  favicon32: "images/favicon-32x32.png",
  appleTouchIcon: "images/apple-touch-icon.png",
  manifest: "site.webmanifest"
};

const normalizePath = (path) => path.replace(/\/{2,}/g, "/").replace(/\/\.\//g, "/");

export const resolveSitePath = (relativePath) => {
  if (/^(?:https?:)?\/\//.test(relativePath) || relativePath.startsWith("#")) {
    return relativePath;
  }

  const base = siteRoot === "." ? "" : siteRoot.replace(/\/$/, "");
  return normalizePath(`${base}/${relativePath}`);
};

window.resolveSitePath = resolveSitePath;

const ensureMetaTag = (selector, attributes) => {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    document.head.append(node);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });

  return node;
};

const ensureLinkTag = (selector, attributes) => {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("link");
    document.head.append(node);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });

  return node;
};

const applyLaunchMeta = () => {
  const siteName = "Frank Creations LLC";
  const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
  const title = document.title;
  const declaredOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content");
  const declaredOgDescription = document.querySelector('meta[property="og:description"]')?.getAttribute("content");
  const declaredOgImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
  const declaredTwitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute("content");
  const declaredTwitterDescription = document.querySelector('meta[name="twitter:description"]')?.getAttribute("content");
  const declaredTwitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute("content");
  const canonical = new URL(window.location.href.split("#")[0]);
  if (canonical.pathname.endsWith("/index.html")) {
    canonical.pathname = canonical.pathname.replace(/index\.html$/, "");
  }
  canonical.hash = "";
  canonical.search = "";
  const canonicalUrl = canonical.toString();
  const socialImageUrl = declaredOgImage || new URL(resolveSitePath(brandAssets.fullLogo), window.location.href).href;

  document.head.querySelectorAll('link[rel="icon"]').forEach((node) => node.remove());

  ensureLinkTag('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });
  ensureLinkTag('link[rel="icon"][sizes="any"]', { rel: "icon", href: resolveSitePath(brandAssets.faviconIco), sizes: "any" });
  ensureLinkTag('link[rel="icon"][type="image/png"][sizes="32x32"]', { rel: "icon", type: "image/png", sizes: "32x32", href: resolveSitePath(brandAssets.favicon32) });
  ensureLinkTag('link[rel="icon"][type="image/png"][sizes="16x16"]', { rel: "icon", type: "image/png", sizes: "16x16", href: resolveSitePath(brandAssets.favicon16) });
  ensureLinkTag('link[rel="apple-touch-icon"]', { rel: "apple-touch-icon", sizes: "180x180", href: resolveSitePath(brandAssets.appleTouchIcon) });
  ensureLinkTag('link[rel="manifest"]', { rel: "manifest", href: resolveSitePath(brandAssets.manifest) });
  ensureMetaTag('meta[name="application-name"]', { name: "application-name", content: siteName });
  ensureMetaTag('meta[name="theme-color"]', { name: "theme-color", content: "#000000" });
  ensureMetaTag('meta[property="og:site_name"]', { property: "og:site_name", content: siteName });
  ensureMetaTag('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
  ensureMetaTag('meta[property="og:image"]', { property: "og:image", content: socialImageUrl });
  ensureMetaTag('meta[property="og:title"]', { property: "og:title", content: declaredOgTitle || title });
  ensureMetaTag('meta[property="og:description"]', { property: "og:description", content: declaredOgDescription || description });
  ensureMetaTag('meta[name="twitter:title"]', { name: "twitter:title", content: declaredTwitterTitle || declaredOgTitle || title });
  ensureMetaTag('meta[name="twitter:description"]', { name: "twitter:description", content: declaredTwitterDescription || declaredOgDescription || description });
  ensureMetaTag('meta[name="twitter:image"]', { name: "twitter:image", content: declaredTwitterImage || socialImageUrl });
};

const headerTarget = document.querySelector("[data-site-header]");
const footerTarget = document.querySelector("[data-site-footer]");

const navMarkup = navItems.map((item) => {
  const href = resolveSitePath(item.href);
  const current = page === item.id || item.activePages?.includes(page) ? ' aria-current="page"' : "";
  return `<a href="${href}"${current}>${item.label}</a>`;
}).join("");

if (headerTarget) {
  headerTarget.innerHTML = `
    <header class="site-header">
      <div class="container site-header-inner">
        <a class="brand-lockup" href="${resolveSitePath("/")}" aria-label="Frank Creations LLC home">
          <img class="brand-logo brand-logo-desktop" src="${resolveSitePath(brandAssets.horizontalLogo)}" width="1649" height="423" alt="" aria-hidden="true">
          <img class="brand-logo brand-logo-mobile" src="${resolveSitePath(brandAssets.monogram)}" width="865" height="899" alt="" aria-hidden="true">
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
        <nav class="site-nav" id="site-nav" aria-label="Main navigation" hidden>
          ${navMarkup}
        </nav>
      </div>
    </header>
  `;
}

if (footerTarget) {
  footerTarget.innerHTML = `
    <footer class="site-footer">
      <div class="container site-footer-inner">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="footer-logo-link" href="${resolveSitePath("/")}" aria-label="Frank Creations LLC home">
              <img class="footer-logo" src="${resolveSitePath(brandAssets.horizontalLogo)}" width="1649" height="423" alt="Frank Creations LLC">
            </a>
            <h3>Frank Creations LLC</h3>
            <p>Events &bull; Entertainment &bull; Experiences</p>
            <p>Serving Northwest Ohio and Southeast Michigan</p>
            <div class="footer-social-links" aria-label="Social media links">
              <a class="footer-social-link" href="https://www.facebook.com/AChangeOfPlans419" target="_blank" rel="noreferrer" aria-label="A Change Of Plans on Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13.35 20v-6.38h2.14l.32-2.49h-2.46V9.54c0-.72.2-1.21 1.23-1.21h1.31V6.1c-.23-.03-1-.1-1.89-.1-1.87 0-3.16 1.14-3.16 3.24v1.89H9v2.49h2.03V20h2.32Z"/>
                </svg>
              </a>
              <a class="footer-social-link" href="https://www.instagram.com/AChangeofPlansduo" target="_blank" rel="noreferrer" aria-label="A Change Of Plans on Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 1.5A3 3 0 0 0 4.5 7.5v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-9Zm9.38 1.88a1.12 1.12 0 1 1 0 2.24 1.12 1.12 0 0 1 0-2.24ZM12 7.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 1.5A3 3 0 1 0 15 12a3 3 0 0 0-3-3Z"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3>Explore</h3>
            <p><a href="${resolveSitePath("/")}">Home</a></p>
            <p><a href="${resolveSitePath("/#our-services")}">Services</a></p>
            <p><a href="${resolveSitePath("/event-enhancements/")}">Event Enhancements</a></p>
            <p><a href="${resolveSitePath("/packages/")}">Packages</a></p>
            <p><a href="${resolveSitePath("/graduation-parties/")}">Graduation Parties</a></p>
            <p><a href="${resolveSitePath("/photo-booth/")}">Photo Booth Rentals</a></p>
            <p><a href="${resolveSitePath("/wine-and-canvas-toledo/")}">Wine & Canvas Toledo</a></p>
            <p><a href="${resolveSitePath("/cookies-and-canvas/")}">Cookies & Canvas</a></p>
            <p><a href="${resolveSitePath("/a-change-of-plans/")}">A Change Of Plans</a></p>
            <p><a href="${resolveSitePath("/contact/")}">Contact</a></p>
          </div>
          <div>
            <h3>Brand Family</h3>
            <p>Frank Creations LLC is the parent company behind photo booth rentals, live music, paint parties, kids art events, and creative experiences throughout Northwest Ohio and Southeast Michigan.</p>
            <a class="button button-primary footer-cta" href="${resolveSitePath("/contact/")}">Start a Booking Inquiry</a>
          </div>
        </div>
        <p class="footer-legal">&copy; <span data-current-year></span> Frank Creations LLC.</p>
      </div>
    </footer>
  `;
}

applyLaunchMeta();

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  const closeNav = () => {
    navToggle.setAttribute("aria-expanded", "false");
    siteNav.hidden = true;
  };

  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    siteNav.hidden = isExpanded;
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 960) {
        closeNav();
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 960) {
      siteNav.hidden = false;
      navToggle.setAttribute("aria-expanded", "true");
    } else {
      closeNav();
    }
  });

  if (window.innerWidth >= 960) {
    siteNav.hidden = false;
    navToggle.setAttribute("aria-expanded", "true");
  }
}
