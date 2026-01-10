let allEventsData = [];

async function fetchData() {
    try {
        const res = await fetch('./events.json?v=' + Date.now());
        const data = await res.json();
        allEventsData = data.events || [];

        // Sort descending by date (latest first)
        allEventsData.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB - dateA;
        });

        createCards(allEventsData);
        attachDateSorting();
    } catch (err) {
        console.error('Failed to load events.json', err);
        document.getElementById('card-container').innerHTML = '<p style="color:#bbb;padding:24px">Failed to load events.</p>';
    }
}

function monthShortUpper(dateString) {
    const d = new Date(dateString);
    if (isNaN(d)) return '';
    return d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
}
function dayNumber(dateString) {
    const d = new Date(dateString);
    if (isNaN(d)) return '';
    return String(d.getDate()).padStart(2, '0');
}
function dateShort(dateString) {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function createCards(events) {
    const container = document.getElementById('card-container');
    container.innerHTML = '';

    events.forEach((event, idx) => {
        const card = document.createElement('article');
        card.className = `card`;

        // Use color from JSON if available
        if (event.colorVal) {
            card.style.background = event.colorVal;
        }

        const dateTimeStr = event.date ? `${event.date}T${event.time}` : null;
        const month = dateTimeStr ? monthShortUpper(dateTimeStr) : 'TBA';
        const day = dateTimeStr ? dayNumber(dateTimeStr) : '--';
        const iconClass = event.icon || 'fa-calendar-day';
        const year = dateTimeStr ? new Date(dateTimeStr).getFullYear() : '----';

        // Generate Clubs HTML
        let clubsHtml = '';
        const validClubs = (event.clubs || []).filter(c => c && c.trim() !== '');
        if (validClubs.length > 0) {
            clubsHtml = `<div class="event-clubs">
                <span class="clubs-label">Clubs:</span>
                ${validClubs.map(c => `<span class="club-chip">${escapeHtml(c)}</span>`).join('')}
            </div>`;
        }

        card.innerHTML = `
            <div class="vertical-month">
                ${escapeHtml(month)}
            </div>

            <div class="date-group">
                <div class="big-date">${escapeHtml(day)}</div>
                <div class="vertical-year">${escapeHtml(year)}</div>
            </div>

            <div class="card-body">
                <div class="event-title">${escapeHtml(event.name)}</div>
                ${clubsHtml}
                <div class="event-desc">${escapeHtml(event.description || '')}</div>
            </div>
        `;

        // Add subtle animation delay based on index
        card.style.transitionDelay = `${idx * 50}ms`;
        container.appendChild(card);
    });

    observeCards();
}

/* IntersectionObserver reveal */
function observeCards() {
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    cards.forEach(c => observer.observe(c));
}

/* Filtering buttons with smooth transition */
function attachDateSorting() {
    const btnAll = document.querySelector('.all-events');
    const btnUp = document.querySelector('.upcoming-events');
    const btnPast = document.querySelector('.past-events');

    const switchFilter = (selector, filterFn) => {
        const btn = document.querySelector(selector);
        if (!btn) return;

        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;

            setActiveButton(selector);
            const container = document.getElementById('card-container');
            container.classList.add('fade-out');

            setTimeout(() => {
                const filtered = filterFn ? allEventsData.filter(filterFn) : allEventsData;
                createCards(filtered);
                container.classList.remove('fade-out');
            }, 300);
        });
    };

    switchFilter('.all-events', null);
    switchFilter('.upcoming-events', e => {
        const dateTime = new Date(`${e.date}T${e.time}`);
        return !isNaN(dateTime) && dateTime > new Date();
    });
    switchFilter('.past-events', e => {
        const dateTime = new Date(`${e.date}T${e.time}`);
        return !isNaN(dateTime) && dateTime < new Date();
    });
}

function setActiveButton(selector) {
    document.querySelectorAll('.nav-buttons button').forEach(b => b.classList.remove('active'));
    const el = document.querySelector(selector);
    if (el) el.classList.add('active');
}

/* small utility: escape text */
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

/* init */
document.addEventListener('DOMContentLoaded', fetchData);
