import React, { useState } from "react";
import CrimeAgainstWomenChart from "./components/CrimeAgainstWomenChart";
import MissingChildrenChart from "./components/MissingChildrenChart";
import HistoricalCrimeTrends from "./components/HistoricalCrimeTrends";
import CrimeCategoryBreakdown from "./components/CrimeCategoryBreakdown";
import "./Dashboard.css";

const Dashboard = () => {
  const [activeView, setActiveView] = useState("overview");
  const [selectedState, setSelectedState] = useState(null);

  const navigationItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "women-crimes", label: "Crimes Against Women", icon: "👩" },
    { id: "missing-children", label: "Missing Children", icon: "👶" },
    { id: "historical", label: "Historical Trends", icon: "📈" },
    { id: "categories", label: "Crime Categories", icon: "🔍" },
  ];

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return (
          <div className="dashboard-grid">
            <div className="chart-panel">
              <h3>Crimes Against Women (2022)</h3>
              <CrimeAgainstWomenChart compact={true} />
            </div>
            <div className="chart-panel">
              <h3>Missing Children (2022)</h3>
              <MissingChildrenChart compact={true} />
            </div>
            <div className="chart-panel">
              <h3>Historical Crime Trends</h3>
              <HistoricalCrimeTrends compact={true} />
            </div>
            <div className="chart-panel">
              <h3>Crime Category Breakdown</h3>
              <CrimeCategoryBreakdown compact={true} />
            </div>
          </div>
        );
      case "women-crimes":
        return <CrimeAgainstWomenChart />;
      case "missing-children":
        return <MissingChildrenChart />;
      case "historical":
        return <HistoricalCrimeTrends />;
      case "categories":
        return <CrimeCategoryBreakdown />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>India Crime Data Dashboard</h1>
        <p>Comprehensive analysis of crime statistics across Indian states</p>
      </header>

      <nav className="dashboard-nav">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? "active" : ""}`}
            onClick={() => setActiveView(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="dashboard-content">{renderContent()}</main>
    </div>
  );
};

export default Dashboard;
