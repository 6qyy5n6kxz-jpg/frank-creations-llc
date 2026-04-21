const contactForm = document.querySelector("[data-contact-form]");
const contactFeedback = document.querySelector("[data-contact-feedback]");

if (contactForm && contactFeedback) {
  const submitButton = contactForm.querySelector('button[type="submit"]');

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
