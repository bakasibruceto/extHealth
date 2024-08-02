import React, { useState,  useEffect, useRef  } from 'react';
import './css/default.css'; // Assuming styles are defined here

import FactCheckingSection from "../components/factcheck/FactCheckingSection"
import Settings from "../components/settings/section"


const Layout = () => {
    const [activeOption, setActiveOption] = useState('factChecking');
  
    const options = [
      { id: 'factChecking', name: 'Fact Checking', imgSrc: '', altText: 'factLogo' },
      { id: 'healthReminders', name: 'Health Reminders', imgSrc: '', altText: 'reminderLogo' },
      { id: 'settings', name: 'Settings', imgSrc: '', altText: 'settingsLogo' },
    ];

    const previousActiveOptionRef = useRef(activeOption);
  
    useEffect(() => {
        const appearClasses = ['appearRight', 'appearLeft'];
        const disappearClasses = ['disappearRight', 'disappearLeft'];
        const activeElement = document.querySelector(`#${activeOption}`);
        const previousActiveElement = document.querySelector(`#${previousActiveOptionRef.current}`);
        if (activeElement === previousActiveElement) return;
        // Find indexes of the current and previous active options in the options array
        const currentIndex = options.findIndex(option => option.id === activeOption);
        const previousIndex = options.findIndex(option => option.id === previousActiveElement?.id);
      
        if (previousActiveElement) {
          const disappearClass = currentIndex > previousIndex ? disappearClasses[0] : disappearClasses[1];
          previousActiveElement.classList.remove('selectedOption');
          previousActiveElement.classList.add(disappearClass);
        }
        if (activeElement) {
          const appearClass = currentIndex > previousIndex ? appearClasses[0] : appearClasses[1];
          activeElement.classList.add('selectedOption', appearClass);
        }
        previousActiveOptionRef.current = activeOption;
      }, [activeOption, options]);
  
    const handleOptionClick = (optionId) => {
      setActiveOption(optionId);
    };
  
    return (
      <div style={{ minWidth: '700px', minHeight: '500px' }}>
        <header className="board">
          <div className="TitleLogo">
            <img src="icon.png" alt="Logo" className="logo" />
            <h2 id="popupTitle" className="popupTitle">
              eXtHealth <span className="forc">for Chrome</span>
            </h2>
          </div>
        </header>
        <section id="options">
          <ul>
            {options.map((option) => (
              <li key={option.id} className={activeOption === option.id ? 'activeOption' : ''} onClick={() => handleOptionClick(option.id)}>
                {option.name}
                <img src={option.imgSrc} alt={option.altText} />
              </li>
            ))}
          </ul>
        </section>
        <section id="body">
          <div id="factChecking" className={`${activeOption === 'factChecking' ? 'selectedOption' : ''} appearLeft`}>
            <FactCheckingSection/>
          </div>
          <div id="healthReminders" className={`${activeOption === 'healthReminders' ? 'selectedOption' : ''} ${activeOption !== 'healthReminders' ? 'disappearLeft' : ''}`}>
            <div>sample reminder</div>
          </div>
          <div id="settings" className={`${activeOption === 'settings' ? 'selectedOption' : ''} ${activeOption !== 'settings' ? 'disappearLeft' : ''}`}>
            <Settings/>
          </div>
        </section>
      </div>
    );
  };
  
  export default Layout;