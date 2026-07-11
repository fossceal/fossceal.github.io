function elem(id) {
	return document.getElementById(id);
}
async function fetchandretjson() {
	return await fetch("/team/teamInfo.json")
		.then((response) => response.json())
		.then((data) => {
			return data;
		});
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

	for (let [platform, url] of Object.entries(socials)) {
		if (icons[platform]) {
			socialLinks += `
                <a href="${url}" target="_blank" class="social-icon ${platform}">
                    <i class="${icons[platform]}"></i>
                </a>`;
		}
	}

	return `
        <div id="${aqute}" class="teamBOXXX">
            <div class="teamName">${name}</div>
            <div class="teamRole">${role}</div>
            <img data-src="/teamPics/${pic}.webp" class="teamPic">
            <div class="shadow"></div>
			<div class="gifcase" data-gif="/teamGifs/${gif}" style="background-position: center;background-size: cover;"></div>

            <div class="socials">${socialLinks}</div>
        </div>
    `;
}


async function main() {
	let data = await fetchandretjson();

	if (data["2026"]) {
		let team2025 = elem("teamCont2026");
		data["2026"].forEach((member, i) => {
			team2025.innerHTML += generate(
				member.aqute,
				member.gif,
				member.name,
				member.role,
				member.pic,
				member.socials || {}
			);
		});
	}

	// if (data["2025"]) {
	// 	let team = elem("teamCont2025");
	// 	data["2025"].forEach((member, i) => {
	// 		team.innerHTML += generate(
	// 			member.aqute,
	// 			member.gif,
	// 			member.name,
	// 			member.role,
	// 			member.pic,
	// 			member.socials || {}
	// 		);
	// 	});
	// }
	// if (data["2023"]) {
	// 	let team = elem("teamCont2023");
	// 	data["2023"].forEach((member, i) => {
	// 		team.innerHTML += generate(
	// 			member.aqute,
	// 			member.gif,
	// 			member.name,
	// 			member.role,
	// 			member.pic,
	// 			member.socials || {}
	// 		);
	// 	});
	// }
	await load();
}

async function load() {

	for (const i of document.querySelectorAll(".teamBOXXX")) {
		const img = i.querySelector(".teamPic");
		const gifDiv = i.querySelector(".gifcase");

		await new Promise(resolve => {
			img.onload = resolve;
			img.onerror = resolve;
			img.src = img.dataset.src;
		});

		await new Promise(resolve => {
			const gifUrl = gifDiv.dataset.gif;
			const loader = new Image();

			loader.onload = () => {
				gifDiv.style.backgroundImage = `url('${gifUrl}')`;
				resolve();
			};

			loader.onerror = resolve;
			loader.src = gifUrl;
		});
	}
}
main();