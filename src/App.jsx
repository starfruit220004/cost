import { StrictMode } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";

import "./index.css";

import CostingTable from "./CostingTable.jsx";
import Stocks from "./Stocks.jsx";
import Sales from "./Sales.jsx"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CostingTable />} />
        <Route path="/costing" element={<CostingTable />} />
        <Route path="/stocks" element={<Stocks />} />
        <Route path="/sales" element={<Sales />} /> 
      </Routes>
    </Router>
  );
}
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
export default App;