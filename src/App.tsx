import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import NotificationsIcon from "@mui/icons-material/Notifications";
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
            </div>
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
      </div>
    </>
  );
}
