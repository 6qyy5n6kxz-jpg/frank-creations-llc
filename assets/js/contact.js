import { trackConversion } from "./analytics.js";

const contactForm = document.querySelector("[data-contact-form]");
const contactFeedback = document.querySelector("[data-contact-feedback]");

if (contactForm && contactFeedback) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const serviceInputs = [...contactForm.querySelectorAll('input[name="requestedServices"]')];
  const query = new URLSearchParams(window.location.search);

  const eventTypeField = contactForm.querySelector('input[name="eventType"]');
  if (eventTypeField && query.has("eventType")) eventTypeField.value = query.get("eventType");

  const eventDateField = contactForm.querySelector('input[name="eventDate"]');
  if (eventDateField) {
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    eventDateField.min = localToday;
  }

  const sourcePageField = contactForm.querySelector("[data-source-page]");
  if (sourcePageField && query.has("source")) sourcePageField.value = query.get("source");

  const requestedServices = (query.get("services") || "").split(",").map((item) => item.trim()).filter(Boolean);
  requestedServices.forEach((service) => {
    const exact = serviceInputs.find((input) => input.value.toLowerCase() === service.toLowerCase());
    const related = serviceInputs.find((input) => service.toLowerCase().includes(input.value.toLowerCase()));
    if (exact || related) (exact || related).checked = true;

    const aliases = [];
    if (/booth/i.test(service)) aliases.push("Photo Booth");
    if (/tent/i.test(service)) aliases.push("High Peak Tent");
    if (/graduation celebration package/i.test(service)) aliases.push("High Peak Tent", "Photo Booth");
    if (/backyard party package/i.test(service)) aliases.push("High Peak Tent", "Event Audio / Speaker", "Wireless Microphone");
    if (/wedding enhancement package/i.test(service)) aliases.push("Photo Booth", "Uplighting", "Event Audio / Speaker", "Wireless Microphone");
    if (/complete outdoor celebration package/i.test(service)) aliases.push("High Peak Tent", "Photo Booth", "Uplighting", "Event Audio / Speaker", "Wireless Microphone");
    if (/speaker/i.test(service)) aliases.push("Event Audio / Speaker");
    if (/audio/i.test(service) && !/ceremony/i.test(service)) aliases.push("Event Audio / Speaker");
    if (/ceremony/i.test(service)) aliases.push("Ceremony Audio");
    if (/a change of plans|duo.*music|duo.*live/i.test(service)) aliases.push("Duo Live Music — A Change Of Plans");
    if (/solo.*music|solo.*live|devin.*frank/i.test(service)) aliases.push("Solo Live Music — Devin Frank");
    if (/live.*music|live.*event/i.test(service) && !/duo|solo|a change/i.test(service)) {
      // Default to duo for generic "live music" or "live event" references
      aliases.push("Duo Live Music — A Change Of Plans");
    }
    aliases.forEach((alias) => {
      const input = serviceInputs.find((item) => item.value === alias);
      if (input) input.checked = true;
    });
  });

  const estimateField = contactForm.querySelector("[data-estimated-total]");
  if (estimateField && query.has("estimate")) {
    const estimate = Number(query.get("estimate"));
    estimateField.value = Number.isFinite(estimate) ? `$${estimate.toLocaleString("en-US")}` : query.get("estimate");
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!serviceInputs.some((input) => input.checked)) {
      contactFeedback.textContent = "Choose at least one requested service, or select Not sure yet.";
      serviceInputs[0]?.focus();
      return;
    }

    // Paste your live Formspree endpoint into data-formspree-endpoint in contact.html.
    // Example: data-formspree-endpoint="https://formspree.io/f/yourFormId"
    const endpoint = contactForm.dataset.formspreeEndpoint;

    if (!endpoint || endpoint === "PASTE_YOUR_FORMSPREE_ENDPOINT_HERE") {
      contactFeedback.textContent = "Add your live Formspree endpoint in contact.html before using the contact form.";
      return;
    }

    const formData = new FormData(contactForm);
    formData.append("_subject", `Frank Creations LLC inquiry: ${formData.get("category") || "General"}`);
    formData.append("_replyto", `${formData.get("email") || ""}`);
    formData.append("recipient_email", contactForm.dataset.recipientEmail || "infotoledo@wineandcanvas.com");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Requesting Availability...";
    }

    contactFeedback.textContent = "Submitting your inquiry...";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        let errorMessage = "Your inquiry could not be sent. Please try again.";

        try {
          const errorPayload = await response.json();
          if (Array.isArray(errorPayload.errors) && errorPayload.errors.length) {
            errorMessage = errorPayload.errors.map((item) => item.message).join(" ");
          }
        } catch {
          // Use the default message when the response body is not JSON.
        }

        throw new Error(errorMessage);
      }

      const selectedServices = serviceInputs.filter((input) => input.checked).map((input) => input.value);
      trackConversion("contact_form_submission", {
        services: selectedServices.join(", ") || "Not sure yet",
        source: formData.get("sourcePage") || window.location.pathname
      });
      contactForm.reset();
      contactFeedback.textContent = "Thank you. Your inquiry was sent successfully, and someone will follow up soon.";
    } catch (error) {
      contactFeedback.textContent = error.message || "There was a problem sending your inquiry. Please try again in a few minutes.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Request Availability";
      }
    }
  });
}
