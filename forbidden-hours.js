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
    console.log(domain);

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
    console.log("Time's up! Go to sleep!");

    browserAPI.tabs.query({}).then((tabs) => {
        for (let tab of tabs) {
            if (isURLForbidden(tab.url)) {
                browserAPI.tabs.remove(tab.id);
            }
        }
    });
}

console.log("Starting forbidden hours...")
setInterval(checkTime, 60000);
