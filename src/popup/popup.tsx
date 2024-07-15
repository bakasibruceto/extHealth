import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./popup.css";
import sampleFact from "./sampleData"; // simulated data removed after

import { Toggle } from "./components";

import FactCheckingSection from "./components/factcheck/FactCheckingSection"

import Layout from "./layout/layout";

const Popup = () => {
    
    useEffect(() => {
        chrome.storage.local.set({ extHealthFacts: sampleFact });
    }, []);

    return (
        <>
            <Layout />
        </>
    );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<Popup />);