import * as React from "react";
import { useParams, Link } from "react-router-dom";
import "./css/pages.css";

export default function Pages() {
  const { id } = useParams(); 
  const finalPage = "finalPage";
  const maxPages = 5;
  const pages = [
    {
      id: 1,
      title: "The eXtHealth 'Check This Out' button means that the tweet or post contains health-related information.",
      content: "The eXtHealth detects posts containing health-related information. When you're browsing X and come across a post with health content, you will see a 'Check This Out' button. Click this button to request a fact-check.",
      nextLink: "pages/2",
      imgLink: "/page1.png",
    },
    {
      id: 2,
      title: "Side Panel: Fact-Checking Results",
      content: "The eXtHealth side panel will appear after clicking the 'Check This Out' button. This will provide users with information from trusted sources regarding the post to help verify its credibility and prevent misinformation.",
      nextLink: "pages/3",
      imgLink: "/page2.png",
    },
    {
      id: 3,
      title: "Health Reminders",
      content: "By clicking the eXtHealth icon in the extension bar, health reminders will appear, containing general health information from reliable and credible sources.",
      nextLink: "pages/4",
      imgLink: "/page3.png",
    },
    {
      id: 4,
      title: "Quick Access Side Panel for Health Claims ",
      content: "When browsing, you can open the side panel and input health claim statements by simply highlighting the text, then selecting 'Check Health Information' from the context menu, or by clicking the eXtHealth logo in the extension bar.",
      nextLink: finalPage,
      imgLink: "/page4.png",
    },
  ];

  const currentPage = pages.find(page => page.id === parseInt(id));

  // If no page is found, return an error or fallback UI
  if (!currentPage) {
    return <div>Page not found</div>;
  }

  return (
    <div id="pages">
      <h2>eXtHealth for Chrome is Now Active!</h2>
      <div>
        <img src={currentPage.imgLink} alt="Image" />
        <div>
          <h4>
            {currentPage.title}
          </h4>
          <p>
            {currentPage.content}
          </p>
          <div className="stepsFlex">
            <div>
              <Link to={`/guide.html/${currentPage.nextLink}`} className="primary-button">Next Page</Link>
              <span>
                {currentPage.id} of {maxPages}
              </span>
            </div>
            <Link to={`/guide.html/${finalPage}`} className="skip-button-2">
            Skip tutorial 
            <svg className="icon" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xmlSpace="preserve">
              <circle className="st0" cx="16" cy="16" r="13" />
              <polyline className="st0" points="14,11.8 18.2,16 14,20.2" />
            </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}