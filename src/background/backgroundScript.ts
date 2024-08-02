// Api Stuffs here
import {
    factCheckWithGenerateQueries, factCheckWithoutGenerateQueries
} from "../utils/api_fight_misinfo";


// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'factCheck') {
        factCheck(request.text);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'UPDATE_FACT') {
        updateFactCheck(request.hypothesis).then(response => {
            sendResponse(response);
        }).catch(error => {
            console.error('Error:', error);
            sendResponse({ error: error.message });
        });
        return true;
    }
});

// notification for health reminders
// Set an alarm to trigger every hour
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('healthReminder', { periodInMinutes: 60 * 2 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'healthReminder') {
        checkAndNotify();
    }
});

chrome.runtime.onStartup.addListener(() => {
    checkAndNotify();
});


// For Browser Window Right Click Context Menu
// Add Remove to avoid duplicates creation of context menu
chrome.contextMenus.remove("extHealth", () => {
  
     // Ignore if there's an error when removing the context menu item
     if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
    }

    chrome.contextMenus.create({
        id: "extHealth",
        title: "Check Health Information",
        contexts: ["selection"]
    }, function() {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        } else {
            console.log("Context Menu item created successfully!");
        }
    });
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "extHealth") {
        factCheck(info.selectionText);
    }
});

// fact checking function
async function updateFactCheck(text){    
    let response = await factCheckWithoutGenerateQueries(text);
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Fact Check Ready!!',
        message: "Your request has been processed. Please check out the results in the extension popup.",
        priority: 2
        });
    return response;
}


async function factCheck(text) {
    let response = await factCheckWithGenerateQueries(text);
    chrome.storage.local.set({ extHealthFacts: response });
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Fact Check Ready!!',
        message: "Your request has been processed. Please check out the results in the extension popup.",
        priority: 2
        });
}



// For health reminders
function checkAndNotify() {
    const now = Date.now();
    chrome.storage.local.get(['lastNotificationTime'], (result) => {
        const lastNotificationTime = result.lastNotificationTime || 0;
        const time = 60 * 60 * 1000 * 2;
        // const tenSeconds = 10 * 1000;

        if (now - lastNotificationTime >= time) {
            showNotification();
            chrome.storage.local.set({ lastNotificationTime: now });
        }
    });
}

// Show the notification
async function showNotification() {
    
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Health Reminder',
        message: 'Here is your health reminder for this hour!',
        priority: 2
    });
}