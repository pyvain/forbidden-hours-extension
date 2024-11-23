const browserAPI = typeof browser !== "undefined" ? browser : chrome;

const timeStartInput = document.querySelector("#time-start");
const timeEndInput = document.querySelector("#time-end");
const domainsInput = document.querySelector("#domains");

/*
Log errors
*/
function onError(e) {
    console.error(e);
}

/*
Store the currently selected settings using browser.storage.local.
*/
function storeSettings() {
    var domains = [];
    for (let domain of domainsInput.value.split("\n")) {
        if (domain.length > 0) {
            domains.push(domain)
        }
    }

    browserAPI.storage.local.set({
        forbiddenHours: {
            timeStart: timeStartInput.value,
            timeEnd: timeEndInput.value,
            domains: domains
        }
    });
}

/*
Update the options UI with the settings values retrieved from storage,
or the default settings if the stored settings are empty.
*/
function updateUI(restoredSettings) {
    timeStartInput.value = restoredSettings.forbiddenHours.timeStart;
    timeEndInput.value = restoredSettings.forbiddenHours.timeEnd;
    domainsInput.value = restoredSettings.forbiddenHours.domains.join("\n");
}

/*
On opening the options page, fetch stored settings and update the UI with them.
*/
const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(updateUI, onError);

/*
On blur, save the currently selected settings.
*/
timeStartInput.addEventListener("blur", storeSettings);
timeEndInput.addEventListener("blur", storeSettings);
domainsInput.addEventListener("blur", storeSettings);
