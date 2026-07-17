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

const slideshow = document.querySelector("[data-graduation-slideshow]");
let setSlideshowModalPause = () => {};

if (slideshow) {
  const images = [...slideshow.querySelectorAll("[data-slide-image]")];
  const details = [...slideshow.querySelectorAll("[data-slide-detail]")];
  const dots = [...slideshow.querySelectorAll("[data-slide-dot]")];
  const previous = slideshow.querySelector("[data-slide-previous]");
  const next = slideshow.querySelector("[data-slide-next]");
  const toggle = slideshow.querySelector("[data-slide-toggle]");
  const count = slideshow.querySelector("[data-slide-count]");
  const status = slideshow.querySelector("[data-slide-status]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const interval = 6000;
  let current = 0;
  let timer = null;
  let userPaused = reducedMotion.matches;
  let pointerInside = false;
  let focusInside = false;
  let modalOpen = false;
  let touchStartX = null;

  const shouldPause = () => userPaused || pointerInside || focusInside || modalOpen || document.hidden;

  const updateToggle = () => {
    if (!toggle) return;
    toggle.textContent = userPaused ? "Play" : "Pause";
    toggle.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
    toggle.setAttribute("aria-pressed", String(userPaused));
  };

  const stopTimer = () => {
    window.clearInterval(timer);
    timer = null;
  };

  const startTimer = () => {
    stopTimer();
    if (!shouldPause() && images.length > 1) {
      timer = window.setInterval(() => showSlide(current + 1), interval);
    }
  };

  function showSlide(index, announce = true) {
    current = (index + images.length) % images.length;
    images.forEach((image, imageIndex) => {
      const active = imageIndex === current;
      image.classList.toggle("is-active", active);
      image.setAttribute("aria-hidden", String(!active));
      image.tabIndex = active ? 0 : -1;
    });
    details.forEach((detail, detailIndex) => {
      const active = detailIndex === current;
      detail.classList.toggle("is-active", active);
      detail.setAttribute("aria-hidden", String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === current;
      dot.classList.toggle("is-active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    if (count) count.textContent = `${current + 1} of ${images.length}`;
    if (announce && status) {
      const title = details[current]?.querySelector("h3")?.textContent || "Graduation event photo";
      status.textContent = `Slide ${current + 1} of ${images.length}: ${title}`;
    }
    startTimer();
  }

  previous?.addEventListener("click", () => showSlide(current - 1));
  next?.addEventListener("click", () => showSlide(current + 1));
  dots.forEach((dot) => dot.addEventListener("click", () => showSlide(Number(dot.dataset.slideDot))));

  toggle?.addEventListener("click", () => {
    userPaused = !userPaused;
    updateToggle();
    startTimer();
  });

  slideshow.addEventListener("mouseenter", () => {
    pointerInside = true;
    stopTimer();
  });
  slideshow.addEventListener("mouseleave", () => {
    pointerInside = false;
    startTimer();
  });
  slideshow.addEventListener("focusin", () => {
    focusInside = true;
    stopTimer();
  });
  slideshow.addEventListener("focusout", (event) => {
    if (slideshow.contains(event.relatedTarget)) return;
    focusInside = false;
    startTimer();
  });
  slideshow.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(current - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(current + 1);
    }
  });
  slideshow.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  slideshow.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) < 50) return;
    showSlide(current + (distance < 0 ? 1 : -1));
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopTimer();
    else startTimer();
  });
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) userPaused = true;
    updateToggle();
    startTimer();
  });

  setSlideshowModalPause = (isOpen) => {
    modalOpen = isOpen;
    if (isOpen) stopTimer();
    else startTimer();
  };

  updateToggle();
  showSlide(0, false);
}

if (lightbox && lightboxImage && lightboxCaption && lightboxClose) {
  document.querySelectorAll("[data-lightbox-src]").forEach((button) => {
    button.addEventListener("click", () => {
      lightboxOpener = button;
      lightboxImage.src = button.dataset.lightboxSrc;
      lightboxImage.alt = button.dataset.lightboxAlt || "Graduation event photo";
      lightboxCaption.textContent = button.dataset.lightboxAlt || "";
      setSlideshowModalPause(true);
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
    setSlideshowModalPause(false);
    lightboxOpener?.focus();
  });
}
