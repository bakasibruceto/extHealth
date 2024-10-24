import React, { useImperativeHandle, forwardRef, useRef, useCallback, useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './style.css'; // Import the CSS file

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const options = {
    cMapUrl: '/cmaps/',
};

interface PdfViewerProps {
    pdfPath: string; // Path to the PDF file
    initialPage?: number; // Optional: Starting page
    search?: string; // Optional: Search term
    zoom: number; // Zoom level
}

function highlightPattern(text: string, pattern: string, isSelected: boolean): string {
    if (!pattern.trim()) {
        return text; // Return the original text if the pattern is empty or a space
    }
    const regex = new RegExp(pattern, 'gi');
    return text.replace(regex, (value) => `<mark class="${isSelected ? 'selected-highlight' : 'highlight'}">${value}</mark>`);
}

const PdfViewer = forwardRef(({ pdfPath, initialPage = 1, search = '', zoom = 1.0 }: PdfViewerProps, ref) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(initialPage);
    const [searchText, setSearchText] = useState<string>(search);
    const [zoomLevel, setZoomLevel] = useState<number>(zoom);
    const [renderRange, setRenderRange] = useState<[number, number]>([1, 5]);
    const [searchResults, setSearchResults] = useState<number[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState<number>(-1);
    const viewerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        scrollToTop: () => {
            if (viewerRef.current) {
                viewerRef.current.scrollTo({ top: 0, behavior: 'auto' });
            }
        },
        scrollToPage: (pageNum: number) => {
            setRenderRange([Math.max(1, pageNum - 2), Math.min(numPages, pageNum + 2)]);
            setCurrentPage(pageNum);
            if (viewerRef.current) {
                const pageElement = viewerRef.current.querySelector(`[data-page-number="${pageNum}"]`);
                if (pageElement) {
                    pageElement.scrollIntoView({ behavior: 'auto' });
                }
            }
        },
        navigateToNextResult: () => {
            if (searchResults.length > 0) {
                const nextIndex = (currentResultIndex + 1) % searchResults.length;
                setCurrentResultIndex(nextIndex);
                const nextPage = searchResults[nextIndex];
                setRenderRange([Math.max(1, nextPage - 2), Math.min(numPages, nextPage + 2)]);
                setCurrentPage(nextPage);
                if (viewerRef.current) {
                    const pageElement = viewerRef.current.querySelector(`[data-page-number="${nextPage}"]`);
                    if (pageElement) {
                        pageElement.scrollIntoView({ behavior: 'auto' });
                    }
                }
            }
        },
        navigateToPreviousResult: () => {
            if (searchResults.length > 0) {
                const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
                setCurrentResultIndex(prevIndex);
                const prevPage = searchResults[prevIndex];
                setRenderRange([Math.max(1, prevPage - 2), Math.min(numPages, prevPage + 2)]);
                setCurrentPage(prevPage);
                if (viewerRef.current) {
                    const pageElement = viewerRef.current.querySelector(`[data-page-number="${prevPage}"]`);
                    if (pageElement) {
                        pageElement.scrollIntoView({ behavior: 'auto' });
                    }
                }
            }
        }
    }));

    useEffect(() => {
        if (!search.trim()) {
            setSearchText('');
            setSearchResults([]);
            setCurrentResultIndex(-1);
            return;
        }
        setSearchText(search);
        findOccurrences(search);
    }, [search]);

    useEffect(() => {
        setZoomLevel(zoom);
    }, [zoom]);

    const textRenderer = useCallback(
        (textItem: { str: string }) => {
            const { str } = textItem;
            const isSelected = searchResults[currentResultIndex] === currentPage;
            return highlightPattern(str, searchText, isSelected);
        },
        [searchText, searchResults, currentResultIndex, currentPage]
    );

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
        setRenderRange([1, Math.min(5, numPages)]);
    }

    const findOccurrences = async (term: string) => {
        try {
            const loadingTask = pdfjs.getDocument(pdfPath);
            const pdfDocument = await loadingTask.promise; // Await the promise to get the PDFDocumentProxy
            const chunkSize = 5; // Number of pages to process in parallel
            const results: number[] = [];

            for (let chunkStart = 1; chunkStart <= numPages; chunkStart += chunkSize) {
                const chunkEnd = Math.min(chunkStart + chunkSize - 1, numPages);
                const pagePromises = [];

                for (let pageNum = chunkStart; pageNum <= chunkEnd; pageNum++) {
                    pagePromises.push(pdfDocument.getPage(pageNum).then(page => page.getTextContent().then(textContent => ({
                        pageNum,
                        textItems: textContent.items.map((item: any) => item.str).join(' ')
                    }))));
                }

                const pages = await Promise.all(pagePromises);

                for (const { pageNum, textItems } of pages) {
                    if (textItems.toLowerCase().includes(term.toLowerCase())) {
                        results.push(pageNum);
                        if (results.length === 1) {
                            // Scroll to the first occurrence immediately
                            setRenderRange([Math.max(1, pageNum - 2), Math.min(numPages, pageNum + 2)]);
                            setCurrentPage(pageNum);
                            if (viewerRef.current) {
                                const pageElement = viewerRef.current.querySelector(`[data-page-number="${pageNum}"]`);
                                if (pageElement) {
                                    pageElement.scrollIntoView({ behavior: 'auto' });
                                }
                            }
                        }
                    }
                }
            }

            setSearchResults(results);
            if (results.length > 0 && currentResultIndex === -1) {
                setCurrentResultIndex(0);
            }
        } catch (error) {
            console.error('Error finding occurrences:', error);
        }
    };

    const renderPages = () => {
        const pages = [];
        const [startPage, endPage] = renderRange;

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <div key={`pageParent_${i}`} style={{ position: 'relative' }}>
                    <span
                        key={`pageCounter_${i}`}
                        style={{
                            zIndex: 25,
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            backgroundColor: 'green',
                            color: 'white',
                            padding: '5px',
                            borderRadius: '0px 0px 0px 5px'
                        }}>
                        {i + " of " + numPages}
                    </span>
                    <Page
                        key={`page_${i}`}
                        pageNumber={i}
                        customTextRenderer={textRenderer}
                        scale={zoomLevel}
                    />
                </div>
            );
        }
        return pages;
    };


    return (
        <div ref={viewerRef} className="pdf-body">
            <Document
                className="pdf-body"
                options={options}
                onLoadSuccess={onDocumentLoadSuccess}
                file={pdfPath}
            >
                {renderPages()}
            </Document>
        </div>
    );
});

export default PdfViewer;