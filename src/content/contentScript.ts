// summarizing/giving news
import { startTimer } from "../utils";
import { stopTimer } from "../utils/schedule";
import { getPopupState, getCategoryState } from "../utils";

// detecting tweets
import { sampleDomKeywordExtractor, sampleHello, sampleOCR, sampleTranslation } from './sampleScript';
import { TweetBodyWrapper, TwitterTheme } from '../utils/dom-extractor/types';
import { getXTheme } from '../utils/dom-extractor/dom';


const TIMER_DURATION = 1 ; 


const setInitialExtensionState = async (): Promise<void> => {
  const isExtensionEnabled = await getPopupState();
  if (isExtensionEnabled) {
    enablePopup();
  } else {
    disablePopup();
  }
};
setInitialExtensionState();

// const setInitialCategoryState = async (): Promise<void> => {
//   const isCategoryEnabled = await getCategoryState(15);
//   if (isCategoryEnabled) {
//     console.log("Category is enabled");
//   } else {
//     console.log("Category is disabled");
//   }
// }
// setInitialCategoryState();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.state !== undefined) {
    const state = message.state;
    if (typeof state === 'boolean') {
      if (state) {
        enablePopup();
      } else {
        disablePopup();
      }
    } else {
      console.warn("State is not a boolean:", state);
    }
  }

  if (message.category !== undefined && message.id !== undefined) {
      const category = message.category;
      const id = message.id;
      if (typeof category === 'boolean') {
          if (category) {
              console.log(`Category ${id} is enabled`);
          } else {
              console.log(`Category ${id} is disabled`);
          }
      } else {
          console.warn(`Category ${id} is not a boolean:`, category);
      }
  }
});

const enablePopup = (): void => {
    startTimer(TIMER_DURATION);
};

const disablePopup = (): void => {
    stopTimer();
};



// fact check function
const factCheck = async (text: string): Promise<void> => {
    chrome.runtime.sendMessage({ message: "factCheck", text: text });
}


// extracting
const initialScroll = (): void => {
    setTimeout(() => {
        window.scrollBy(0, 1);
    }, 3500);
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


const extractor = require('keyword-extractor');

const options = {
    language: "english",
    remove_digits: false,
    return_changed_case: false,
    return_chained_words: true,
    remove_duplicates: false,
    return_max_ngrams: 3,
};

const extractKeywords = (text : string): string[] => {
    
    try {
        // const extractedKeywords =  extractor.extract(text, options);
        // extractedKeywords.forEach(keyword => keywords.push(keyword));
        return extractor.extract(text, options);
    } catch (error) {
        console.error('There is something wrong in keyword extraction: ', error)
        // return [];
    }

  
};

export {
    extractKeywords
}
import { allKeywords } from './health_keywords';
import { nanoid } from 'nanoid';


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
    button.style.width = "2rem";

    button.style.pointerEvents = "auto";

    const img = document.createElement("img");
    // replace with the real image of our extension
    img.src = "https://picsum.photos/200/300";
    img.alt = "";
    img.style.transition = "transform 0.3s ease-in-out";
    img.style.height = "100%";
    img.style.width = "1.5rem";
    img.style.flexShrink = "0";
    img.style.margin = "4px";

    const span = document.createElement("span");
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
        button.style.width = "10rem";
        span.style.opacity = "1";
        // button.style.transform = "scale(1)";
        
    });

    button.addEventListener('mouseout', () => {
        // button.style.animation = 'shrinkButtonXHealth 0.5s forwards';
        button.style.width = "2rem";
        span.style.opacity = "0";
        // button.style.transform = "scale(0)";
    });

    button.setAttribute('data-value', tweetBody);

    return button;
};


const detectNewTweets = async (): Promise<void> => {
    

    const theme: TwitterTheme = getXTheme();
    
    const elements = document.getElementsByClassName(theme);


    for (let index = 0; index < elements.length; index++) {
        const tweet = elements[index] as HTMLDivElement;

        if (tweet.hasAttribute("data-tweet-processed")) {
            continue;
        }


        // const  elements = document.getElementsByClassName('css-175oi2r r-1wbh5a2 r-1habvwh r-16xksha');

        try {
            tweet.setAttribute("data-tweet-processed", "true");

            const tweetBodyWrapper = tweet.querySelectorAll('div.css-175oi2r > div[data-testid="tweetText"]');
            const combinedWrappers = document.createElement('div');
            
            tweetBodyWrapper.forEach(element => {
                combinedWrappers.appendChild(element.cloneNode(true));
            });
            
            const tweetBody = extractTweetBody(combinedWrappers);

            if (tweetBody) {
                let isOverlayCreated = false;
                const keyword_extraction_result = extractKeywords(tweetBody)
                // Search And Match
                console.log(keyword_extraction_result);
                keyword_extraction_result.forEach(extracted_keyword => {
                    const matches = allKeywords.some(keyword => {
                        const isMatch = extracted_keyword.toLocaleLowerCase().includes(keyword.toLowerCase());
                        return isMatch;
                    });
                  
                    if (matches && !isOverlayCreated) {
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
                    
                        const overlayId = nanoid();
                        const viewBtn = createBtnElement(tweetBody);
                        // viewBtn.style.pointerEvents = "auto";
                        // viewBtn.style.transformOrigin = "left";
                        // viewBtn.style.transform = "scaleX(0)";
                        // viewBtn.style.transition = "transform 0.3s ease-in-out";
                        viewBtn.setAttribute("data-overlay-id", overlayId);
                        viewBtn.addEventListener("click", () => {
                            factCheck(viewBtn.getAttribute("data-value"));
                        });

                        // viewBtn.addEventListener('mouseover', () => {
                        //     viewBtn.style.transform = "scaleX(1)";
                        // });

                        // viewBtn.addEventListener('mouseout', () => {
                        //     viewBtn.style.transform = "scaleX(0)";
                        // });


                        overlayElement.appendChild(viewBtn);
                        tweet.append(overlayElement);
                        isOverlayCreated = true;
                    }

                });

            }
        } catch (error) {
            console.error(error);
        }
    }
    // domExtractor();
}

const detectNewFb = async (): Promise<void> => {
    

    // const theme: TwitterTheme = getXTheme();
    const theme = 'div.x1lliihq';
    const elements = document.getElementsByClassName(theme);
    // const elements = document.querySelectorAll(theme);
    // const filtered_elements = Array.from(elements).filter(element => element.className === 'x1lliihq');

    for (let index = 0; index < elements.length; index++) {
        const post = elements[index] as HTMLDivElement;
//  Law & Order Special Victims Unit Season 21 Ep 1
        try {

            const postBodyWrapper = post.querySelectorAll('div[dir="auto"]');

        } catch (error) {
            console.error('Error:', error);
        }
    }

    // for (let index = 0; index < elements.length; index++) {
    //     const tweet = elements[index] as HTMLDivElement;

    //     if (tweet.hasAttribute("data-tweet-processed")) {
    //         continue;
    //     }


    //     // const  elements = document.getElementsByClassName('css-175oi2r r-1wbh5a2 r-1habvwh r-16xksha');

    //     try {
    //         tweet.setAttribute("data-tweet-processed", "true");

    //         const tweetBodyWrapper = tweet.querySelectorAll('div[dir="auto"]');
    //         // const tweetBodyWrapper = tweet.querySelectorAll('div.css-146c3p1');
            
    //         // console.log('TweetBodyWrapper');
    //         // console.log(tweetBodyWrapper);
    //         const combinedWrappers = document.createElement('div');
            
    //         tweetBodyWrapper.forEach(element => {
    //             combinedWrappers.appendChild(element.cloneNode(true));
    //         });
            
    //         const tweetBody = extractTweetBody(combinedWrappers);
    //         console.log(tweetBody); 

    //         if (tweetBody) {
    //             const keyword_extraction_result = extractKeywords(tweetBody)
    //             console.log(keyword_extraction_result);

    //             // Search And Match
    //             keyword_extraction_result.forEach(extracted_keyword => {
    //                 const matches = allKeywords.some(keyword => extracted_keyword.toLocaleLowerCase().includes(keyword.toLowerCase()));
    //                 if (matches) {
    //                     console.log(`Found: ${extracted_keyword}}`);
    //                 }
    //             });

    //         }
    //         // console.log('Combined Wrappers');
    //         // console.log(combinedWrappers);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
    // domExtractor();
}

const enableDetectNewTweets = (): void => {
    document.addEventListener('DOMContentLoaded', detectNewTweets);
    window.addEventListener('scroll', detectNewTweets);
    initialScroll();
}

const disableDetectNewTweets = (): void => {
    document.removeEventListener('DOMContentLoaded', detectNewTweets);
    window.removeEventListener('scroll', detectNewTweets);
}

enableDetectNewTweets();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.scene1 !== undefined) {
        if (request.scene1 === true) {
            detectNewTweets();
            // detectNewFb();
            enableDetectNewTweets();
        } else {
            // disableDetectNewTweets();
        }
        

    }

    if (request.isDomExtractorChecked !== undefined) {
        if (request.isDomExtractorChecked) {
            sampleDomKeywordExtractor();
        } else {
        }
    }

    if (request.transFeat !== undefined) {
        if (request.transFeat) {
            sampleTranslation();
        }
    }

    if (request.ocrFeat !== undefined) {
        sampleOCR();
        
    }

    if (request.toggleState !== undefined) {

        if (request.toggleState) {
            sampleHello();
        }
    }

    
});



/*
    let divs = document.querySelectorAll('div.css-175oi2r');

    let filteredDivs = Array.from(divs).filter(div => div.className === 'css-175oi2r');

    filteredDivs.forEach(div => {
        let innerDiv = div.querySelector('div[data-testid="tweetText"]');
        if (innerDiv) {
            console.log(innerDiv.innerText);

            // Create a new button element
            let button = document.createElement('button');
            button.innerText = 'My Button';

            // Append the button to the div
            div.appendChild(button);
        }
    });
*/
