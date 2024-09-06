import React, { useEffect, useState } from "react";

import { getCategoryState, setHealthTipState } from "../../../../utils/storage";
import { sendMessageToContentScript } from "../../../../utils/general";
import { Category } from "./../../toggles";

const Settings: React.FC<{}> = () => {
    const [categoryState, setCategoryState] = useState<{ [key: number]: boolean }>({});
    const ids = [15, 16, 18, 19, 20, 21, 23, 24, 28, 29];
    const [inputValue, setInputValue] = useState<string>('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (value > 0) {
            setInputValue(e.target.value); // Use the original string value
        } else {
            setInputValue("1"); // Default to "1" if the value is 0 or negative
        }
    };

    useEffect(() => {
        const newState: { [key: number]: boolean } = {};
        ids.forEach((id) => {
            getCategoryState(id).then((category) => {
                newState[id] = category;

                if (Object.keys(newState).length === ids.length) {
                    setCategoryState(newState);
                }
            }).catch((error) => {
                console.error(`Failed to fetch category state for id ${id}:`, error);
            });
        });
    }, []);

    const handleHealtTipState = (newStatee: boolean): void => {
        setHealthTipState(newStatee);
        sendMessageToContentScript({ state: newStatee }, (response) => {
            console.log('Received response for extension state:', response);
        });
    };

    const handleCategoryState = (id: number, newCategoryState: boolean): void => {
        setCategoryState((prevState) => ({
            ...prevState,
            [id]: newCategoryState,
        }));
        sendMessageToContentScript({ id, category: newCategoryState }, (response) => {
            console.log('Received response for category state:', response);
        });
    };

    return (
        <div id="popupContent" className="popupContent">
            <div className="sidebar">
                <div className="subTileHeader">Interval:</div>
                <div className="subTileHeader">Topics:</div>
            </div>
            <div className="mainContent">
                <div>
                    <div className="tileHeader">
                        <div className="tileBorder">
                            Health Tips Reminder
                        </div>
                    </div>
                </div>
                <div className="containerSummary">
                    <div className="input-form">
                        <input
                            type="number"
                            value={inputValue}
                            onChange={handleInputChange}
                            min="1"  // Minimum value set to 1
                        />
                    </div>
                    <p id="popupSummary" className="popupSummary indent">
                        minute/s
                    </p>
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary indent">
                        Cancer
                    </p>
                    <Category
                        isOn={categoryState[ids[0]]}
                        onChange={(newState) => handleCategoryState(ids[0], newState)}
                        id={ids[0]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary indent">
                        Diabetes
                    </p>
                    <Category
                        isOn={categoryState[ids[1]]}
                        onChange={(newState) => handleCategoryState(ids[1], newState)}
                        id={ids[1]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary indent">
                        Heart Health
                    </p>
                    <Category
                        isOn={categoryState[ids[2]]}
                        onChange={(newState) => handleCategoryState(ids[2], newState)}
                        id={ids[2]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary indent">
                        HIV
                    </p>
                    <Category
                        isOn={categoryState[ids[3]]}
                        onChange={(newState) => handleCategoryState(ids[3], newState)}
                        id={ids[3]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary indent">
                        Mental Health
                    </p>
                    <Category
                        isOn={categoryState[ids[4]]}
                        onChange={(newState) => handleCategoryState(ids[4], newState)}
                        id={ids[4]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary indent">
                        Nutrition
                    </p>
                    <Category
                        isOn={categoryState[ids[5]]}
                        onChange={(newState) => handleCategoryState(ids[5], newState)}
                        id={ids[5]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary indent">
                        Obesity
                    </p>
                    <Category
                        isOn={categoryState[ids[6]]}
                        onChange={(newState) => handleCategoryState(ids[6], newState)}
                        id={ids[6]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary indent">
                        Physical Activity
                    </p>
                    <Category
                        isOn={categoryState[ids[7]]}
                        onChange={(newState) => handleCategoryState(ids[7], newState)}
                        id={ids[7]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary indent">
                        Sexual Health
                    </p>
                    <Category
                        isOn={categoryState[ids[8]]}
                        onChange={(newState) => handleCategoryState(ids[8], newState)}
                        id={ids[8]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary indent">
                        Vaccines
                    </p>
                    <Category
                        isOn={categoryState[ids[9]]}
                        onChange={(newState) => handleCategoryState(ids[9], newState)}
                        id={ids[9]}
                    />
                </div>
            </div>
        </div>
    );
};

export default Settings;