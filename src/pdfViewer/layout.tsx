import React, { useEffect, useState, useRef } from 'react';
import PdfViewer from './pdfviewer';
import { createRoot } from "react-dom/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./style.css";
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import SearchDropdown from './components/searchdropdown';
import useDebounce from './useDebounce';

// Function to extract the page number and search term from the URL hash
const getParamsFromUrl = () => {
    const hash = window.location.hash;
    const pageMatch = hash.match(/page=(\d+)/); // Match `#page=number`
    const searchMatch = hash.match(/title=([^&]+)/); // Match `search=somewords`
    
    const page = pageMatch ? parseInt(pageMatch[1], 10) : 1; // Default to page 1 if no match
    const title = searchMatch ? decodeURIComponent(searchMatch[1]) : ''; // Default to empty string if no search term
    
    return { page, title };
};

const PdfLayout: React.FC = () => {
    const pdfPath = "book.pdf";
    // Store the initial page number and search text
    const [{ page: initialPage, title: initialTitle }, setParams] = useState(getParamsFromUrl());
    
    const [titleSearch, setTitleSearch] = useState(initialTitle);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500); // Debounce the search term with a 500ms delay
    const title = titleSearch ? titleSearch : 'PDF Viewer';
    const [zoom, setZoom] = useState(1.0); // Default zoom level set to 100%
    const [zoomInput, setZoomInput] = useState((zoom * 100).toString() + '%'); // State for input value
    const minZoom = 0.25; // Minimum zoom level (25%)
    const maxZoom = 5.0; // Maximum zoom level (500%)
    const pdfViewerRef = useRef<any>(null);

    // Update the state if the URL hash changes
    useEffect(() => {
        const handleHashChange = () => {
            setParams(getParamsFromUrl());
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const handleSearchTermChange = (term: string) => {
        setSearch(term);
        setTitleSearch(term);
    };

    const handleNavigateUp = () => {
        if (pdfViewerRef.current) {
            pdfViewerRef.current.navigateToPreviousResult();
        }
    };

    const handleNavigateDown = () => {
        if (pdfViewerRef.current) {
            pdfViewerRef.current.navigateToNextResult();
        }
    };

    // Ensure scroll to top when search term changes
    useEffect(() => {
        if (pdfViewerRef.current) {
            pdfViewerRef.current.scrollToTop();
        }
    }, [debouncedSearch]);

    // Zoom handling
    const addZoom = () => {
        if (zoom < maxZoom) {
            const percentage = 0.25; // Increase zoom by 25%
            const newZoom = Math.min(zoom + percentage, maxZoom);
            setZoom(newZoom);
            setZoomInput((newZoom * 100).toFixed(0) + '%');
        }
    };

    const minusZoom = () => {
        if (zoom > minZoom) {
            const percentage = 0.25; // Decrease zoom by 25%
            const newZoom = Math.max(zoom - percentage, minZoom);
            setZoom(newZoom);
            setZoomInput((newZoom * 100).toFixed(0) + '%');
        }
    };

    const handleZoomInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;
        setZoomInput(value);
    };

    const handleZoomInputBlur = () => {
        updateZoom(zoomInput);
        if (!zoomInput.endsWith('%')) {
            setZoomInput(zoomInput + '%');
        }
    };
    
    const handleZoomInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            updateZoom(zoomInput);
            if (!zoomInput.endsWith('%')) {
                setZoomInput(zoomInput + '%');
            }
        }
    };

    const updateZoom = (value: string) => {
        if (value.endsWith('%')) {
            value = value.slice(0, -1); // Remove the '%' character
        }
        value = value.trim(); // Remove any leading or trailing whitespace
        let intValue = Number(value);
        let belowMin = false;
        let aboveMax = false;
        if (!isNaN(intValue)) {
            if (intValue < minZoom * 100) {
                belowMin = true;
                intValue = minZoom * 100;
            } else if (intValue > maxZoom * 100) {
                aboveMax = true;
                intValue = maxZoom * 100;
            }
            setZoom(intValue / 100); // Convert percentage to decimal
            if (belowMin) {
                setZoomInput((minZoom * 100) + '%');
            }
            if (aboveMax) {
                setZoomInput((maxZoom * 100) + '%');
            }
        }
    };

    // Prevent browser zoom when Ctrl + Scroll is used
    const handleWheel = (event: WheelEvent) => {
        if (event.ctrlKey) {
            event.preventDefault(); // Prevent default zooming behavior
            if (event.deltaY < 0) {
                addZoom(); // Zoom in
            } else {
                minusZoom(); // Zoom out
            }
        }
    };

    // Prevent browser zoom when Ctrl + Plus or Ctrl + Minus is used
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey && (event.key === '+' || event.key === '=')) {
            event.preventDefault(); // Prevent default zooming behavior
            addZoom(); // Zoom in
        } else if (event.ctrlKey && (event.key === '-' || event.key === '_')) {
            event.preventDefault(); // Prevent default zooming behavior
            minusZoom(); // Zoom out
        }
    };

    // Add event listeners on component mount
    useEffect(() => {
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [zoom]);

    return (
        <div>
            <nav>
                <h1>{title}</h1>
                <div id="zoom">
                    <span id="zoom-controls">
                        <button id="zoom-out" onClick={minusZoom}>
                            <FontAwesomeIcon icon={faMinus} style={{ color: "white" }} />
                        </button>
                        <input type="text" value={zoomInput} aria-label="Zoom level"
                            onChange={handleZoomInputChange}
                            onBlur={handleZoomInputBlur}
                            onKeyDown={handleZoomInputKeyDown} />
                        <button id="zoom-in" onClick={addZoom}>
                            <FontAwesomeIcon icon={faPlus} style={{ color: "white" }} />
                        </button>
                    </span>
                </div>
                <SearchDropdown onSearchTermChange={handleSearchTermChange} onNavigateUp={handleNavigateUp} onNavigateDown={handleNavigateDown} />
            </nav>
            <PdfViewer ref={pdfViewerRef} pdfPath={pdfPath} initialPage={initialPage} search={debouncedSearch} zoom={zoom} />
        </div>
    );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<PdfLayout />);