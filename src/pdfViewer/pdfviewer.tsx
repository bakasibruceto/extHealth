// pdfviewer.tsx
import React, { useImperativeHandle, forwardRef, useRef, useCallback, useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

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

function highlightPattern(text: string, pattern: string): string {
    const regex = new RegExp(pattern, 'gi');
    return text.replace(regex, (value) => `<mark>${value}</mark>`);
}

const PdfViewer = forwardRef(({ pdfPath, initialPage = 1, search = '', zoom = 1.0 }: PdfViewerProps, ref) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(initialPage);
    const [searchText, setSearchText] = useState<string>(search);
    const [zoomLevel, setZoomLevel] = useState<number>(zoom);
    const viewerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        scrollToTop: () => {
            if (viewerRef.current) {
                viewerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        scrollToPage: (pageNum: number) => {
            if (viewerRef.current) {
                const pageElement = viewerRef.current.querySelector(`[data-page-number="${pageNum}"]`);
                if (pageElement) {
                    pageElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }));

    useEffect(() => {
        setSearchText(search);
        if (search) {
            findFirstOccurrence(search);
        }
    }, [search]);

    useEffect(() => {
        setZoomLevel(zoom);
    }, [zoom]);

    const textRenderer = useCallback(
        (textItem: { str: string }) => {
            const { str } = textItem;
            return highlightPattern(str, searchText);
        },
        [searchText]
    );

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    const findFirstOccurrence = async (term: string) => {
        try {
            const loadingTask = pdfjs.getDocument(pdfPath);
            const pdfDocument = await loadingTask.promise; // Await the promise to get the PDFDocumentProxy
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdfDocument.getPage(pageNum); // Call getPage on the PDFDocumentProxy
                const textContent = await page.getTextContent();
                const textItems = textContent.items.map((item: any) => item.str).join(' ');
                if (textItems.toLowerCase().includes(term.toLowerCase())) {
                    setCurrentPage(pageNum);
                    if (viewerRef.current) {
                        const pageElement = viewerRef.current.querySelector(`[data-page-number="${pageNum}"]`);
                        if (pageElement) {
                            pageElement.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                    break;
                }
            }
        } catch (error) {
            console.error('Error finding first occurrence:', error);
        }
    };

    const renderPages = () => {
        const pages = [];
        for (let i = 0; i < numPages; i++) {
            pages.push(
                <div key={`pageParent_${i + 1}`} style={{ position: 'relative' }}>
                    <span
                        key={`pageCounter_${i + 1}`}
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
                        {i + 1 + " of " + numPages}
                    </span>
                    <Page
                        key={`page_${i + 1}`}
                        pageNumber={i + 1}
                        customTextRenderer={textRenderer}
                        scale={zoomLevel}
                    />
                </div>
            );
        }
        return pages;
    };

    return (
        <div ref={viewerRef} style={{ textAlign: 'center', margin: '20px' }}>
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