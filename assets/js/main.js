const page = document.body.dataset.page || "";
const siteRoot = document.body.dataset.siteRoot || ".";

const navItems = [
  { id: "home", label: "Home", href: "/" },
  { id: "music", label: "A Change Of Plans", href: "/a-change-of-plans/" },
  { id: "wine", label: "Wine & Canvas Toledo", href: "/wine-and-canvas-toledo/" },
  { id: "cookies", label: "Cookies & Canvas", href: "/cookies-and-canvas/" },
  { id: "shop", label: "Shop", href: "/shop/" },
  { id: "contact", label: "Contact", href: "/contact/" }
];

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
  const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
  const title = document.title;
  const canonical = new URL(window.location.href.split("#")[0]);
  if (canonical.pathname.endsWith("/index.html")) {
    canonical.pathname = canonical.pathname.replace(/index\.html$/, "");
  }
  canonical.hash = "";
  canonical.search = "";
  const canonicalUrl = canonical.toString();
  const socialImageUrl = new URL(resolveSitePath("images/social-preview.svg"), window.location.href).href;
  const iconUrl = new URL(resolveSitePath("images/brand-mark.svg"), window.location.href).href;

  ensureLinkTag('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });
  ensureLinkTag('link[rel="icon"]', { rel: "icon", type: "image/svg+xml", href: iconUrl });
  ensureMetaTag('meta[name="theme-color"]', { name: "theme-color", content: "#b85c38" });
  ensureMetaTag('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
  ensureMetaTag('meta[property="og:image"]', { property: "og:image", content: socialImageUrl });
  ensureMetaTag('meta[property="og:title"]', { property: "og:title", content: title });
  ensureMetaTag('meta[property="og:description"]', { property: "og:description", content: description });
  ensureMetaTag('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  ensureMetaTag('meta[name="twitter:description"]', { name: "twitter:description", content: description });
  ensureMetaTag('meta[name="twitter:image"]', { name: "twitter:image", content: socialImageUrl });
};

const headerTarget = document.querySelector("[data-site-header]");
const footerTarget = document.querySelector("[data-site-footer]");

const navMarkup = navItems.map((item) => {
  const href = resolveSitePath(item.href);
  const current = page === item.id ? ' aria-current="page"' : "";
  return `<a href="${href}"${current}>${item.label}</a>`;
}).join("");

if (headerTarget) {
  headerTarget.innerHTML = `
    <header class="site-header">
      <div class="container site-header-inner">
        <a class="brand-lockup" href="${resolveSitePath("/")}">
          <img class="brand-mark" src="${resolveSitePath("images/brand-mark.svg")}" alt="Frank Creations LLC abstract brand mark">
          <span>
            <strong>Frank Creations LLC</strong>
            <span>Creative events, music, and family experiences</span>
          </span>
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
          <div>
            <h3>Frank Creations LLC</h3>
            <p>A central home for paint experiences, live music, family-friendly events, and local creative offerings.</p>
          </div>
          <div>
            <h3>Explore</h3>
            <p><a href="${resolveSitePath("/wine-and-canvas-toledo/")}">Wine & Canvas Toledo</a></p>
            <p><a href="${resolveSitePath("/a-change-of-plans/")}">A Change Of Plans</a></p>
            <p><a href="${resolveSitePath("/cookies-and-canvas/")}">Cookies & Canvas</a></p>
          </div>
          <div>
            <h3>Plan an event</h3>
            <p><a href="${resolveSitePath("/contact/")}">Send a booking inquiry</a></p>
            <p><a href="${resolveSitePath("/shop/")}">Browse local pickup items</a></p>
          </div>
        </div>
        <p>&copy; <span data-current-year></span> Frank Creations LLC. Built as a static site for GitHub Pages.</p>
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
