import * as React from "react";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
function NotebookIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="6" y="3" width="12" height="18" rx="2" ry="2" />
      <path d="M6 3v18" />
      <path d="M8 7h6M8 11h6M8 15h6" />
    </svg>
  );
}

function BulletIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="5" cy="5" r="4" />
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
          label={<TreeLabel icon={<NotebookIcon />} text="Отчеты" />}
        >
          <TreeItem
            itemId="reports.transport"
            label={<TreeLabel icon={<BulletIcon />} text="Отчет по транспортировкам" />}
          />
        </TreeItem>
      </SimpleTreeView>
    </nav>
  );
}
