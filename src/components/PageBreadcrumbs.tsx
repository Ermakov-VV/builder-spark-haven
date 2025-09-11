import * as React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import { Link, useLocation } from "react-router-dom";

function useRouteMeta(pathname: string) {
  const titles: Record<string, string> = {
    "/": "Главная",
    "/tools": "Инструменты",
    "/tools/srvp": "Маршрутизация SRVP",
    "/tools/geocode": "Геокодирование",
    "/reports": "Отчеты",
    "/reports/transport": "Отчет по транспортировкам",
  };

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; to?: string }[] = [];

  crumbs.push({ label: "Главная", to: "/" });

  if (segments.length === 0) {
    return { title: titles["/"], crumbs };
  }

  const first = `/${segments[0]}`;
  if (first === "/tools" || first === "/reports") {
    const isIndex = segments.length === 1;
    crumbs.push({ label: titles[first], to: isIndex ? undefined : first });
  }

  const full = `/${segments.join("/")}`;
  const title = titles[full] || "";
  if (full !== first && title) {
    crumbs.push({ label: title });
  }

  return { title: title || titles[first] || titles["/"], crumbs };
}

export default function PageBreadcrumbs({ onCurrentClick }: { onCurrentClick?: () => void }) {
  const { pathname } = useLocation();
  const { crumbs } = useRouteMeta(pathname);

  return (
    <Breadcrumbs aria-label="breadcrumb" className="page-breadcrumbs" separator="/">
      {crumbs.map((c, idx) => {
        if (c.to) {
          return (
            <Link key={idx} to={c.to} className="page-breadcrumb-link">
              {c.label}
            </Link>
          );
        }
        const isCurrent = idx === crumbs.length - 1;
        if (isCurrent && onCurrentClick) {
          return (
            <Typography
              key={idx}
              variant="body2"
              className="page-breadcrumb-text page-breadcrumb-current-action"
              role="button"
              tabIndex={0}
              onClick={onCurrentClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCurrentClick();
                }
              }}
            >
              {c.label}
            </Typography>
          );
        }
        return (
          <Typography key={idx} variant="body2" className="page-breadcrumb-text">
            {c.label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}
