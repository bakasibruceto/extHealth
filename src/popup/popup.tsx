import React from "react";
import { createRoot } from "react-dom/client";
import "./popup.css";
import sampleFact from "./sampleData"; // simulated data removed after

import { getCategoryState, getPopupState } from "./../utils/storage";
import { sendMessageToContentScript, } from "../utils/general";
import { Toggle, Category } from "./components";

import Layout from "./layout/layout";

const Popup = () => {

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