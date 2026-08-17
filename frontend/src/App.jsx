import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import OverView from "./components/Overview";
import Branches from "./components/Branches";
import BranchDetail from "./components/BranchDetail";
import SalesReps from "./components/SalesReps";
import LeadAging from "./components/LeadAging";
import SalesRepDetails from "./components/SalesRepDetails";
import SalesForecast from "./components/SalesForcast";
import LeaderBoard from "./components/LeaderBoard";
import DeliveryDelay from "./components/DeliveryDelay";
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
          <Route path="/sales-reps/:repId" element={<SalesRepDetails />} />
          <Route path="/lead-aging" element={<LeadAging />} />
          <Route path="/sales-forecast" element={<SalesForecast />} />
          <Route path="/leader-board" element={<LeaderBoard />} />
          
          <Route path="/deliveries" element={<DeliveryDelay />} />
          <Route path="/lead-aging" element={<LeadAging />} />
        </Routes>
      </main>
    </div>
    </>
  );
}