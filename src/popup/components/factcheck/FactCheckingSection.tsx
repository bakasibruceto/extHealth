import React, {useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import CustomAccordion from './CustomAccordion';
import Evidence from './Evidence'; 

import "./css/factCheckingBody.css";

const FactCheckingSection: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);


  const [facts, setFacts] = useState([]);

  useEffect(() => {
    // Retrieve the stored data using Chrome Storage API
    chrome.storage.local.get(['extHealthFacts'], function(result) {
      if (result.extHealthFacts) {
        // Use the 'result' array directly from the storage
        setFacts(result.extHealthFacts.result);
      }
    });
  }, []);

  const handleChange =
  (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newFacts = [...facts];
    newFacts[index].hypothesis = e.target.value;
    setFacts(newFacts);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault();
    const hypothesis = facts[index].hypothesis;
    // Send the updated fact to the background script
    chrome.runtime.sendMessage({ type: 'UPDATE_FACT', hypothesis }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError.message);
      } else {
        const updatedFacts = [...facts];
        updatedFacts[index].premises = response;
        chrome.storage.local.set({ extHealthFacts: { result: updatedFacts } }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error updating local storage:', chrome.runtime.lastError.message);
          } else {
            console.log('Local storage updated successfully', updatedFacts);
            setFacts(updatedFacts); // Update the state with the new facts
          }
        });
      }
    });
    
  };


  
  const accordionStates = ['entailment', 'contradiction', 'neutral'];

  const stateMappings = {
    entailment: "Supported",
    contradiction: "Disputed",
    neutral: "Neutral"
  };

  return (
    <div>
      {Array.isArray(facts) && facts.length > 0 ? (
        facts.map((fact, index) => (
          <div key={index}>
            <form action="" id={`form-${index}`} onSubmit={(e) => handleSubmit(e, index)}>
              <input type="text" value={fact.hypothesis} 
              onChange={(e) => handleInputChange(e, index)}/>
            </form>
            {accordionStates.map((state) => {
              const relatedPremises = fact.premises.filter(premise => premise.relationship.toLowerCase() === state.toLowerCase());
              const count = relatedPremises.length;
            
              return count > 0 && (
                <CustomAccordion
                  key={`${index}-${state}`}
                  title={`${stateMappings[state]}`} 
                  count={`${count}`}
                  expanded={expanded === `${index}-${state}`}
                  onChange={handleChange(`${index}-${state}`)}
                >
                  {relatedPremises.map((premise, idx) => (
                    <Evidence key={`${index}-${state}-${idx}`} idx={idx} premise={premise} />
                  ))}
                </CustomAccordion>
              );
            })}
          </div>
        ))
      ) : (
        <div>whoa look at the emptiness</div>
      )}
    </div>
  );
};

export default FactCheckingSection;
