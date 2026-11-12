function elem(id) {
	return document.getElementById(id);
}

async function fetchandretjson() {
	try {
		const response = await fetch("/team/teamInfo.json");
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return await response.json();
	} catch (err) {
		console.error("Failed to load team data:", err);
		return null;
	}
}

function generate(aqute, gif, name, role, pic, socials = {}) {
	let socialLinks = "";
	const icons = {
		linkedin: "fa-brands fa-linkedin-in",
		github: "fa-brands fa-github",
		instagram: "fa-brands fa-instagram",
		facebook: "fa-brands fa-facebook-f",
		website: "fa-solid fa-globe",
		email: "fa-solid fa-envelope",
		hrb_customs: "fa-solid fa-cube"
	};

	for (const [platform, url] of Object.entries(socials)) {
		if (icons[platform]) {
			socialLinks += `
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="social-icon ${platform}">
                    <i class="${icons[platform]}"></i>
                </a>`;
		}
	}

	const cleanGif = (gif || "").replace(/^\/+/, "");
	const cleanPic = (pic || "").replace(/^\/+/, "");

	return `
        <div id="${aqute}" class="teamBOXXX">
            <div class="teamName">${name}</div>
            <div class="teamRole">${role}</div>
            <img src="/teamPics/${cleanPic}.webp" class="teamPic" loading="lazy" decoding="async" alt="${name}">
            <div class="shadow"></div>
            <div class="gifcase" data-gif="/teamGifs/${cleanGif}" style="background-position: center; background-size: cover;"></div>
            <div class="socials">${socialLinks}</div>
        </div>
    `;
}

async function main() {
	const data = await fetchandretjson();
	if (!data) return;

	const renderYear = (yearKey, contId) => {
		const container = elem(contId);
		if (container && Array.isArray(data[yearKey])) {
			container.innerHTML = data[yearKey]
				.map((member) =>
					generate(
						member.aqute,
						member.gif,
						member.name,
						member.role,
						member.pic,
						member.socials || {}
					)
				)
				.join("");
		}
	};

	renderYear("2026", "teamCont2026");
	renderYear("2025", "teamCont2025");
	renderYear("2023", "teamCont2023");

	initGifLoader();
}

function initGifLoader() {
	const cards = document.querySelectorAll(".teamBOXXX");
	if (!cards.length) return;

	const loadedUrls = new Set();
	const activePromises = new Map();

	function loadGifForCard(card) {
		const gifDiv = card.querySelector(".gifcase");
		if (!gifDiv) return;

		const gifUrl = gifDiv.dataset.gif;
		if (!gifUrl || gifDiv.dataset.loaded === "true") return;

		if (loadedUrls.has(gifUrl)) {
			gifDiv.style.backgroundImage = `url('${gifUrl}')`;
			gifDiv.dataset.loaded = "true";
			return;
		}

		if (activePromises.has(gifUrl)) {
			activePromises.get(gifUrl).then((resolvedUrl) => {
				if (resolvedUrl) {
					gifDiv.style.backgroundImage = `url('${resolvedUrl}')`;
					gifDiv.dataset.loaded = "true";
				}
			});
			return;
		}

		const promise = new Promise((resolve) => {
			const loader = new Image();
			loader.onload = () => {
				loadedUrls.add(gifUrl);
				resolve(gifUrl);
			};
			loader.onerror = () => {
				// Fallback: if WebP fails, try original GIF
				if (gifUrl.endsWith(".webp")) {
					const fallbackGif = gifUrl.replace(/\.webp$/, ".gif");
					const fbImg = new Image();
					fbImg.onload = () => {
						loadedUrls.add(fallbackGif);
						resolve(fallbackGif);
					};
					fbImg.onerror = () => resolve(null);
					fbImg.src = fallbackGif;
				} else {
					resolve(null);
				}
			};
			loader.src = gifUrl;
		});

		activePromises.set(gifUrl, promise);

		promise.then((resolvedUrl) => {
			if (resolvedUrl) {
				gifDiv.style.backgroundImage = `url('${resolvedUrl}')`;
				gifDiv.dataset.loaded = "true";
			}
		});
	}

	// 1. Instant load on interaction (hover, touch, focus)
	cards.forEach((card) => {
		const trigger = () => loadGifForCard(card);
		card.addEventListener("pointerenter", trigger, { passive: true, once: true });
		card.addEventListener("touchstart", trigger, { passive: true, once: true });
		card.addEventListener("focus", trigger, { passive: true, once: true });
	});

	// 2. Intelligent background preloading for visible cards
	if ("IntersectionObserver" in window) {
		const queue = [];
		let running = 0;
		const MAX_CONCURRENT = 3;

		function pumpQueue() {
			while (running < MAX_CONCURRENT && queue.length > 0) {
				const card = queue.shift();
				const gifDiv = card.querySelector(".gifcase");
				if (!gifDiv || gifDiv.dataset.loaded === "true") continue;

				const gifUrl = gifDiv.dataset.gif;
				if (loadedUrls.has(gifUrl)) {
					gifDiv.style.backgroundImage = `url('${gifUrl}')`;
					gifDiv.dataset.loaded = "true";
					continue;
				}

				running++;
				loadGifForCard(card);
				const p = activePromises.get(gifUrl);
				if (p) {
					p.finally(() => {
						running--;
						pumpQueue();
					});
				} else {
					running--;
				}
			}
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						observer.unobserve(entry.target);
						queue.push(entry.target);
						pumpQueue();
					}
				});
			},
			{ rootMargin: "300px 0px" }
		);

		const schedulePreload = () => {
			cards.forEach((card) => observer.observe(card));
		};

		if (document.readyState === "complete") {
			setTimeout(schedulePreload, 150);
		} else {
			window.addEventListener("load", () => setTimeout(schedulePreload, 150));
		}
	}
}

main();
