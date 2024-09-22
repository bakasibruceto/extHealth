import React, {useEffect, useState, useRef } from 'react';
import Typography from '@mui/material/Typography';
import CustomAccordion from './CustomAccordion';
import Evidence from './Evidence'; 

import "./css/factCheckingBody.css";

import TextAreaWithCounter from './TextAreaWithCounter';

import {healthClaimDetection} from '../../utils/claim_detection';
import {getFromStorage} from "../../utils/storage"

import  allKeywords  from '../../utils/health_keywords/index';

const FactCheckingSection: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [newFact, setNewFact] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [focusedState, setFocusedState] = useState<string | null>(null);
  const [facts, setFacts] = useState([]);

  const scrollableDivRef = useRef<HTMLDivElement>(null);

  // updating new facts
  useEffect(() => {
    // Retrieve the stored data using Chrome Storage API
    chrome.storage.local.get(['extHealthFacts'], function(result) {
        if (result.extHealthFacts) {
            // Use the 'result' array directly from the storage
            setFacts(result.extHealthFacts.result);
        }
    });

    // Set up an event listener for changes in the storage
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
        if (areaName === 'local' && changes.extHealthFacts) {
            setFacts(changes.extHealthFacts.newValue.result);
        }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    // Clean up the event listener on component unmount
    return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleAccordionChange =
  (panel: string, index: number, accordionState: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
    if(isExpanded){
      setFocusedIndex(prevIndex => {
        setFocusedState(prevState => {
          if (prevIndex === index && prevState === accordionState) {
            return null;
          } else {
            return accordionState;
          }
        });
        return prevIndex === index && focusedState === accordionState ? null : index;
      });
    } else {
      setFocusedIndex(null);
      setFocusedState(null);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const newFacts = [...facts];
    newFacts[index].hypothesis = e.target.value;
    setFacts(newFacts);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault();
    const hypothesis = facts[index].hypothesis;
    const maxLength = 80;
    if (hypothesis.trim().length > maxLength || hypothesis.trim().length === 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'error.png',
        title: 'Character Limit Error',
        message: `The current must be more than 0 or does not exceed the character limit of ${maxLength}.`,
        priority: 2
      });
      return;
    }

    const isMatch = allKeywords
          .some(keyword => new RegExp(`(?:^|[\\s.,;?!()\\[\\]{}])${keyword}(?:[\\s.,;?!()\\[\\]{}]|$)`, 'i').test(hypothesis));
      if (!isMatch) {
          chrome.notifications.create({
              type: 'basic',
              iconUrl: 'error.png',
              title: 'Health Claim Error',
              message: 'The current query is not an health claim. Please make sure it is',
              priority: 2
          });
          return;
      }

    const isHealthClaim = healthClaimDetection(hypothesis);
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
        title: 'Health Claim Error',
        message: 'The current query is not an health claim. Please make sure it is',
        priority: 2
      });
      return;
    }
    // Send the updated fact to the background script
    chrome.runtime.sendMessage({ type: 'UPDATE_FACT', hypothesis }, (response) => {
      if (chrome.runtime.lastError) {
        // console.error('Error:', chrome.runtime.lastError.message);
      } else if (response === undefined || response === null) {
        // console.error('Error: Background script encountered an error and returned no response.');
      } else {
        const updatedFacts = [...facts];
        updatedFacts[index].premises = response;
        chrome.storage.local.set({ extHealthFacts: { result: updatedFacts } }, () => {
          if (chrome.runtime.lastError) {
            // console.error('Error updating local storage:', chrome.runtime.lastError.message);
          } else {
            // console.log('Local storage updated successfully', updatedFacts);
            setFacts(updatedFacts); // Update the state with the new facts
          }
        });
      }
    });
  };

  const addNewFacts = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fact = newFact;

      const maxLength = 80;
      if (fact.trim().length > maxLength || fact.trim().length === 0) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'error.png',
          title: 'Character Limit Error',
          message: `The current must be more than 0 or does not exceed the character limit of ${maxLength}.`,
          priority: 2
        });
        return;
      }

      const isMatch = allKeywords
          .some(keyword => new RegExp(`(?:^|[\\s.,;?!()\\[\\]{}])${keyword}(?:[\\s.,;?!()\\[\\]{}]|$)`, 'i').test(fact));
      if (!isMatch) {
          chrome.notifications.create({
              type: 'basic',
              iconUrl: 'error.png',
              title: 'Health Claim Error',
              message: 'The current query is not an health claim. Please make sure it is',
              priority: 2
          });
          return;
      }

      const isHealthClaim = healthClaimDetection(fact);
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
          title: 'Health Claim Error',
          message: 'The current query is not an health claim. Please make sure it is',
          priority: 2
        });
        return;
      }
      // Send a message to the background script
      chrome.runtime.sendMessage({ message: 'factCheck', text: fact }, (response) => {
          // console.log('Response from background script:', response);
      });
  };
  
  // loading
  useEffect(() => {
    chrome.storage.local.get(['isFactCheckLoading', 'isSingleFactCheckLoading'], (result) => {
      const isFactCheckLoading = result.isFactCheckLoading === true;
      const isSingleFactCheckLoading = result.isSingleFactCheckLoading === true;

      const loaderElement = document.querySelector('.loader');

      if (loaderElement) {
          if (isFactCheckLoading || isSingleFactCheckLoading) {
              loaderElement.classList.add('loading');
          }
      }
    });
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.isFactCheckLoading || changes.isSingleFactCheckLoading) {
            chrome.storage.local.get(['isFactCheckLoading', 'isSingleFactCheckLoading'], (result) => {
                const isFactCheckLoading = result.isFactCheckLoading === true;
                const isSingleFactCheckLoading = result.isSingleFactCheckLoading === true;
        
                const loaderElement = document.querySelector('.loader');
                const buttonElement = document.querySelector('.add_fact_button');
        
                if (loaderElement) {
                    if (isFactCheckLoading || isSingleFactCheckLoading) {
                        loaderElement.classList.add('loading');
                        buttonElement.classList.add('loading');
                    } else {
                        loaderElement.classList.remove('loading');
                        buttonElement.classList.remove('loading');
                    }
                }
            });
        }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);
    // Cleanup event listener on component unmount
    return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const scrollableDiv = scrollableDivRef.current;
    if (scrollableDiv && scrollableDiv.lastElementChild) {
      // Scroll the last child element into view
      scrollableDiv.lastElementChild.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  
  const accordionStates = ['entailment', 'contradiction', 'neutral'];

  const stateMappings = {
    entailment: "Supported",
    contradiction: "Disputed",
    neutral: "Neutral"
  };

  return (
    <div ref={scrollableDivRef}>
      <form action="" id={`form_add_facts`} onSubmit={(e) => addNewFacts(e)}>
        <TextAreaWithCounter
          value={newFact}
          onChange={(e) => setNewFact(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.target as HTMLTextAreaElement).form?.requestSubmit();
            }
          }}
        />
        <button type="submit" className='add_fact_button'>+</button>
        <span className="loader"></span>
      </form>
      {Array.isArray(facts) && facts.length > 0 ? (
        facts.map((fact, index) => (
          <div key={index}>
            <form action="" id={`form-${index}`} onSubmit={(e) => handleSubmit(e, index)}>
            <TextAreaWithCounter 
              value={fact.hypothesis} 
              onChange={(e) => handleInputChange(e, index)}
              className={focusedIndex === index ? 'textarea-focused' : 'textarea-unfocused'}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (e.target as HTMLTextAreaElement).form?.requestSubmit();
                }
              }}
            />
            </form>
            {accordionStates.length === 0 || fact.premises.filter(premise => accordionStates.includes(premise.relationship.toLowerCase())).length === 0 ? (
              <div style={
                {
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '20px',
                  color: 'gray',
                  marginBottom: '30px'
                }
              }>
                <span>
                  Sorry, no results found for this query
                </span>
                <img src="sad-emoji.gif" alt=":(" height="30px" width="30px"/>
                </div>
            ) : (
              accordionStates.map((state) => {
                const relatedPremises = fact.premises.filter(premise => premise.relationship.toLowerCase() === state.toLowerCase());
                const count = relatedPremises.length;
            
                return count > 0 && (
                  <CustomAccordion
                    key={`${index}-${state}`}
                    title={`${stateMappings[state]}`} 
                    count={`${count}`}
                    expanded={expanded === `${index}-${state}`}
                    onChange={handleAccordionChange(`${index}-${state}`, index, state)}
                  >
                    {relatedPremises.map((premise, idx) => (
                      <Evidence key={`${index}-${state}-${idx}`} idx={idx} premise={premise} />
                    ))}
                  </CustomAccordion>
                );
              })
            )}
          </div>
        ))
      ) : (
        <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '20px',
          color: 'gray',
          marginTop: '30px',
          marginBottom: '30px'
        }}
        >Want to try fact checking something?</div>
      )}
    </div>
  );
};

export default FactCheckingSection;
