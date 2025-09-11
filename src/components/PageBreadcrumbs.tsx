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
  if (first === "/tools") {
    crumbs.push({ label: titles[first] });
  } else if (first === "/reports") {
    crumbs.push({ label: titles[first] });
  }

  const full = `/${segments.join("/")}`;
  const title = titles[full] || "";
  if (full !== first && title) {
    crumbs.push({ label: title });
  }

  return { title: title || titles[first] || titles["/"], crumbs };
}

export default function PageBreadcrumbs() {
  const { pathname } = useLocation();
  const { crumbs } = useRouteMeta(pathname);

  return (
    <Breadcrumbs aria-label="breadcrumb" className="page-breadcrumbs" separator="/">
      {crumbs.map((c, idx) =>
        c.to ? (
          <Link key={idx} to={c.to} className="page-breadcrumb-link">
            {c.label}
          </Link>
        ) : (
          <Typography key={idx} variant="body2" className="page-breadcrumb-text">
            {c.label}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  );
}
