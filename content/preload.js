async function getPageData(query, page) {
	const response = await fetch(page);
	const html = await response.text();
	const main_content = new DOMParser().parseFromString(html, "text/html").querySelector(query);
	
	return main_content;
}

async function setCurrentPageData(query, innerHTML_content) {
	document.querySelector("#main_content").innerHTML = innerHTML_content;
}	

// get content map (link => content)
let contentMap = new Map();

async function updateContentMap() {
	for (const link of document.links) {
		if (!contentMap.has(link.href)) {
			const data = await getPageData(link.href)
			contentMap.set(link.href, data.innerHTML)
		}
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	await updateContentMap()
	
	// cache current page, too
	const currentPageMainContent = await getPageData(window.location.href, "#main_content");
	const currentPageHeadContent = await getPageData(window.location.href, "head");
	if (currentPage) {
		contentMap.set(window.location.href, currentPageMainContent.innerHTML)
		headMap.set(window.location.href, currentPageHeadContent.innerHTML)
	}
})

function handleLinkNavigation(href) {
	const head_content = headMap.get(href);
	const main_content = contentMap.get(href);
	if (content) {
		setCurrentPageData("#main_content", main_content);
		updateContentMap();
		history.pushState({}, "", href);
	}
}

function linkClickEventHandler(event) {
	const link = event.target.closest("a");
	if (!link) return;
	
	event.preventDefault();
	handleLinkNavigation(link.href);
}

if (window.PointerEvent) {
	document.addEventListener("pointerup", linkClickEventHandler);
} else {
	document.addEventListener("click", linkClickEventHandler);
}

window.addEventListener("popstate", () => {
	const content = contentMap.get(window.location.href)
	if (content) {
		setCurrentPageData(content);
	} else {
		window.location.reload();
	}
});