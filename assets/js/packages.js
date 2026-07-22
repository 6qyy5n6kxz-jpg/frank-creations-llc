import { trackConversion } from "./analytics.js";

const builder = document.querySelector("[data-package-builder]");

if (builder) {
  const inputs = [...builder.querySelectorAll('input[type="checkbox"]')];
  const totalOutput = document.querySelector("[data-builder-total]");
  const selectionOutput = document.querySelector("[data-builder-selection]");
  const customNote = document.querySelector("[data-builder-custom]");
  const inquiryLink = document.querySelector("[data-builder-cta]");

  const updateEstimate = () => {
    const selected = inputs.filter((input) => input.checked);
    const hasSpeaker = selected.some((input) => input.dataset.service === "speaker");
    const hasCustom = selected.some((input) => input.dataset.price === "quote");
    const total = selected.reduce((sum, input) => {
      if (input.dataset.price === "quote") return sum;
      if (input.dataset.service === "microphone" && hasSpeaker) {
        return sum + Number(input.dataset.bundledPrice);
      }
      return sum + Number(input.dataset.price);
    }, 0);
    const names = selected.map((input) => input.value);

    totalOutput.textContent = `$${total.toLocaleString("en-US")}${hasCustom ? "+" : ""}`;
    selectionOutput.textContent = names.length ? names.join(", ") : "No services selected yet.";
    customNote.hidden = !hasCustom;

    const query = new URLSearchParams();
    if (names.length) query.set("services", names.join(", "));
    query.set("estimate", String(total));
    inquiryLink.href = `../contact/?${query.toString()}`;
  };

  inputs.forEach((input) => input.addEventListener("change", updateEstimate));
  inquiryLink.addEventListener("click", () => {
    const selected = inputs.filter((input) => input.checked).map((input) => input.value);
    trackConversion("package_builder_transfer", {
      services: selected.join(", ") || "No services selected",
      estimate: totalOutput.textContent
    });
  });
  updateEstimate();
}
