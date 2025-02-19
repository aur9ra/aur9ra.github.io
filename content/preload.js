async function getPageData(page) {
	const response = await fetch(page);
	const html = await response.text();
	const main_content = new DOMParser().parseFromString(html, "text/html").querySelector("#main_content");
	
	return main_content;
}

async function setCurrentPageData(innerHTML_content) {
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
	const currentPage = await getPageData(window.location.href);
	if (currentPage) {
		contentMap.set(window.location.href, currentPage.innerHTML)
	}
})

document.addEventListener("click", event => {
	const link = event.target.closest("a");
	if (!link) return;
	
	event.preventDefault();
	const content = contentMap.get(link.href);
	
	if (content) {
		setCurrentPageData(content);
		updateContentMap();
		history.pushState({}, "", link.href);
	}
});

window.addEventListener("popstate", () => {
	const content = contentMap.get(window.location.href)
	if (content) {
		setCurrentPageData(content);
	} else {
		window.location.reload();
	}
});