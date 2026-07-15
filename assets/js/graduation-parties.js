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
