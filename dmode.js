function el(id) {
	return document.getElementById(id);
}
function ec(cl) {
	return document.getElementsByClassName(cl);
}
async function sl(t) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, t);
	});
}

async function loadup() {
	if (localStorage.getItem("dmode") == "enabled") {
		// Universal checks
		if (el("h1n1")) el("h1n1").setAttribute("href", "/style_dark.css");
		if (el("headerLogo")) el("headerLogo").setAttribute("src", "/Evantage_light_HZ.png");

		// "Home-like" portal pages
		if (el("dm1")) el("dm1").setAttribute("src", "/dMd_white.png");

		let r = ec("arrWW");
		if (r && r.length > 0) {
			for (let i = 0; i < r.length; i++) {
				r[i].setAttribute("src", "/arrFWD_black.png");
			}
		}

		// Sub-pages with back button
		if (el("back")) el("back").setAttribute("src", "/arrBWD_white.png");

		await sl(200);
		document.body.style.opacity = 1;
	} else if (localStorage.getItem("dmode") == "disabled") {
		await sl(200);
		document.body.style.opacity = 1;
	} else {
		localStorage.setItem("dmode", "disabled");
		await sl(200);

		document.body.style.opacity = 1;
	}
}
loadup();

if (el("dad_toggle")) {
	el("dad_toggle").addEventListener("click", function () {
		if (localStorage.getItem("dmode") == "enabled") {
			localStorage.setItem("dmode", "disabled");
			location.reload();
		} else {
			localStorage.setItem("dmode", "enabled");
			location.reload();
		}
	});
}
