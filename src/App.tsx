import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ToolsSrvp from "./pages/ToolsSrvp";
import ToolsGeocode from "./pages/ToolsGeocode";
import ReportsTransport from "./pages/ReportsTransport";
import HeaderRouteInfo from "./HeaderRouteInfo";
import SidebarMenu from "./SidebarMenu";

export default function App() {
  return (
    <>
      <CssBaseline enableColorScheme />
      <div className="viewport-grid-128x64 layout-grid">
        <header className="app-header-3">
          <div className="app-header-content">
            <div className="app-header-left">
              <img src="/vite.svg" alt="Логотип" className="app-header-logo" />
              <span className="app-header-brand">
                <span>ARMTEK</span>
                <span className="app-header-brand-accent">RME</span>
              </span>
            </div>
            <HeaderRouteInfo />
            <div className="app-header-right">
              <IconButton aria-label="notifications" className="header-action-btn" size="small">
                <NotificationsIcon />
              </IconButton>
            </div>
          </div>
        </header>
        <aside className="sidebar-left-22">
          <SidebarMenu />
        </aside>
        <main className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools/srvp" element={<ToolsSrvp />} />
            <Route path="/tools/geocode" element={<ToolsGeocode />} />
            <Route path="/reports/transport" element={<ReportsTransport />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
