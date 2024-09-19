
import { Discuss } from "react-loader-spinner";
import { TweetBodyWrapper, TwitterTheme } from "./types";

/**
 * 
 * @returns - The current theme of the twitter page
 */
const getXTheme = (): TwitterTheme => {
    const bodyBackgroundColor = getComputedStyle(document.body).backgroundColor;
    if (bodyBackgroundColor === "rgb(21, 32, 43)") {
        return TwitterTheme.Dim, TwitterTheme.Dim_2;
    } else if (bodyBackgroundColor === "rgb(255, 255, 255)") {
        return TwitterTheme.White , TwitterTheme.White_2;
    } else {
        return TwitterTheme.Dark, TwitterTheme.Dark2;
    }

};

/**
 * 
 * @param tweet - The HTML of the tweet
 * @returns - The overlay element
 */
const createOverlayElement = (): HTMLDivElement => {
    const overlayElement = document.createElement("div");

    overlayElement.style.position = "absolute";
    overlayElement.style.top = "0";
    overlayElement.style.left = "0";
    overlayElement.style.width = "150%";
    // overlayElement.style.width = "auto";
    overlayElement.style.height = "100%";
    // overlayElement.style.backgroundColor = "#1D9BF0";
    // overlayElement.style.opacity = ".5";
    overlayElement.style.pointerEvents = "none";

    overlayElement.style.display = "flex";
    overlayElement.style.flexDirection = "column";
    overlayElement.style.alignItems = "center";
    overlayElement.style.justifyContent = "center";
    // const button = createBtnElement("tweetBody");
    // const buttonContainer = document.createElement('div');
    // buttonContainer.style.width = "50%";
    // buttonContainer.style.position = "absolute";
    // buttonContainer.style.right = "0";
    // buttonContainer.style.backgroundColor = "red";

    // buttonContainer.append(button);
    // overlayElement.appendChild(buttonContainer);

    return overlayElement;
};
/**
 * 
 * @param tweetBody - The body of the tweet
 * @returns button element
 */
const createBtnElement = (tweetBody): HTMLButtonElement => {
    const button = document.createElement("button");
    button.style.border = "3px solid #FFFFFF";
    button.style.backgroundColor = "#F11729";
    button.style.borderRadius = "50px 50px 50px 0";
    button.style.boxShadow = "0px 4px 4px 0px #00000040";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "flex-start";
    button.style.padding = "0 5px";
    button.style.cursor = "pointer";
    button.style.position = "absolute";
    button.style.overflow = "hidden";
    button.style.transition = "width 0.3s ease-in-out";
    button.style.top = "-30px";
    button.style.right = "-30px";
    button.style.transformOrigin = "left";
    // button.st
    // button.style.transform = "scale(0)";
    // button.style.transition = "transform 0.3s ease-in-out";
    button.style.width = "3rem";

    button.style.pointerEvents = "auto";

    const img = document.createElement("img");
    // replace with the real image of our extension
    img.src = chrome.runtime.getURL('iconCheckThisOut.png');
    img.alt = "";
    img.style.transition = "transform 0.3s ease-in-out";
    img.style.height = "100%";
    img.style.width = "1.5rem";
    img.style.flexShrink = "0";
    img.style.margin = "4px";

    const span = document.createElement("span");
    span.className = "button-text";
    span.textContent = "Check This Out!";
    span.style.marginLeft = "5px";
    span.style.color = "white";
    span.style.fontFamily = "Public Sans";
    span.style.fontWeight = "700";
    span.style.opacity = "0";
    span.style.transition = "opacity 0.3s ease-in-out";
    span.style.whiteSpace = "nowrap";

    button.appendChild(img);
    button.appendChild(span);

    button.addEventListener('mouseover', () => {
        // button.style.animation = 'expandButtonXHealth 0.5s forwards';
        button.style.width = "11rem";
        span.style.opacity = "1";
        // button.style.transform = "scale(1)";

    });

    button.addEventListener('mouseout', () => {
        // button.style.animation = 'shrinkButtonXHealth 0.5s forwards';
        button.style.width = "3rem";
        span.style.opacity = "0";
        // button.style.transform = "scale(0)";
    });

    button.setAttribute('data-value', tweetBody);

    return button;
};

const extractTweetBody = (tweetBodyWrapper: TweetBodyWrapper): string => {
    try {
        let text = "";
        const chileNodes = tweetBodyWrapper.childNodes;

        chileNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
                text += child.textContent.replace(/\n/g, "");
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                text += extractTweetBody(child);
            }
        });

        const extractedHashtags = text.replace(/(^|\s)(#)+/g, "$1 ");
        let maskedUsernames = extractedHashtags.replace(
            /@\w+\b/g,
            "[USERNAME]"
        )

        const urlRegex = /https?:\/\/\S+/g;
        const urls = maskedUsernames.match(urlRegex);
        if (urls) {
            urls.forEach((url) => {
                maskedUsernames = maskedUsernames.replace(url, "[URL]");
            });
        }

        return maskedUsernames;
    } catch (error) {
        return " ";
    }
};

export {
    getXTheme,
    extractTweetBody,
    createBtnElement,
    createOverlayElement
}