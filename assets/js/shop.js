const shopGrid = document.querySelector("[data-shop-grid]");
const shopMeta = document.querySelector("[data-shop-meta]");
const shopFilter = document.querySelector("#shop-filter");
const reservePanel = document.querySelector("[data-shop-reserve-panel]");
const reserveSummary = document.querySelector("[data-shop-reserve-summary]");
const reservationForm = document.querySelector("[data-shop-reservation-form]");
const quantityField = document.querySelector("[data-shop-quantity]");
const shopFeedback = document.querySelector("[data-shop-feedback]");
const submitButton = reservationForm?.querySelector('button[type="submit"]');

const LOCAL_RESERVATION_KEY = "frank-creations-shop-reservations";
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const state = {
  category: "all",
  products: [],
  settings: {
    defaultPricing: {}
  },
  selectedId: null
};

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const readReservations = () => {
  try {
    const stored = localStorage.getItem(LOCAL_RESERVATION_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const writeReservations = (reservations) => {
  try {
    localStorage.setItem(LOCAL_RESERVATION_KEY, JSON.stringify(reservations));
  } catch {
    // Ignore localStorage failures and fall back to JSON inventory only.
  }
};

const getReservedCount = (productId) => {
  const reservations = readReservations();
  return Number(reservations[productId] || 0);
};

const getPriceValue = (item) => {
  if (typeof item.price === "number") {
    return item.price;
  }

  return Number(state.settings.defaultPricing?.[item.type] || 0);
};

const getPriceLabel = (item) => currencyFormatter.format(getPriceValue(item));

const getAvailableInventory = (item) => {
  const baseInventory = Number(item.inventory || 0);
  return Math.max(0, baseInventory - getReservedCount(item.id));
};

const getInventoryLabel = (item) => {
  const available = getAvailableInventory(item);

  if (available <= 0) {
    return "Sold out";
  }

  return `${available} available`;
};

const getFilteredProducts = () => {
  if (state.category === "all") {
    return state.products;
  }

  return state.products.filter((item) => item.category === state.category);
};

const setFeedback = (message = "") => {
  if (shopFeedback) {
    shopFeedback.textContent = message;
  }
};

const populateQuantityOptions = (available) => {
  if (!quantityField) {
    return;
  }

  quantityField.innerHTML = "";

  for (let count = 1; count <= available; count += 1) {
    const option = document.createElement("option");
    option.value = String(count);
    option.textContent = String(count);
    quantityField.append(option);
  }
};

const renderReservationSummary = (item) => {
  if (!reserveSummary) {
    return;
  }

  if (!item) {
    reserveSummary.innerHTML = "";
    return;
  }

  const available = getAvailableInventory(item);

  reserveSummary.innerHTML = `
    <article class="panel-card">
      <p class="card-kicker">${escapeHtml(item.category)}</p>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="shop-card-footer">
        <span class="shop-price">${escapeHtml(getPriceLabel(item))}</span>
        <span class="shop-inventory${available <= 0 ? " is-sold-out" : ""}">${escapeHtml(getInventoryLabel(item))}</span>
      </div>
      <p class="helper-text"><strong>Pickup:</strong> ${escapeHtml(item.pickup || "Local pickup only.")}</p>
    </article>
  `;
};

const selectProduct = (productId, options = {}) => {
  const item = state.products.find((product) => product.id === productId);

  if (!item || !reservationForm || !reservePanel || !submitButton) {
    return;
  }

  const available = getAvailableInventory(item);
  state.selectedId = item.id;

  renderReservationSummary(item);

  reservationForm.elements.itemId.value = item.id;
  reservationForm.elements.itemName.value = item.name;
  reservationForm.elements.itemCategory.value = item.category;
  reservationForm.elements.itemType.value = item.type;
  reservationForm.elements.unitPrice.value = getPriceLabel(item);

  populateQuantityOptions(available);

  submitButton.disabled = available <= 0;
  submitButton.textContent = available <= 0 ? "Sold Out" : "Reserve - Pay at Pickup";
  reservePanel.hidden = false;

  if (!options.preserveFeedback) {
    setFeedback("");
  }

  if (options.scroll) {
    reservePanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const renderShop = () => {
  if (!shopGrid) {
    return;
  }

  const filtered = getFilteredProducts();
  const availableUnits = filtered.reduce((total, item) => total + getAvailableInventory(item), 0);

  if (shopMeta) {
    shopMeta.textContent = `${filtered.length} listing${filtered.length === 1 ? "" : "s"} shown, ${availableUnits} piece${availableUnits === 1 ? "" : "s"} currently available for local pickup.`;
  }

  if (!filtered.length) {
    shopGrid.innerHTML = `
      <article class="shop-card">
        <h3>No items in this category</h3>
        <p>Try a different filter to view the current local pickup inventory.</p>
      </article>
    `;
    return;
  }

  shopGrid.innerHTML = filtered.map((item) => {
    const available = getAvailableInventory(item);
    const buttonLabel = available <= 0 ? "Sold Out" : "Reserve - Pay at Pickup";

    return `
      <article class="shop-card${available <= 0 ? " shop-card-sold-out" : ""}">
        <div class="shop-card-top">
          <p class="card-kicker">${escapeHtml(item.category)}</p>
          <span class="badge">Local pickup only</span>
        </div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.description)}</p>
        <div class="shop-card-footer">
          <span class="shop-price">${escapeHtml(getPriceLabel(item))}</span>
          <span class="shop-inventory${available <= 0 ? " is-sold-out" : ""}">${escapeHtml(getInventoryLabel(item))}</span>
        </div>
        <p class="shop-local-copy">${escapeHtml(item.pickup || "Local pickup only.")}</p>
        <div class="shop-card-actions">
          <button
            class="button button-primary"
            type="button"
            data-reserve-item="${escapeHtml(item.id)}"
            ${available <= 0 ? "disabled" : ""}
          >
            ${escapeHtml(buttonLabel)}
          </button>
        </div>
      </article>
    `;
  }).join("");
};

const handleReservationSubmit = async (event) => {
  event.preventDefault();

  if (!reservationForm || !submitButton) {
    return;
  }

  const endpoint = reservationForm.dataset.formspreeEndpoint;
  const item = state.products.find((product) => product.id === reservationForm.elements.itemId.value);

  if (!endpoint || !item) {
    setFeedback("Select an item before sending a reservation.");
    return;
  }

  const available = getAvailableInventory(item);
  const quantity = Number(reservationForm.elements.quantity.value || 0);

  if (!quantity || quantity > available) {
    setFeedback("That quantity is no longer available. Please choose a lower amount.");
    selectProduct(item.id, { preserveFeedback: true });
    return;
  }

  const formData = new FormData(reservationForm);
  const notes = (formData.get("notes") || "").toString().trim();
  const message = [
    "Shop reservation request",
    `Item: ${item.name}`,
    `Category: ${item.category}`,
    `Quantity: ${quantity}`,
    `Unit price: ${getPriceLabel(item)}`,
    `Pickup model: Reserve - Pay at Pickup`,
    `Pickup note: ${item.pickup || "Local pickup only."}`,
    notes ? `Customer notes: ${notes}` : ""
  ].filter(Boolean).join("\n");

  formData.append("_subject", `Shop reservation: ${item.name}`);
  formData.append("_replyto", `${formData.get("email") || ""}`);
  formData.append("category", "Shop Reservation");
  formData.append("recipient_email", reservationForm.dataset.recipientEmail || "infotoledo@wineandcanvas.com");
  formData.append("message", message);

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  setFeedback("Submitting your reservation...");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      let errorMessage = "Your reservation could not be sent. Please try again.";

      try {
        const errorPayload = await response.json();
        if (Array.isArray(errorPayload.errors) && errorPayload.errors.length) {
          errorMessage = errorPayload.errors.map((entry) => entry.message).join(" ");
        }
      } catch {
        // Keep the default error message when the response is not JSON.
      }

      throw new Error(errorMessage);
    }

    const reservations = readReservations();
    reservations[item.id] = (Number(reservations[item.id] || 0) + quantity);
    writeReservations(reservations);

    reservationForm.reset();
    renderShop();

    const remaining = getAvailableInventory(item);

    if (remaining > 0) {
      selectProduct(item.id, { preserveFeedback: true });
      setFeedback(`Reservation sent. ${remaining} ${remaining === 1 ? "piece remains" : "pieces remain"} for this listing in this browser. We will follow up about pickup.`);
    } else {
      renderReservationSummary(item);
      populateQuantityOptions(0);
      submitButton.disabled = true;
      submitButton.textContent = "Sold Out";
      setFeedback("Reservation sent. This listing is now sold out in this browser. We will follow up about pickup.");
    }
  } catch (error) {
    setFeedback(error.message || "There was a problem sending your reservation. Please try again.");
    submitButton.disabled = false;
    submitButton.textContent = "Reserve - Pay at Pickup";
  }
};

const loadShop = async () => {
  if (!shopGrid) {
    return;
  }

  try {
    const response = await fetch(window.resolveSitePath("data/shop.json"));

    if (!response.ok) {
      throw new Error(`Failed to load shop data: ${response.status}`);
    }

    const payload = await response.json();
    state.products = Array.isArray(payload.products) ? payload.products : [];
    state.settings = payload.settings || { defaultPricing: {} };

    const categories = [...new Set(state.products.map((item) => item.category))];

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      shopFilter?.append(option);
    });

    renderShop();

    shopFilter?.addEventListener("change", (event) => {
      state.category = event.target.value;
      renderShop();
    });

    shopGrid.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-reserve-item]");
      if (!trigger) {
        return;
      }

      selectProduct(trigger.dataset.reserveItem, { scroll: true });
    });

    reservationForm?.addEventListener("submit", handleReservationSubmit);
  } catch (error) {
    shopGrid.innerHTML = `
      <article class="shop-card">
        <h3>Catalog unavailable</h3>
        <p>The product data could not be loaded. Confirm <code>data/shop.json</code> exists and serve the site from a web server.</p>
      </article>
    `;
  }
};

loadShop();
