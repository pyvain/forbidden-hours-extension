const browserAPI = typeof browser !== "undefined" ? browser : chrome;

/*
Defaults
*/
const DEFAULT_START_TIME = "22:00";
const DEFAULT_END_TIME = "05:00";
const DEFAULT_DOMAINS = [
    ".youtube.com",
    ".twitch.tv",
    ".netflix.com"
];

function isNowForbidden(timeStartStr, timeEndStr) {
    const [startHours, startMinutes] = timeStartStr.split(":").map((s) =>  parseInt(s, 10));
    startTime = startHours + startMinutes / 60;

    const [endHours, endMinutes] = timeEndStr.split(":").map((s) =>  parseInt(s, 10));
    endTime = endHours + endMinutes / 60;

    const nowDate = new Date();
    const now = nowDate.getHours() + nowDate.getMinutes() / 60;

    // when startTime > endTime, endTime is the following day
    return (startTime <= endTime && startTime <= now && now <= endTime) || (startTime > endTime && (startTime <= now || now <= endTime))
}

function isURLForbidden(url, domains) {
    const domain = new URL(url).hostname;

    for (let forbidden of domains) {
        if (domain.endsWith(forbidden)) {
            return true;
        }
    }

    return false;
}

function checkTabs() {
    browserAPI.storage.local.get().then((settings) => {
        if (isNowForbidden(settings.forbiddenHours.timeStart, settings.forbiddenHours.timeEnd)) {
            browserAPI.tabs.query({}).then((tabs) => {
                for (let tab of tabs) {
                    if (isURLForbidden(tab.url, settings.forbiddenHours.domains)) {
                        browserAPI.tabs.remove(tab.id);
                    }
                }
            });
        }
    });
}

function onError(e) {
  console.error(e);
}

function checkStoredSettings(storedSettings) {
    if (storedSettings.forbiddenHours) {
        browserAPI.storage.local.set({
            forbiddenHours: {
                timeStart: storedSettings.forbiddenHours.timeStart || DEFAULT_START_TIME,
                timeEnd: storedSettings.forbiddenHours.timeEnd || DEFAULT_END_TIME,
                domains: storedSettings.forbiddenHours.domains || DEFAULT_DOMAINS
            }
        });
    } else {
        browserAPI.storage.local.set({
            forbiddenHours: {
                timeStart: DEFAULT_START_TIME,
                timeEnd: DEFAULT_END_TIME,
                domains: DEFAULT_DOMAINS
            }
        });
    }
}

console.log("Starting forbidden hours...")

browserAPI.storage.local.get().then(checkStoredSettings, onError);

browserAPI.tabs.onCreated.addListener(
    (tabId) => { checkTabs(); }
);

browserAPI.tabs.onUpdated.addListener(
    (tabId) => { checkTabs(); }
);

setInterval(checkTabs, 60000);
