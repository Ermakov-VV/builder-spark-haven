import * as React from "react";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ComputerIcon from "@mui/icons-material/Computer";
import ConstructionIcon from "@mui/icons-material/Construction";
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
    <span className="tree-item-label" title={text} aria-label={text}>
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
            <Link to="/" className="tree-link" title="Главная" aria-label="Главная">
              <TreeLabel icon={<ComputerIcon fontSize="small" />} text="Главная" />
            </Link>
          }
        />

        <TreeItem
          itemId="tools"
          label={
            <Link to="/tools" className="tree-link" title="Инструменты" aria-label="Инструменты">
              <TreeLabel icon={<ConstructionIcon fontSize="small" />} text="Инструменты" />
            </Link>
          }
        >
          <TreeItem
            itemId="tools.srvp"
            label={
            <Link to="/tools/srvp" className="tree-link" title="Маршрутизация SRVP" aria-label="Маршрутизация SRVP">
              <TreeLabel icon={<BulletIcon />} text="Маршрутизация SRVP" />
            </Link>
          }
          />
          <TreeItem
            itemId="tools.geocode"
            label={
            <Link to="/tools/geocode" className="tree-link" title="Геокодирование" aria-label="Геокодирование">
              <TreeLabel icon={<BulletIcon />} text="Геокодирование" />
            </Link>
          }
          />
        </TreeItem>

        <TreeItem
          itemId="reports"
          label={
            <Link to="/reports" className="tree-link" title="Отчеты" aria-label="Отчеты">
              <TreeLabel icon={<AssignmentIcon fontSize="small" />} text="Отчеты" />
            </Link>
          }
        >
          <TreeItem
            itemId="reports.transport"
            label={
            <Link to="/reports/transport" className="tree-link" title="Отчет по транспортировкам" aria-label="Отчет по транспортировкам">
              <TreeLabel icon={<BulletIcon />} text="Отчет по транспортировкам" />
            </Link>
          }
          />
        </TreeItem>
      </SimpleTreeView>
    </nav>
  );
}
