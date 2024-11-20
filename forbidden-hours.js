const browserAPI = typeof browser !== "undefined" ? browser : chrome;

const FORBIDDEN_DOMAINS = [
    ".youtube.com",
    ".twitch.tv",
    ".netflix.com"
];

// allowed time range: 5:00 to 21:59
function isNowForbidden() {
    const now = new Date();
    let hour = now.getHours();

    return hour < 5 || hour >= 22;
}

function isURLForbidden(url) {
    const domain = new URL(url).hostname;

    for (let forbidden of FORBIDDEN_DOMAINS) {
        if (domain.endsWith(forbidden)) {
            return true;
        }
    }

    return false;
}

function checkTime() {
    if (! isNowForbidden()) {
        return;
    }

    browserAPI.tabs.query({}).then((tabs) => {
        for (let tab of tabs) {
            if (isURLForbidden(tab.url)) {
                browserAPI.tabs.remove(tab.id);
            }
        }
    });
}

function onTabChanged(tabId) {
    if (! isNowForbidden()) {
        return;
    }

    browserAPI.tabs.get(tabId).then((tab) => {
        if (isURLForbidden(tab.url)) {
            browserAPI.tabs.remove(tab.id);
        }
    });
}

browserAPI.tabs.onCreated.addListener(
    (tabId) => { onTabChanged(tabId); }
);

browserAPI.tabs.onUpdated.addListener(
    (tabId) => { onTabChanged(tabId); }
);

console.log("Starting forbidden hours...")
setInterval(checkTime, 60000);
