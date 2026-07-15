document.querySelectorAll("[data-accordion] button[aria-controls]").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    if (!panel) return;
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    panel.hidden = isOpen;
    const indicator = button.querySelector("span[aria-hidden]");
    if (indicator) indicator.textContent = isOpen ? "+" : "−";
  });
});

const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");
const lightboxCaption = lightbox?.querySelector("[data-lightbox-caption]");
const lightboxClose = lightbox?.querySelector("[data-lightbox-close]");
let lightboxOpener = null;

if (lightbox && lightboxImage && lightboxCaption && lightboxClose) {
  document.querySelectorAll("[data-lightbox-src]").forEach((button) => {
    button.addEventListener("click", () => {
      lightboxOpener = button;
      lightboxImage.src = button.dataset.lightboxSrc;
      lightboxImage.alt = button.dataset.lightboxAlt || "Graduation event photo";
      lightboxCaption.textContent = button.dataset.lightboxAlt || "";
      lightbox.showModal();
      lightboxClose.focus();
    });
  });

  lightboxClose.addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener("close", () => {
    lightboxImage.removeAttribute("src");
    lightboxOpener?.focus();
  });
}
