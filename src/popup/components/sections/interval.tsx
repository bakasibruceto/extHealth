import React, { useEffect, useState } from "react";

const Interval: React.FC<{}> = () => {
    const [inputValue, setInputValue] = useState<string>('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (value > 0) {
            setInputValue(e.target.value); // Use the original string value
        } else {
            setInputValue("1"); // Default to "1" if the value is 0 or negative
        }
    };

    return (
        <div className="containerSummary less2">
            <div className="gaps">
                <div className="input-form">
                    <input
                        type="number"
                        value={inputValue}
                        onChange={handleInputChange}
                        min="1"  // Minimum value set to 1
                    />
                </div>
                <p id="popupSummary" className="popupSummary">
                    minute/s
                </p>
            </div>

        </div>
    );
};

export default Interval;