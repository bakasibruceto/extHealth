import * as React from "react";
import { useOutlet, useLocation, Outlet } from "react-router-dom";
import { SwitchTransition, CSSTransition } from "react-transition-group";
import "./css/root.css";

export default function Root() {
  const location = useLocation(); // Get the current location from React Router
  const nodeRef = React.useRef(null); // Reference for the current transition node
  const currentOutlet = useOutlet()

  return (
    <>
      <nav>
        <img src="icon.png" alt="Icon" />
        <span>eXtHealth</span>
      </nav>
      <div id="detail">
        <SwitchTransition>
          <CSSTransition
            key={location.pathname} // Ensure the transition occurs when the route changes
            nodeRef={nodeRef} 
            timeout={500} // Duration of the animation
            classNames="fade" // CSS class for animations
            unmountOnExit
          >
            <div ref={nodeRef} className="base">
              {currentOutlet}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    </>
  );
}
