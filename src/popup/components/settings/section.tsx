import React, { useEffect, useState } from "react";

import { getCategoryState, getPopupState } from "./../../../utils/storage";
import { sendMessageToContentScript, } from "../../../utils/general";
import { Toggle, Category } from "../index";

const Settings: React.FC<{}> = () => {
    const [extensionState, setExtensionState] = useState<boolean | null>(false);
    const [categoryState, setCategoryState] = useState<{ [key: number]: boolean }>({});
    const ids = [15, 16, 18, 19, 20, 21, 23, 24, 28, 29];

    useEffect(() => {
        getPopupState().then((state) => {
            setExtensionState(state);
        });
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

    const handleExtensionState = (newState: boolean): void => {
        setExtensionState(newState);
        sendMessageToContentScript({ state: newState }, (response) => {
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
        <div className="popupContainer">
            <div id="popupContent" className="popupContent">
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary">
                        Health Reminder is <span>enabled</span> for X <span>by default.</span>
                    </p>
                    <Toggle
                        isOn={extensionState}
                        onChange={handleExtensionState}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary">
                        Cancer
                    </p>
                    <Category
                        isOn={categoryState[ids[0]]}
                        onChange={(newState) => handleCategoryState(ids[0], newState)}
                        id={ids[0]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary">
                        Diabetes
                    </p>
                    <Category
                        isOn={categoryState[ids[1]]}
                        onChange={(newState) => handleCategoryState(ids[1], newState)}
                        id={ids[1]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary">
                        Heart Health
                    </p>
                    <Category
                        isOn={categoryState[ids[2]]}
                        onChange={(newState) => handleCategoryState(ids[2], newState)}
                        id={ids[2]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary">
                        HIV
                    </p>
                    <Category
                        isOn={categoryState[ids[3]]}
                        onChange={(newState) => handleCategoryState(ids[3], newState)}
                        id={ids[3]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary">
                        Mental Health
                    </p>
                    <Category
                        isOn={categoryState[ids[4]]}
                        onChange={(newState) => handleCategoryState(ids[4], newState)}
                        id={ids[4]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary">
                        Nutrition
                    </p>
                    <Category
                        isOn={categoryState[ids[5]]}
                        onChange={(newState) => handleCategoryState(ids[5], newState)}
                        id={ids[5]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary">
                        Obesity
                    </p>
                    <Category
                        isOn={categoryState[ids[6]]}
                        onChange={(newState) => handleCategoryState(ids[6], newState)}
                        id={ids[6]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary">
                        Physical Activity
                    </p>
                    <Category
                        isOn={categoryState[ids[7]]}
                        onChange={(newState) => handleCategoryState(ids[7], newState)}
                        id={ids[7]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary">
                        Sexual Health
                    </p>
                    <Category
                        isOn={categoryState[ids[8]]}
                        onChange={(newState) => handleCategoryState(ids[8], newState)}
                        id={ids[8]}
                    />
                </div>
                <div className="containerSummary">
                    <p id="popupSummary" className="popupSummary">
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
  