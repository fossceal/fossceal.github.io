let allEventsData = [];

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

		createCards(allEventsData);
		attachDateSorting();
		injectModal();
	} catch (err) {
		console.error("Failed to load events.json", err);
		document.getElementById("card-container").innerHTML =
			'<p style="color:#bbb;padding:24px">Failed to load events.</p>';
	}
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

	card.style.transitionDelay = `${idx * 60}ms`;
	return card;
}

function createCards(events) {
	const container = document.getElementById("card-container");
	container.innerHTML = "";

	events.forEach((event, idx) => {
		const hasSubEvents =
			Array.isArray(event.subEvents) && event.subEvents.length > 0;

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

		card.style.transitionDelay = `${idx * 50}ms`;
		container.appendChild(card);
	});

	observeCards();
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
		{ threshold: 0.08 },
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

function attachDateSorting() {
	const switchFilter = (selector, filterFn) => {
		const btn = document.querySelector(selector);
		if (!btn) return;
		btn.addEventListener("click", () => {
			if (btn.classList.contains("active")) return;
			setActiveButton(selector);
			const container = document.getElementById("card-container");
			container.classList.add("fade-out");
			setTimeout(() => {
				const filtered = filterFn
					? allEventsData.filter(filterFn)
					: allEventsData;
				createCards(filtered);
				container.classList.remove("fade-out");
			}, 300);
		});
	};

	switchFilter(".all-events", null);
	switchFilter(".upcoming-events", (e) => {
		const dt = new Date(`${e.date}T${e.time || e.startTime || "00:00"}`);
		return !isNaN(dt) && dt > new Date();
	});
	switchFilter(".past-events", (e) => {
		const dt = new Date(`${e.date}T${e.time || e.startTime || "00:00"}`);
		return !isNaN(dt) && dt < new Date();
	});
}

function setActiveButton(selector) {
	document
		.querySelectorAll(".nav-buttons button")
		.forEach((b) => b.classList.remove("active"));
	const el = document.querySelector(selector);
	if (el) el.classList.add("active");
}

document.addEventListener("DOMContentLoaded", fetchData);
