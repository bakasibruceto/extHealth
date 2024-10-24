import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import './SearchDropdown.css'; // Import the CSS file for styling

interface SearchDropdownProps {
    onSearchTermChange: (term: string) => void;
    onNavigateUp: () => void; // Callback for navigating up
    onNavigateDown: () => void; // Callback for navigating down
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ onSearchTermChange, onNavigateUp, onNavigateDown }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        onSearchTermChange(term); // Call the callback function to update the search term
    };

    const toggleDropdown = () => {
        setDropdownVisible((prev) => !prev);
    };

    return (
        <div className="search-container">
            <button id="search" onClick={toggleDropdown} className="search-button">
                <FontAwesomeIcon icon={faSearch} />
            </button>
            {isDropdownVisible && (
                <div id="search-dropdown" className="search-dropdown">
                    <div className="search-input-container">
                        <input
                            type="text"
                            placeholder="Find in document..."
                            value={searchTerm}
                            onChange={handleInputChange}
                            aria-label="Search term"
                            className="search-input"
                        />
                        <button onClick={onNavigateDown} className="nav-button">
                            <FontAwesomeIcon icon={faArrowDown} />
                        </button>
                        <button onClick={onNavigateUp} className="nav-button">
                            <FontAwesomeIcon icon={faArrowUp} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;