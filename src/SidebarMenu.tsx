import * as React from "react";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
function LeafIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 21c4.97 0 9-4.03 9-9 0-3.87 3.13-7 7-7 .55 0 1 .45 1 1 0 6.63-5.37 12-12 12-.55 0-1 .45-1 1s.45 1 1 1zM5 21c-1.1 0-2-.9-2-2 0-4.42 3.58-8 8-8 1.1 0 2 .9 2 2 0 4.42-3.58 8-8 8z"/>
    </svg>
  );
}

function TreeLabel({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <span className="tree-item-label">
      {icon && <span className="tree-item-label-icon">{icon}</span>}
      <span className="tree-item-label-text">{text}</span>
    </span>
  );
}

export default function SidebarMenu() {
  return (
    <nav className="sidebar-nav">
      <SimpleTreeView
        className="sidebar-tree"
        aria-label="sidebar navigation"
        defaultExpandedItems={["reports"]}
        slots={{ expandIcon: ChevronRightIcon, collapseIcon: ExpandMoreIcon }}
      >
        <TreeItem
          itemId="reports"
          label={<TreeLabel icon={<LeafIcon />} text="Отчеты" />}
        >
          <TreeItem
            itemId="reports.transport"
            label={<TreeLabel text="Отчет по транспортировкам" />}
          />
        </TreeItem>
      </SimpleTreeView>
    </nav>
  );
}
