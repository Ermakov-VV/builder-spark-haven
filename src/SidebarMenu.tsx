import * as React from "react";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ComputerIcon from "@mui/icons-material/Computer";
import ConstructionIcon from "@mui/icons-material/Construction";
import Tooltip from "@mui/material/Tooltip";
import { Link } from "react-router-dom";

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
        defaultExpandedItems={["tools", "reports"]}
        slots={{ expandIcon: ChevronRightIcon, collapseIcon: ExpandMoreIcon }}
      >
        <TreeItem
          itemId="home"
          label={
            <Tooltip title="Главная" placement="right">
              <Link to="/" className="tree-link">
                <TreeLabel icon={<ComputerIcon fontSize="small" />} text="Главная" />
              </Link>
            </Tooltip>
          }
        />

        <TreeItem
          itemId="tools"
          label={
            <Tooltip title="Инструменты" placement="right">
              <TreeLabel icon={<ConstructionIcon fontSize="small" />} text="Инструменты" />
            </Tooltip>
          }
        >
          <TreeItem
            itemId="tools.srvp"
            label={<TreeLabel icon={<BulletIcon />} text="Маршрутизация SRVP" />}
          />
          <TreeItem
            itemId="tools.geocode"
            label={<TreeLabel icon={<BulletIcon />} text="Геокодирование" />}
          />
        </TreeItem>

        <TreeItem
          itemId="reports"
          label={
            <Tooltip title="Отчеты" placement="right">
              <TreeLabel icon={<AssignmentIcon fontSize="small" />} text="Отчеты" />
            </Tooltip>
          }
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
