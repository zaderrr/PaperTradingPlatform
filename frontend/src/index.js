import React from "react";
import ReactDOM from "react-dom";
import { Route,Routes,BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"
import TradingPage from "./Components/TradingPage";

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TradingPage />}/>
      <Route path="" element={<TradingPage />}/>
    </Routes>
  </BrowserRouter>,
  document.getElementById("root")
);
