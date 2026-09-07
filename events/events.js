let allEventsData = [];
let selectedYear = "ALL"; // "ALL" | specific year string e.g. "2026"
let availableYears = [];
let viewMode = "yearHub"; // "yearHub" | "yearEvents" | "upcoming"

async function fetchData() {
	try {
		const res = await fetch("./events.json?v=" + Date.now());
		const data = await res.json();
		allEventsData = data.events || [];

		allEventsData.sort((a, b) => {
			const dateA = new Date(`${a.date}T${a.time || a.startTime || "00:00"}`);
			const dateB = new Date(`${b.date}T${b.time || b.startTime || "00:00"}`);
			return dateB - dateA;
		});

		extractYears();
		attachListeners();
		injectModal();

		// Parse initial URL query params
		const urlParams = new URLSearchParams(window.location.search);
		const yearParam = urlParams.get("year");
		const viewParam = urlParams.get("view");

		if (yearParam && availableYears.includes(yearParam)) {
			selectedYear = yearParam;
			viewMode = "yearEvents";
		} else if (viewParam === "upcoming") {
			selectedYear = "ALL";
			viewMode = "upcoming";
		} else {
			viewMode = "yearHub";
			selectedYear = "ALL";
		}

		syncViewUI();
		window.addEventListener("popstate", handlePopState);
	} catch (err) {
		console.error("Failed to load events.json", err);
		document.getElementById("card-container").innerHTML =
			'<p style="color:#bbb;padding:24px;text-align:center">Failed to load events.</p>';
	}
}

function extractYears() {
	const yearsSet = new Set();
	const now = new Date();
	allEventsData.forEach((event) => {
		if (event.date) {
			const dt = new Date(`${event.date}T${event.time || event.startTime || "00:00"}`);
			if (!isNaN(dt) && dt <= now) {
				yearsSet.add(String(dt.getFullYear()));
			}
		}
	});
	availableYears = Array.from(yearsSet).sort((a, b) => b - a);
}

function attachListeners() {
	// Header back arrow button
	const backBtn = document.getElementById("back");
	if (backBtn) {
		backBtn.addEventListener("click", () => {
			if (viewMode !== "yearHub") {
				selectedYear = "ALL";
				viewMode = "yearHub";
				updateUrlState();
				syncViewUI();
			} else {
				window.location.href = "/";
			}
		});
	}
}

function handlePopState() {
	const urlParams = new URLSearchParams(window.location.search);
	const yearParam = urlParams.get("year");
	const viewParam = urlParams.get("view");

	if (yearParam && availableYears.includes(yearParam)) {
		selectedYear = yearParam;
		viewMode = "yearEvents";
	} else if (viewParam === "upcoming") {
		selectedYear = "ALL";
		viewMode = "upcoming";
	} else {
		selectedYear = "ALL";
		viewMode = "yearHub";
	}
	syncViewUI();
}

function updateUrlState() {
	const url = new URL(window.location.href);
	if (viewMode === "yearEvents" && selectedYear !== "ALL") {
		url.searchParams.set("year", selectedYear);
		url.searchParams.delete("view");
	} else if (viewMode === "upcoming") {
		url.searchParams.set("view", "upcoming");
		url.searchParams.delete("year");
	} else {
		url.searchParams.delete("year");
		url.searchParams.delete("view");
	}
	window.history.pushState({}, "", url.pathname + url.search);
}

function syncViewUI() {
	const yearHubContainer = document.getElementById("year-hub-container");
	const cardContainer = document.getElementById("card-container");
	const yearActiveBar = document.getElementById("year-active-bar");
	const activeYearTitle = document.getElementById("active-year-title");

	if (viewMode === "yearHub") {
		// Front Page
		if (yearHubContainer) yearHubContainer.style.display = "grid";
		if (cardContainer) cardContainer.style.display = "none";
		if (yearActiveBar) yearActiveBar.style.display = "none";

		renderYearHub();
	} else if (viewMode === "yearEvents") {
		// Second Page: Year Detail View
		if (yearHubContainer) yearHubContainer.style.display = "none";
		if (cardContainer) cardContainer.style.display = "flex";
		if (yearActiveBar) yearActiveBar.style.display = "flex";

		if (activeYearTitle) activeYearTitle.textContent = selectedYear;

		renderYearEvents();
	} else if (viewMode === "upcoming") {
		// Second Page: Upcoming Events View
		if (yearHubContainer) yearHubContainer.style.display = "none";
		if (cardContainer) cardContainer.style.display = "flex";
		if (yearActiveBar) yearActiveBar.style.display = "flex";

		if (activeYearTitle) activeYearTitle.textContent = "UPCOMING EVENTS";

		renderUpcomingEvents();
	}
}

function renderYearHub() {
	const container = document.getElementById("year-hub-container");
	if (!container) return;
	container.innerHTML = "";

	const now = new Date();

	// 1. Render UPCOMING EVENTS Card on Front Page
	const upcomingEvents = allEventsData
		.filter((e) => {
			const dt = new Date(`${e.date}T${e.time || e.startTime || "00:00"}`);
			return !isNaN(dt) && dt > now;
		})
		.sort((a, b) => {
			const dateA = new Date(`${a.date}T${a.time || a.startTime || "00:00"}`);
			const dateB = new Date(`${b.date}T${b.time || b.startTime || "00:00"}`);
			return dateA - dateB;
		});

	const upcomingCard = document.createElement("article");
	upcomingCard.className = "year-hub-card upcoming-hub-card";
	upcomingCard.style.transitionDelay = `0ms`;

	const nextUpcoming = upcomingEvents[0];
	const hasUpcoming = upcomingEvents.length > 0;

	upcomingCard.innerHTML = `
        <div class="year-card-top">
            <span class="year-card-number">UPCOMING</span>  
			</div>
        <div class="year-card-stats">
            <span class="year-stat-tag upcoming">● ${
							hasUpcoming ? `${upcomingEvents.length} Scheduled` : "No Events Scheduled"
						}</span>
        </div>
        ${
					nextUpcoming
						? `
        <div class="year-card-highlight">
            <span class="highlight-label">NEXT UPCOMING EVENT</span>
            <h3 class="highlight-title">${escapeHtml(nextUpcoming.name)}</h3>
            <p class="highlight-desc">${escapeHtml(nextUpcoming.description || "")}</p>
        </div>
        `
						: `
        <div class="year-card-highlight">
            <span class="highlight-label">STATUS</span>
            <h3 class="highlight-title">No upcoming events scheduled</h3>
        </div>
        `
				}
        <div class="year-card-action">
            <span>View Upcoming Events</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
        </div>
    `;

	upcomingCard.addEventListener("click", () => {
		selectedYear = "ALL";
		viewMode = "upcoming";
		updateUrlState();
		syncViewUI();
	});

	container.appendChild(upcomingCard);
	requestAnimationFrame(() => upcomingCard.classList.add("visible"));

	// 2. Render Year Cards (2026, 2025, etc.) on Front Page
	availableYears.forEach((year, index) => {
		const yearEvents = allEventsData.filter((e) => {
			const dt = new Date(`${e.date}T${e.time || e.startTime || "00:00"}`);
			return !isNaN(dt) && String(dt.getFullYear()) === year && dt <= now;
		});

		const totalCount = yearEvents.length;
		const topEvent = yearEvents[0];
		const accentColor = topEvent && topEvent.colorVal ? topEvent.colorVal : "#6C63FF";

		const card = document.createElement("article");
		card.className = "year-hub-card";
		card.style.transitionDelay = `${(index + 1) * 60}ms`;
		if (accentColor.includes("gradient")) {
			card.style.background = accentColor;
		} else {
			card.style.borderColor = accentColor;
		}

		card.innerHTML = `
            <div class="year-card-top">
                <span class="year-card-number">${escapeHtml(year)}</span>
                <span class="year-card-badge">${totalCount} ${totalCount === 1 ? "EVENT" : "EVENTS"}</span>
            </div>
            ${
							topEvent
								? `
            <div class="year-card-highlight">
                <span class="highlight-label">FEATURED EVENT</span>
                <h3 class="highlight-title">${escapeHtml(topEvent.name)}</h3>
                <p class="highlight-desc">${escapeHtml(topEvent.description || "")}</p>
            </div>
            `
								: ""
						}
            <div class="year-card-action">
                <span>View ${year} Events</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
            </div>
        `;

		card.addEventListener("click", () => {
			selectedYear = year;
			viewMode = "yearEvents";
			updateUrlState();
			syncViewUI();
		});

		container.appendChild(card);
		requestAnimationFrame(() => card.classList.add("visible"));
	});
}

function renderYearEvents() {
	const container = document.getElementById("card-container");
	if (!container) return;
	container.innerHTML = "";

	const now = new Date();
	const filtered = allEventsData.filter((e) => {
		const dt = new Date(`${e.date}T${e.time || e.startTime || "00:00"}`);
		return !isNaN(dt) && String(dt.getFullYear()) === selectedYear && dt <= now;
	});

	if (filtered.length === 0) {
		container.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <h3>No Events Found</h3>
                <p>There are no events listed for ${escapeHtml(selectedYear)}.</p>
            </div>
        `;
		return;
	}

	renderCardsGrid(filtered, container);
}

function renderUpcomingEvents() {
	const container = document.getElementById("card-container");
	if (!container) return;
	container.innerHTML = "";

	const now = new Date();
	const upcoming = allEventsData
		.filter((e) => {
			const dt = new Date(`${e.date}T${e.time || e.startTime || "00:00"}`);
			return !isNaN(dt) && dt > now;
		})
		.sort((a, b) => {
			const dateA = new Date(`${a.date}T${a.time || a.startTime || "00:00"}`);
			const dateB = new Date(`${b.date}T${b.time || b.startTime || "00:00"}`);
			return dateA - dateB;
		});

	if (upcoming.length === 0) {
		container.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <h3>No Upcoming Events</h3>
                <p>Stay tuned! New events will be announced soon.</p>
            </div>
        `;
		return;
	}

	renderCardsGrid(upcoming, container);
}

function renderCardsGrid(eventsList, container) {
	const grid = document.createElement("div");
	grid.className = "poster-grid";

	eventsList.forEach((event, idx) => {
		const hasSubEvents = Array.isArray(event.subEvents) && event.subEvents.length > 0;
		const card = buildCardEl(event, idx);

		if (hasSubEvents) {
			card.classList.add("has-sub-events");

			const badge = document.createElement("div");
			badge.className = "sub-events-badge";
			badge.title = `${event.subEvents.length} sub-events — click to view`;
			badge.innerHTML = `
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
                ${event.subEvents.length}`;
			card.appendChild(badge);

			const hint = document.createElement("div");
			hint.className = "sub-events-hint";
			hint.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Click to view sub-events`;
			card.querySelector(".card-body").appendChild(hint);

			card.addEventListener("click", () => openModal(event));
		}

		card.style.transitionDelay = `${(idx % 8) * 50}ms`;
		grid.appendChild(card);
	});

	container.appendChild(grid);
	observeCards();
}

function monthShortUpper(dateStr) {
	const d = new Date(dateStr);
	return isNaN(d)
		? ""
		: d.toLocaleString("en-US", { month: "short" }).toUpperCase();
}

function dayNumber(dateStr) {
	const d = new Date(dateStr);
	return isNaN(d) ? "" : String(d.getDate()).padStart(2, "0");
}

function escapeHtml(str) {
	if (!str && str !== 0) return "";
	return String(str)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function buildClubsHtml(clubs) {
	const valid = (clubs || []).filter((c) => c && c.trim() !== "");
	if (!valid.length) return "";
	return `<div class="event-clubs">
        <span class="clubs-label">Collabs:</span>
        ${valid.map((c) => `<span class="club-chip">${escapeHtml(c)}</span>`).join("")}
    </div>`;
}

function buildChambersHtml(chambers) {
	const valid = (chambers || []).filter((c) => c && c.trim() !== "");
	if (!valid.length) return "";
	return `<div class="event-chambers">
        <span class="chambers-label">Chamber:</span>
        ${valid
			.map(
				(id) =>
					`<span class="chamber-chip">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    ${escapeHtml(id)}
                </span>`,
			)
			.join("")}
    </div>`;
}

function buildCardEl(event, idx, isSubCard = false) {
	const card = document.createElement("article");
	card.className = "card" + (isSubCard ? " sub-card" : "");

	if (event.colorVal) card.style.background = event.colorVal;

	const timeStr = event.time || event.startTime || "00:00";
	const dateTimeStr = event.date ? `${event.date}T${timeStr}` : null;
	const month = dateTimeStr ? monthShortUpper(dateTimeStr) : "TBA";
	const day = dateTimeStr ? dayNumber(dateTimeStr) : "--";
	const year = dateTimeStr ? new Date(dateTimeStr).getFullYear() : "----";

	const clubsHtml = buildClubsHtml(event.clubs);
	const chambersHtml = buildChambersHtml(event.chamber);

	card.innerHTML = `
        <div class="vertical-month">${escapeHtml(month)}</div>
        <div class="date-group">
            <div class="big-date">${escapeHtml(day)}</div>
            <div class="vertical-year">${escapeHtml(year)}</div>
        </div>
        <div class="card-body">
            <div class="event-title">${escapeHtml(event.name)}</div>
            ${chambersHtml}
            ${clubsHtml}
            <div class="event-desc">${escapeHtml(event.description || "")}</div>
        </div>
    `;

	card.style.transitionDelay = `${idx * 50}ms`;
	return card;
}

function observeCards() {
	const cards = document.querySelectorAll(".card:not(.sub-card)");
	const observer = new IntersectionObserver(
		(entries, obs) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("visible");
					obs.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.05 },
	);
	cards.forEach((c) => observer.observe(c));
}

function injectModal() {
	if (document.getElementById("sub-events-modal")) return;

	const overlay = document.createElement("div");
	overlay.id = "sub-events-modal";
	overlay.setAttribute("role", "dialog");
	overlay.setAttribute("aria-modal", "true");
	overlay.setAttribute("aria-label", "Sub-events");
	overlay.innerHTML = `
        <div class="modal-sheet" id="modal-sheet">
            <div class="modal-header">
                <div class="modal-parent-info">
                    <span class="modal-label">SUB-EVENTS OF</span>
                    <h2 class="modal-title" id="modal-title"></h2>
                </div>
                <button class="modal-close" id="modal-close" aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-grid" id="modal-grid"></div>
        </div>
    `;

	document.body.appendChild(overlay);

	document.getElementById("modal-close").addEventListener("click", closeModal);
	overlay.addEventListener("click", (e) => {
		if (e.target === overlay) closeModal();
	});
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") closeModal();
	});
}

function openModal(parentEvent) {
	const overlay = document.getElementById("sub-events-modal");
	const title = document.getElementById("modal-title");
	const grid = document.getElementById("modal-grid");

	title.textContent = parentEvent.name;
	grid.innerHTML = "";

	const sheet = document.getElementById("modal-sheet");
	sheet.style.setProperty("--modal-accent", parentEvent.colorVal || "#ffffff");

	const sorted = [...(parentEvent.subEvents || [])].sort((a, b) => {
		return (
			new Date(`${a.date}T${a.time || a.startTime || "00:00"}`) -
			new Date(`${b.date}T${b.time || b.startTime || "00:00"}`)
		);
	});

	sorted.forEach((se, idx) => {
		if (!se.colorVal) se.colorVal = parentEvent.colorVal;
		const card = buildCardEl(se, idx, true);
		card.style.transitionDelay = `${80 + idx * 70}ms`;
		grid.appendChild(card);
	});

	overlay.classList.add("open");
	document.body.classList.add("modal-open");

	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			grid
				.querySelectorAll(".sub-card")
				.forEach((c) => c.classList.add("visible"));
		});
	});
}

function closeModal() {
	const overlay = document.getElementById("sub-events-modal");
	if (!overlay.classList.contains("open")) return;

	overlay.classList.remove("open");
	overlay.classList.add("closing");

	setTimeout(() => {
		overlay.classList.remove("closing");
		document.body.classList.remove("modal-open");
	}, 320);
}

document.addEventListener("DOMContentLoaded", fetchData);
