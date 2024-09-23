// Api Stuffs here
import {
  factCheckWithGenerateQueries, factCheckWithoutGenerateQueries
} from "../utils/api_fight_misinfo";

import { healthClaimDetection } from '../utils/claim_detection';
import { getHealthTipState, setDefaultInstalled, getLatestHealthTip } from '../utils/storage';
import { sendImageToServer } from "../utils/xAutoDetect/api";
import {getHealthTips} from "../utils/api_health_tips"
import {setFactCheckWholeLoad, setSingleFactCheckLoad, isFactCheckLoading} from "../utils/pop_up_storage/storage"
import {getFromStorage, setInStorage} from "../utils/storage"
import {HealthFactsStorage} from "../utils/pop_up_storage/types"

// import { allKeywords } from '../utils/health_keywords';
import  allKeywords from './../utils/health_keywords/index';


// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
  if (request.message === 'factCheck') {
      if (sender.tab && sender.tab.id) {
          await chrome.sidePanel.open({ tabId: sender.tab.id });
      }
      factCheck(request.text);
      sendResponse({ success: true });
  }
  })();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_FACT') {
      updateFactCheck(request.hypothesis).then(response => {
          sendResponse(response);
      }).catch(error => {
          // console.error('Error:', error);
          sendResponse({ error: error.message });
      });
      return true;
  }
});

// notification for health reminders
// Set an alarm to trigger every hour
chrome.runtime.onInstalled.addListener(() => {
  setDefaultInstalled();
  
  const guideUrl = chrome.runtime.getURL('guide.html');
  chrome.tabs.create({ url: guideUrl });
});


chrome.runtime.onStartup.addListener(() => {
  setFactCheckWholeLoad(false);
  setSingleFactCheckLoad(false);
});


// For Browser Window Right Click Context Menu
// Add Remove to avoid duplicates creation of context menu
chrome.contextMenus.remove("extHealth", () => {

  // Ignore if there's an error when removing the context menu item
  if (chrome.runtime.lastError) {
      // console.log(chrome.runtime.lastError.message);
  }

  chrome.contextMenus.create({
      id: "extHealth",
      title: "Check Health Information",
      contexts: ["selection", "page"]
  }, function () {
      if (chrome.runtime.lastError) {
          // console.error(chrome.runtime.lastError.message);
      } else {
          // console.log("Context Menu item created successfully!");
      }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openSidePanel') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];
          if (tab) {
              chrome.sidePanel.open({ windowId: tab.windowId });
          }
      });
  }
});


// Add a listener for the context menu click event
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "extHealth") {
      await chrome.sidePanel.open({ windowId: tab.windowId });
      if (info.selectionText) {
          const maxLength = 80;
          const text = info.selectionText;

          if (text.trim().length > maxLength || text.trim().length === 0) {
              chrome.notifications.create({
                  type: 'basic',
                  iconUrl: 'error.png', // Path to your notification icon
                  title: 'Character Limit Exceeded',
                  message: `The text does not meet the character limit, it should be more than 0 and less than ${maxLength} characters.`,
              });
              return;
          }

          const isMatch = allKeywords
              .some(keyword => new RegExp(`(?:^|[\\s.,;?!()\\[\\]{}])${keyword}(?:[\\s.,;?!()\\[\\]{}]|$)`, 'i').test(text));
          if (!isMatch) {
              chrome.notifications.create({
                  type: 'basic',
                  iconUrl: 'error.png',
                  title: 'Keyword Error',
                  message: 'The current selected text does not include any of the health keywords for this extension. Please select a text that includes health keywords to fact check.',
                  priority: 2
              });
              return;
          }

          const isHealthClaim = await healthClaimDetection(text);
          if (!isHealthClaim) {
              let error_value = await getFromStorage(['healthClaimResult']);
              if (error_value != "yes" || error_value != "no") {
                  chrome.notifications.create({
                      type: 'basic',
                      iconUrl: 'error.png',
                      title: 'Daily Limit Reached',
                      message: 'I am sorry, but you have reached the daily limit or there is an error on the server. Please try again later.',
                      priority: 2
                  });
                  return;
              }
              chrome.notifications.create({
                  type: 'basic',
                  iconUrl: 'error.png',
                  title: 'Health Claim error',
                  message: 'The text selected is not a health claim. Please select a health claim text to fact check.',
                  priority: 2
              });
              return;
          }
          factCheck(text).then(data => {
          }).catch(error => {
              // console.error(error);
          });
      } 
      // else if (info.srcUrl) {
      //     const url = info.srcUrl;
      //     console.log("URL:", url);

      //     const text = await sendImageToServer(url);
      //     console.log("Extracted: ", text);
      //     const isHealthClaim = await healthClaimDetection(text);
      //     if (!isHealthClaim) {
      //         chrome.notifications.create({
      //             type: 'basic',
      //             iconUrl: 'error.png',
      //             title: 'Error',
      //             message: 'The image selected does not contain a health claim. Please select an image containing a health claim to fact check.',
      //             priority: 2
      //         });
      //         return;
      //     }
      //     factCheck(text).then(data => {
      //     }).catch(error => {
      //         console.error(error);
      //     });
      // }
  }
});


// fact checking function
async function updateFactCheck(text) {
  let loading = await isFactCheckLoading();
  if (loading) {
      chrome.notifications.create({
          type: 'basic',
          iconUrl: 'warning.png',
          title: 'Error',
          message: 'Please wait for the current fact check to finish before starting a new one.',
          priority: 2
      });
      return;
  }
  
  let response = await factCheckWithoutGenerateQueries(text);
  if (!Array.isArray(response)) {
      chrome.notifications.create({
          type: 'basic',
          iconUrl: 'warning.png',
          title: 'eXtHealth Error',
          message: response.result,
          priority: 2
      });
      return [];
  };
  
  return response;
}


async function factCheck(text) {
  let loading = await isFactCheckLoading();
  if (loading) {
      chrome.notifications.create({
          type: 'basic',
          iconUrl: 'warning.png',
          title: 'Error',
          message: 'Please wait for the current fact check to finish before starting a new one.',
          priority: 2
      }); 
      return;
  }
  

  let response = await factCheckWithGenerateQueries(text);

  if (!Array.isArray(response.result)) {
      chrome.notifications.create({
          type: 'basic',
          iconUrl: 'warning.png',
          title: 'eXtHealth Error',
          message: response.result,
          priority: 2
      });
      return;
  }

  try {
      let result = await getFromStorage(['extHealthFacts']) as HealthFactsStorage;
      let currentData = result.extHealthFacts ? result.extHealthFacts.result : [];

      response.result.forEach(newItem => {
          currentData = currentData.filter(item => item.hypothesis !== newItem.hypothesis);
          currentData.unshift(newItem);
      });

      if (currentData.length > 6) {
          currentData = currentData.slice(0, 6);
      }

      await setInStorage({ extHealthFacts: { result: currentData } });

  } catch (error) {
      chrome.notifications.create({
          type: 'basic',
          iconUrl: 'warning.png',
          title: 'eXtHealth Error',
          message: 'Error in Accessing Storage',
          priority: 2
      });
      return;
  }

}


let popupWindowId: number | null = null;
let isResizing = false;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "openPopup") {
    console.log("Received openPopup request");
    // Check if the popup window is already opened
    if (popupWindowId !== null) {
      console.log("Popup window ID exists:", popupWindowId);
      chrome.windows.get(popupWindowId, (window) => {
        if (window) {
          console.log("Popup window found, closing it");
          // Close the existing popup window
          chrome.windows.remove(popupWindowId!, () => {
            console.log("Existing popup window closed.");
            // Reset popupWindowId after closing
            popupWindowId = null;
            // Create a new popup window after closing the existing one
            createPopupWindow(sendResponse);
          });
        } else {
          console.log("Popup window not found, resetting ID and creating new window");
          // Reset popupWindowId if the window is not found
          popupWindowId = null;
          // Create a new popup window if the existing one is not found
          createPopupWindow(sendResponse);
        }
      });
    } else {
      console.log("No existing popup window, creating a new one");
      // Create a new popup window
      createPopupWindow(sendResponse);
    }

    return true; // Keep the message channel open for sendResponse
  }

  // Handle healthCardHeight message
  if (request.action === "healthCardHeight") {
    const height = request.height;
    console.log("Received healthCardHeight request with height:", height);
    // Resize the popup window to match the height of the health card
    if (popupWindowId !== null) {
      console.log("Popup window ID exists for resizing:", popupWindowId);
      // If the popup window is already open, resize it
      if (!isResizing) {
        isResizing = true;
        chrome.windows.update(
          popupWindowId,
          { height: height + 50 },
          () => {
            console.log("Popup window height updated to:", height + 50);
            sendResponse({ status: "height_updated", height });
            isResizing = false;
          }
        );
      }
    } else {
      console.log("No existing popup window, creating a new one with height:", height + 50);
      // If no popup window is open, create a new one with the new height
      createPopupWindow(sendResponse, height + 50); // Add some padding
      sendResponse({ status: "window_created", height });
    }

    return true; // Keep the message channel open for sendResponse
  }
});

function createPopupWindow(sendResponse: (response: any) => void, height: number = 400) {
  const popupWidth = 400;
  const defaultPopupHeight = height; // Set a default height
  const title = "Health Tip"; // Set the desired title

  const popupUrl = new URL(chrome.runtime.getURL("externalPopup.html"));
  popupUrl.searchParams.set("title", title);

  console.log("Creating new popup window with height:", defaultPopupHeight);

  chrome.windows.create(
    {
      url: popupUrl.toString(),
      type: "popup",
      width: popupWidth,
      height: defaultPopupHeight,
      left: 1000, // Position at the upper right corner
      top: 80, // Align with the top of the screen
      focused: true,
    },
    (window) => {
      if (window) {
        console.log("New popup window created with ID:", window.id);
        popupWindowId = window.id ?? null;
        sendResponse({ status: "opened" });
      } else {
        console.log("Failed to create new popup window");
        sendResponse({ status: "failed_to_open" });
      }
    }
  );
}