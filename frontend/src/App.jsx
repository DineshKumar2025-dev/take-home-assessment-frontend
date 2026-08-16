import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./Sidebar";
import OverView from "./components/Overview";
import Branches from "./components/Branches";
import BranchDetail from "./components/BranchDetail";
import SalesReps from "./components/SalesReps";
import LeadAging from "./components/LeadAging";
import SalesRepDetails from "./components/SalesRepDetails";

import "./App.css";

export default function App() {

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      

      <div className={`app-shell ${isCollapsed ? "collapsed" : ""}`}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
 
      <main className="main-content">
        <Routes>
          <Route path="/" element={<OverView />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/branches/:branchId" element={<BranchDetail />} />
          <Route path="/sales-reps" element={<SalesReps />} />
          <Route path="/sales-reps/:salesrepsID" element={SalesRepDetails}/>
          <Route path="/lead-aging" element={<LeadAging />} />
        </Routes>
      </main>
    </div>
    </>
  );
}