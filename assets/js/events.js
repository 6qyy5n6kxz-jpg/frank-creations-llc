const eventsContainer = document.querySelector("[data-events-list]");
const summaryTarget = document.querySelector("[data-events-summary]");

const formatDate = (dateValue) => {
  const date = new Date(`${dateValue}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
};

const getTodayKey = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getEventHeadline = (event) => event.venue || event.location || event.title || "Venue details coming soon";

const renderDescription = (description) => description
  ? `<p>${description}</p>`
  : "";

const renderEvents = async () => {
  if (!eventsContainer) {
    return;
  }

  try {
    const response = await fetch(window.resolveSitePath("data/events.json"));
    if (!response.ok) {
      throw new Error(`Failed to load events: ${response.status}`);
    }

    const payload = await response.json();
    const category = eventsContainer.dataset.eventCategory || "music";
    const todayKey = getTodayKey();
    const items = (Array.isArray(payload.events) ? payload.events : [])
      .filter((event) => event.category === category)
      .filter((event) => event.date >= todayKey)
      .sort((left, right) => left.date.localeCompare(right.date));

    if (summaryTarget) {
      if (items.length) {
        const nextEvent = items[0];
        summaryTarget.innerHTML = `
          <p>${items.length} upcoming ${category} event${items.length === 1 ? "" : "s"} listed.</p>
          <p><strong>Next up:</strong> ${formatDate(nextEvent.date)} at ${getEventHeadline(nextEvent)}.</p>
        `;
      } else {
        summaryTarget.innerHTML = `<p>No upcoming ${category} events are listed right now. Check back soon for new dates.</p>`;
      }
    }

    if (!items.length) {
      eventsContainer.innerHTML = `
        <article class="event-card">
          <h3>More dates coming soon</h3>
          <p>Follow A Change Of Plans on social media or check back here for the next public performance dates.</p>
        </article>
      `;
      return;
    }

    eventsContainer.innerHTML = items.map((event) => `
      <article class="event-card">
        <div class="event-date">${formatDate(event.date)}</div>
        <h3>${getEventHeadline(event)}</h3>
        ${renderDescription(event.description)}
        <p><strong>Time:</strong> ${event.time}</p>
      </article>
    `).join("");
  } catch (error) {
    eventsContainer.innerHTML = `
      <article class="event-card">
        <h3>Schedule unavailable</h3>
        <p>The event data could not be loaded. Verify that <code>data/events.json</code> is present and that the page is being served through a local or hosted web server rather than opened as a <code>file://</code> URL.</p>
      </article>
    `;
    console.error("Unable to render events schedule.", error);
  }
};

renderEvents();
