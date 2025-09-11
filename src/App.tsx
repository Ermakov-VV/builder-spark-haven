import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import SidebarMenu from "./SidebarMenu";

export default function App() {
  return (
    <>
      <CssBaseline enableColorScheme />
      <div className="viewport-grid-128x64 layout-grid">
        <aside className="sidebar-left-22">
          <SidebarMenu />
        </aside>
      </div>
    </>
  );
}
