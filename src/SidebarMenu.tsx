import * as React from "react";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EcoIcon from "@mui/icons-material/Eco";

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
        slots={{ expandIcon: ExpandMoreIcon, collapseIcon: ChevronRightIcon }}
      >
        <TreeItem
          itemId="reports"
          label={<TreeLabel icon={<EcoIcon fontSize="small" />} text="Отчеты" />}
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
