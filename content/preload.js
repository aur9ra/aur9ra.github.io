async function getPageData(query, page) {
	const response = await fetch(page);
	const html = await response.text();
	const main_content = new DOMParser().parseFromString(html, "text/html").querySelector(query);
	
	return main_content;
}

async function setCurrentPageData(query, innerHTML_content) {
	document.querySelector(query).innerHTML = innerHTML_content;
}	

// get content map (link => content)
let contentMap = new Map();
const excludedProtocols = ["mailto:", "tel:", "javascript"]

async function updateContentMap() {
	var potentialLinks = [window.location, ...document.links]
	availableLinks = potentialLinks.filter(l => {
		const url = new URL(l.href);
		return url.protocol.startsWith("http") && !excludedProtocols.some(protocol => l.href.startsWith(protocol))
	});
	
	for (const link of availableLinks) {
		if (!contentMap.has(link.href)) {
			try {
				const data = await getPageData("#main_content", link.href)
				contentMap.set(link.href, data.innerHTML)
			} catch (e) {
				console.log(`Unable to obtain info for ${link.href}.`)
			}
		}
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	await updateContentMap()
})

function handleLinkNavigation(href) {
	const main_content = contentMap.get(href);
	if (main_content) {
		setCurrentPageData("#main_content", main_content);
		updateContentMap();
		history.pushState({}, "", href);
	}
}

function linkClickEventHandler(event) {
	const link = event.target.closest("a");

	event.preventDefault();
	if (!link) return;
	
	handleLinkNavigation(link.href);
}

if (window.PointerEvent) {
	document.addEventListener("pointerup", linkClickEventHandler);
} else {
	document.addEventListener("click", linkClickEventHandler);
}

// handle page navigation
window.addEventListener("popstate", () => {
	const content = contentMap.get(window.location.href)
	
	if (content) {
		setCurrentPageData("#main_content", content);
	} else {
		window.location.reload();
	}
});