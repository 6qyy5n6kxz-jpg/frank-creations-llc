const contactForm = document.querySelector("[data-contact-form]");
const contactFeedback = document.querySelector("[data-contact-feedback]");

if (contactForm && contactFeedback) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const serviceInputs = [...contactForm.querySelectorAll('input[name="requestedServices"]')];
  const conditionalSections = [...contactForm.querySelectorAll("[data-conditional]")];
  const query = new URLSearchParams(window.location.search);

  const eventTypeField = contactForm.querySelector('input[name="eventType"]');
  if (eventTypeField && query.has("eventType")) eventTypeField.value = query.get("eventType");

  const sourcePageField = contactForm.querySelector("[data-source-page]");
  if (sourcePageField && query.has("source")) sourcePageField.value = query.get("source");

  const updateConditionalFields = () => {
    const selected = serviceInputs.filter((input) => input.checked).map((input) => input.value);
    conditionalSections.forEach((section) => {
      const key = section.dataset.conditional;
      section.hidden = !selected.some((service) => service.includes(key));
    });
  };

  const requestedServices = (query.get("services") || "").split(",").map((item) => item.trim()).filter(Boolean);
  requestedServices.forEach((service) => {
    const exact = serviceInputs.find((input) => input.value.toLowerCase() === service.toLowerCase());
    const related = serviceInputs.find((input) => service.toLowerCase().includes(input.value.toLowerCase()));
    if (exact || related) (exact || related).checked = true;

    const aliases = [];
    if (/booth/i.test(service)) aliases.push("Photo Booth");
    if (/tent/i.test(service)) aliases.push("High Peak Tent");
    if (/graduation celebration package/i.test(service)) aliases.push("High Peak Tent", "Photo Booth");
    if (/backyard party package/i.test(service)) aliases.push("High Peak Tent", "Speaker", "Wireless Microphone");
    if (/wedding enhancement package/i.test(service)) aliases.push("Photo Booth", "Uplighting", "Speaker", "Wireless Microphone");
    if (/complete outdoor celebration package/i.test(service)) aliases.push("High Peak Tent", "Photo Booth", "Uplighting", "Speaker", "Wireless Microphone");
    if (/live event package/i.test(service)) aliases.push("A Change Of Plans Duo", "Photo Booth");
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

  serviceInputs.forEach((input) => input.addEventListener("change", updateConditionalFields));
  updateConditionalFields();

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

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
      submitButton.textContent = "Sending...";
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

      contactForm.reset();
      updateConditionalFields();
      contactFeedback.textContent = "Thank you. Your inquiry was sent successfully, and someone will follow up soon.";
    } catch (error) {
      contactFeedback.textContent = error.message || "There was a problem sending your inquiry. Please try again in a few minutes.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Inquiry";
      }
    }
  });
}
