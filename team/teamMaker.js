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

function generate(aqute, gif, name, role, pic, row, col, i, socials = {}) {
    let socialLinks = "";
    const icons = {
        linkedin: "fa-brands fa-linkedin-in",
        github: "fa-brands fa-github",
        instagram: "fa-brands fa-instagram",
        facebook: "fa-brands fa-facebook-f",
        website: "fa-solid fa-globe" ,
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
            <img src="/teamPics/${pic}.webp" class="teamPic">
            <div class="shadow"></div>
            <div class="gifcase" style="background: url('/teamGifs/${gif}');background-position: center;background-size: cover;"></div>

            <div class="socials">${socialLinks}</div>
        </div>
    `;
}


async function main() {
	let data = await fetchandretjson();
// Added execom 2025 section

	if (data["2026"]) {
		let team2025 = elem("teamCont2026");
		data["2026"].forEach((member, i) => {
			team2025.innerHTML += generate(
				member.aqute,
				member.gif,
				member.name,
				member.role,
				member.pic,
				Math.floor(i / 5) + 1,
				(i % 5) + 1,
				i,
				member.socials || {}
			);
		});
	}

	if (data["2025"]) {
		let team = elem("teamCont");
		data["2025"].forEach((member, i) => {
			team.innerHTML += generate(
				member.aqute,
				member.gif,
				member.name,
				member.role,
				member.pic,
				Math.floor(i / 5) + 1,
				(i % 5) + 1,
				i
			);
		});
	}
}

main();

function test() {
	for (let i = 0; i < 20; i++) {
		let col = (i % 5) + 1;
		let row = Math.floor(i / 5) + 1;
		console.log(row, col);
	}
}

// added a if statement for execom separatin