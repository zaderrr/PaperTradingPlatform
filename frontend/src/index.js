import React from "react";
import {createRoot} from "react-dom/client";
import "./index.css"
import TradingPage from "./Components/TradingPage.js";


const app = document.getElementById("root")
const root = createRoot(app)

root.render(<TradingPage></TradingPage>)