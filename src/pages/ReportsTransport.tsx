import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { DateRangePicker, CustomProvider } from "rsuite";
import Select, { components, MenuListProps, OptionProps, MultiValue } from "react-select";
import ruRU from "rsuite/esm/locales/ru_RU";
import "rsuite/dist/rsuite-no-reset.min.css";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { Table, ConfigProvider } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import ruLocale from "antd/locale/ru_RU";
import ApexChart from "react-apexcharts";
import { PieChart } from "@mui/x-charts";
import svrpBundle from '../assets/svrp-transport.json';

type SVRPRoute = { RouteId: string; RouteName: string };

type SVRPItem = {
  TransportationId: string;
  PlanningPoint: string;
  PlanningPointName: string;
  DriverId: string;
  DriverName: string;
  CarBrand: string;
  CarNumber: string;
  AddressPointCount: number;
  FactYandexPointCount: number;
  FactETPPointCount: number;
  FailedPointCount: number;
  SumFailedPointCount?: number;
  PlanDepartureTime: string; // \/Date(1735365600000)\/
  SVRPRouteData: SVRPRoute[];
};

type PlanningOption = { mpt: string; name: string; value: string; label: string };

type TransportRow = {
  key: string;
  mpt: string;
  transportNo: string;
  driver: string;
  carBrand: string;
  carPlate: string;
  route: string | string[];
  addressCount: number;
  etpPointsCount: number;
  ymPointsCount: number;
  outOfOrderCount: number;
  violationsPct: number;
  hasViolations: boolean;
  planDepartureISO: string; // ISO string
  raw: SVRPItem;
};

function parseDotNetDate(str: string): Date | null {
  // Expect \/Date(1735365600000)\/
  const m = /Date\((\d+)\)/.exec(str.replace(/\\\//g, ""));
  if (!m) return null;
  const ms = Number(m[1]);
  if (!Number.isFinite(ms)) return null;
  return new Date(ms);
}

export default function ReportsTransport() {
  dayjs.locale("ru");
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = React.useState(true);
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return [start, end];
  });

  const [data, setData] = React.useState<SVRPItem[]>([]);
  const [planningOptions, setPlanningOptions] = React.useState<PlanningOption[]>([]);
  const [selectedPlanning, setSelectedPlanning] = React.useState<string[]>([]);
  // Applied filter values (used by charts/table); update only on Apply
  const [appliedDateRange, setAppliedDateRange] = React.useState<[Date | null, Date | null]>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return [start, end];
  });
  const [appliedPlanning, setAppliedPlanning] = React.useState<string[]>([]);

  const [touchedDate, setTouchedDate] = React.useState(false);
  const [touchedPlanning, setTouchedPlanning] = React.useState(false);
  const isDateValid = Boolean(dateRange[0]) && Boolean(dateRange[1]);
  const isPlanningValid = selectedPlanning.length > 0;
  const isFormValid = isDateValid && isPlanningValid;
  // Validity for applied filters
  const isFilterDateValid = Boolean(appliedDateRange[0]) && Boolean(appliedDateRange[1]);
  const isFilterPlanningValid = appliedPlanning.length > 0;

  const getDialogContainer = React.useCallback(() => (document.querySelector('.MuiDialog-root') as HTMLElement) || document.body, []);

  // Load SVRP data from static asset
  React.useEffect(() => {
    const bundled = (svrpBundle as any);
    const arr: SVRPItem[] = Array.isArray(bundled?.SVRPFactTransportation) ? bundled.SVRPFactTransportation : [];
    setData(arr);
    const map = new Map<string, string>();
    arr.forEach((it) => { if (!map.has(it.PlanningPoint)) map.set(it.PlanningPoint, it.PlanningPointName); });
    const opts: PlanningOption[] = Array.from(map.entries()).map(([code, name]) => ({ mpt: code, name, value: code, label: `${code} — ${name}` }));
    setPlanningOptions(opts);
    if (selectedPlanning.length === 0 && opts.length > 0) {
      const all = opts.map((o) => o.value);
      setSelectedPlanning(all);
      if (appliedPlanning.length === 0) setAppliedPlanning(all);
    }
  }, []);

  const [cards, setCards] = React.useState([
    { id: "card1", title: "Карточка 1" },
    { id: "card2", title: "Карточка 2" },
    { id: "card4", title: "Количество транспор��ировок по ��ням" },
    { id: "card5", title: "Карточка 5" },
  ]);

  const tableData: TransportRow[] = React.useMemo(() => {
    if (!isFilterDateValid) return [];
    const start = appliedDateRange[0] ? dayjs(appliedDateRange[0]).startOf("day") : null;
    const end = appliedDateRange[1] ? dayjs(appliedDateRange[1]).endOf("day") : null;
    const filtered = data.filter((it) => {
      if (appliedPlanning.length && !appliedPlanning.includes(it.PlanningPoint)) return false;
      const d = parseDotNetDate(it.PlanDepartureTime);
      if (!d) return false;
      const dj = dayjs(d);
      if (start && dj.isBefore(start)) return false;
      if (end && dj.isAfter(end)) return false;
      return true;
    });
    return filtered.map((it) => {
      const d = parseDotNetDate(it.PlanDepartureTime) || new Date();
      const routes = Array.isArray(it.SVRPRouteData) ? it.SVRPRouteData.map((r) => r.RouteName) : [];
      const sumFailedRaw = Number.isFinite(Number(it.SumFailedPointCount)) ? Number(it.SumFailedPointCount) : (it.FactYandexPointCount + it.FactETPPointCount + it.FailedPointCount);
      const sumFailed = Math.min(sumFailedRaw, Math.max(0, it.AddressPointCount || 0));
      const hasViol = sumFailed > 0;
      const violationsPct = it.AddressPointCount > 0 ? Math.round((sumFailed / it.AddressPointCount) * 100) : 0;
      return {
        key: it.TransportationId,
        mpt: it.PlanningPoint,
        transportNo: it.TransportationId,
        driver: it.DriverName,
        carBrand: it.CarBrand,
        carPlate: it.CarNumber,
        route: routes.length <= 1 ? (routes[0] || "") : routes,
        addressCount: it.AddressPointCount,
        etpPointsCount: it.FactETPPointCount,
        ymPointsCount: it.FactYandexPointCount,
        outOfOrderCount: it.FailedPointCount,
        violationsPct,
        hasViolations: hasViol,
        planDepartureISO: d.toISOString(),
        raw: it,
      } as TransportRow;
    });
  }, [data, appliedDateRange, appliedPlanning, isFilterDateValid]);

  const [searchText, setSearchText] = React.useState("");
  const [kpiFilter, setKpiFilter] = React.useState<'all' | 'ok' | 'bad'>('all');
  const kpiFilteredData = React.useMemo(() => {
    if (kpiFilter === 'ok') return tableData.filter((r) => !r.hasViolations);
    if (kpiFilter === 'bad') return tableData.filter((r) => r.hasViolations);
    return tableData;
  }, [tableData, kpiFilter]);
  const [kpi2Filter, setKpi2Filter] = React.useState<'none' | 'etp' | 'ym' | 'order'>('none');
  const combinedData = React.useMemo(() => {
    let base = kpiFilteredData;
    if (kpi2Filter === 'etp') base = base.filter((r) => (r.etpPointsCount || 0) > 0);
    if (kpi2Filter === 'ym') base = base.filter((r) => (r.ymPointsCount || 0) > 0);
    if (kpi2Filter === 'order') base = base.filter((r) => (r.outOfOrderCount || 0) > 0);
    return base;
  }, [kpiFilteredData, kpi2Filter]);

  const normalized = (v: unknown) => String(v ?? "").toLowerCase();
  const recordMatchesSearch = (r: TransportRow, q: string) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    const routeList = Array.isArray(r.route) ? r.route : [r.route];
    const hay = [
      r.mpt,
      r.transportNo,
      r.driver,
      r.carBrand,
      r.carPlate,
      ...routeList,
      routeList.join(" "),
      r.addressCount,
      r.outOfOrderCount,
      dayjs(r.planDepartureISO).format("DD.MM.YYYY HH:mm"),
      r.planDepartureISO,
    ]
      .map(normalized)
      .join(" ");
    return hay.includes(needle);
  };

  const filteredData = React.useMemo(() => combinedData.filter((r) => recordMatchesSearch(r, searchText)), [combinedData, searchText]);

  const dateChart = React.useMemo(() => {
    if (!isFilterDateValid) return { labels: [], totals: [], violations: [] };
    const startSel = appliedDateRange?.[0] ? dayjs(appliedDateRange[0]) : dayjs();
    const mStart = startSel.startOf('month');
    const mEnd = startSel.endOf('month');

    const labelsAll: string[] = [];
    const keysAll: string[] = [];
    let cur = mStart.startOf('day');
    const last = mEnd.startOf('day');
    while (cur.isBefore(last) || cur.isSame(last)) {
      labelsAll.push(cur.format('DD.MM.YYYY'));
      keysAll.push(cur.format('YYYY-MM-DD'));
      cur = cur.add(1, 'day');
    }

    const totalsMap = new Map<string, number>();
    const violMap = new Map<string, number>();
    keysAll.forEach((k) => { totalsMap.set(k, 0); violMap.set(k, 0); });
    combinedData.forEach((r) => {
      const k = dayjs(r.planDepartureISO).format('YYYY-MM-DD');
      if (!totalsMap.has(k)) return;
      totalsMap.set(k, (totalsMap.get(k) || 0) + 1);
      if (r.hasViolations) violMap.set(k, (violMap.get(k) || 0) + 1);
    });

    const rows = keysAll.map((k, i) => ({ label: labelsAll[i], t: totalsMap.get(k) || 0, v: violMap.get(k) || 0 }))
      .filter((r) => r.t > 0);

    return {
      labels: rows.map((r) => r.label),
      totals: rows.map((r) => r.t),
      violations: rows.map((r) => r.v),
    };
  }, [combinedData, appliedDateRange, isFilterDateValid]);

  const yMax = React.useMemo(() => {
    const t = dateChart.totals || [];
    const v = dateChart.violations || [];
    const maxVal = Math.max(0, ...(t.length ? t : [0]), ...(v.length ? v : [0]));
    return Math.max(1, maxVal);
  }, [dateChart]);

  const cardTotals = React.useMemo(() => {
    const total = tableData.length;
    let withViol = 0;
    tableData.forEach((r) => { if (r.hasViolations) withViol++; });
    const withoutViol = Math.max(0, total - withViol);
    const pctWith = total > 0 ? (withViol / total) * 100 : 0;
    const pctWithout = total > 0 ? (withoutViol / total) * 100 : 0;
    return { total, withViolations: withViol, withoutViolations: withoutViol, pctWith, pctWithout };
  }, [tableData]);

  const card2Sums = React.useMemo(() => {
    let etp = 0, ym = 0, failed = 0;
    kpiFilteredData.forEach((r) => { etp += r.etpPointsCount; ym += r.ymPointsCount; failed += r.outOfOrderCount; });
    return { etp, ym, failed };
  }, [kpiFilteredData]);

  const apexSeries = React.useMemo(() => (
    [
      { name: "Всего", data: dateChart.totals || [] },
      { name: "С наруш��ниями", data: dateChart.violations || [] },
    ]
  ), [dateChart]);

  const apexOptions = React.useMemo(() => ({
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '60%', borderRadius: 4 } },
    colors: ['#008ffb', '#9c27b0'],
    xaxis: {
      categories: dateChart.labels || [],
      tickPlacement: 'between',
      labels: { rotate: -45, hideOverlappingLabels: false, trim: false },
    },
    yaxis: {
      min: 0,
      max: yMax,
      tickAmount: Math.max(1, yMax),
      forceNiceScale: false,
      labels: { formatter: (val: number) => `${Math.round(val)}` },
    },
    legend: { position: 'bottom', horizontalAlign: 'center' },
    dataLabels: { enabled: false },
    grid: { yaxis: { lines: { show: true } } },
    tooltip: { shared: true, intersect: false },
  }), [dateChart, yMax]);

  const [tablePagination, setTablePagination] = React.useState<{ current: number; pageSize: number }>({ current: 1, pageSize: 10 });

  const pieContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [pieSize, setPieSize] = React.useState<number>(180);
  React.useEffect(() => {
    const el = pieContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        const h = e.contentRect.height;
        const size = Math.floor(Math.max(120, Math.min(w, h) - 40));
        setPieSize(size);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pie2ContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [pie2Size, setPie2Size] = React.useState<number>(180);
  React.useEffect(() => {
    const el = pie2ContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        const h = e.contentRect.height;
        const size = Math.floor(Math.max(120, Math.min(w, h) - 40));
        setPie2Size(size);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  React.useEffect(() => {
    setTablePagination((p) => ({ ...p, current: 1 }));
  }, [searchText, kpiFilter, kpi2Filter]);

  const [routeDialogOpen, setRouteDialogOpen] = React.useState(false);
  const [routeDialogItems, setRouteDialogItems] = React.useState<string[]>([]);

  const openRoutesDialog = (routes: string[]) => {
    setRouteDialogItems(routes);
    setRouteDialogOpen(true);
  };

  const columns: ColumnsType<TransportRow> = React.useMemo(
    () => [
      {
        title: "МПТ",
        dataIndex: "mpt",
        key: "mpt",
        sorter: (a: TransportRow, b: TransportRow) => a.mpt.localeCompare(b.mpt),
      },
      {
        title: "№ Транспортировки",
        dataIndex: "transportNo",
        key: "transportNo",
        sorter: (a: TransportRow, b: TransportRow) => a.transportNo.localeCompare(b.transportNo),
      },
      {
        title: "Водитель",
        dataIndex: "driver",
        key: "driver",
        sorter: (a: TransportRow, b: TransportRow) => a.driver.localeCompare(b.driver),
        render: (_: string, rec: TransportRow) => (
          <div className="driver-cell">
            <div className="driver-name">{rec.driver}</div>
            <div className="driver-meta">{rec.carBrand}</div>
            <div className="driver-meta">{rec.carPlate}</div>
          </div>
        ),
      },
      {
        title: "Маршрут",
        dataIndex: "route",
        key: "route",
        sorter: (a: TransportRow, b: TransportRow) => {
          const a1 = Array.isArray(a.route) ? a.route[0] : a.route;
          const b1 = Array.isArray(b.route) ? b.route[0] : b.route;
          return (a1 || "").localeCompare(b1 || "");
        },
        render: (val: string | string[]) => {
          const list = Array.isArray(val) ? val : [val];
          const first = list[0] || '';
          if (list.length <= 1) return (<div className="route-cell"><div className="route-main">{first}</div></div>);
          const rest = list.length - 1;
          return (
            <div className="route-cell">
              <div className="route-main">{first}</div>
              <div className="route-more">
                <a
                  href="#"
                  className="route-more-link"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openRoutesDialog(list); }}
                >
                  и ещё {rest}
                </a>
              </div>
            </div>
          );
        },
      },
      {
        title: "Ко��-во адресов",
        dataIndex: "addressCount",
        key: "addressCount",
        sorter: (a: TransportRow, b: TransportRow) => a.addressCount - b.addressCount,
      },
      {
        title: "Кол-во тчк ЭТП",
        dataIndex: "etpPointsCount",
        key: "etpPointsCount",
        sorter: (a: TransportRow, b: TransportRow) => a.etpPointsCount - b.etpPointsCount,
      },
      {
        title: "Ко����-во тчк ЯМ",
        dataIndex: "ymPointsCount",
        key: "ymPointsCount",
        sorter: (a: TransportRow, b: TransportRow) => a.ymPointsCount - b.ymPointsCount,
      },
      {
        title: "Кол-во точек не по-порядку",
        dataIndex: "outOfOrderCount",
        key: "outOfOrderCount",
        sorter: (a: TransportRow, b: TransportRow) => a.outOfOrderCount - b.outOfOrderCount,
      },
      {
        title: "% Нарушений",
        dataIndex: "violationsPct",
        key: "violationsPct",
        sorter: (a: TransportRow, b: TransportRow) => a.violationsPct - b.violationsPct,
        render: (v: number) => `${v}%`,
      },
    ],
    [],
  );

  const [columnsMenuEl, setColumnsMenuEl] = React.useState<null | HTMLElement>(null);
  const [visibleCols, setVisibleCols] = React.useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    (columns as any[]).forEach((c) => { init[String(c.key)] = true; });
    return init;
  });
  const displayedColumns = React.useMemo(
    () => columns.filter((c) => visibleCols[String(c.key)] !== false),
    [columns, visibleCols],
  );

  const draggingIdRef = React.useRef<string | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);
  const cardRefs = React.useRef(new Map<string, HTMLElement>());

  const measurePositions = () => {
    const positions: Record<string, DOMRect> = {};
    cards.forEach((c) => {
      const el = cardRefs.current.get(c.id);
      if (el) positions[c.id] = el.getBoundingClientRect();
    });
    return positions;
  };

  const animateReorder = (fromId: string, toIndex: number) => {
    const start = measurePositions();
    setCards((prev) => {
      const from = prev.findIndex((c) => c.id === fromId);
      if (from === -1) return prev;
      const clampedTo = Math.max(0, Math.min(toIndex, Math.max(prev.length - 1, 0)));
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(clampedTo, 0, moved);
      return next;
    });
    requestAnimationFrame(() => {
      const end = measurePositions();
      cards.forEach((c) => {
        const el = cardRefs.current.get(c.id);
        const first = start[c.id];
        const last = end[c.id];
        if (!el || !first || !last) return;
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        if (dx !== 0 || dy !== 0) {
          el.style.transition = "transform 0s";
          el.style.transform = `translate(${dx}px, ${dy}px)`;
          requestAnimationFrame(() => {
            el.style.transition = "transform 250ms ease";
            el.style.transform = "translate(0px, 0px)";
            const clear = () => {
              el.style.transition = "";
              el.removeEventListener("transitionend", clear);
            };
            el.addEventListener("transitionend", clear);
          });
        }
      });
    });
  };

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    draggingIdRef.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onCardDragOver = (targetIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setOverIndex(targetIndex);
    e.dataTransfer.dropEffect = "move";
  };
  const onGridDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOverIndex(cards.length);
    e.dataTransfer.dropEffect = "move";
  };
  const onCardDrop = (targetIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const fromId = draggingIdRef.current;
    draggingIdRef.current = null;
    if (fromId == null) return;
    animateReorder(fromId, targetIndex);
    setOverIndex(null);
    setDraggingId(null);
  };
  const onGridDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fromId = draggingIdRef.current;
    draggingIdRef.current = null;
    if (fromId == null) return;
    animateReorder(fromId, cards.length);
    setOverIndex(null);
    setDraggingId(null);
  };
  const onDragEnd = () => {
    draggingIdRef.current = null;
    setOverIndex(null);
    setDraggingId(null);
  };

  const onKpiClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const totalEl = target.closest('.card1-total');
    if (totalEl) { setKpiFilter('all'); return; }
    const kpiEl = target.closest('.kpi-inline');
    if (!kpiEl) return;
    const container = target.closest('.card1-summary-left');
    if (!container) return;
    const inlines = Array.from(container.querySelectorAll(':scope > .kpi-inline')) as HTMLElement[];
    const idx = inlines.indexOf(kpiEl as HTMLElement);
    if (idx === 0) setKpiFilter((f) => (f === 'ok' ? 'all' : 'ok'));
    if (idx === 1) setKpiFilter((f) => (f === 'bad' ? 'all' : 'bad'));
  };

  const onKpi2Click = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const kpiEl = target.closest('.kpi-inline');
    if (!kpiEl) return;
    const container = target.closest('.card1-summary-left');
    if (!container) return;
    const inlines = Array.from(container.querySelectorAll(':scope > .kpi-inline')) as HTMLElement[];
    const idx = inlines.indexOf(kpiEl as HTMLElement);
    if (idx === 0) setKpi2Filter((f) => (f === 'etp' ? 'none' : 'etp'));
    if (idx === 1) setKpi2Filter((f) => (f === 'ym' ? 'none' : 'ym'));
    if (idx === 2) setKpi2Filter((f) => (f === 'order' ? 'none' : 'order'));
  };

  const onCard1PieArcClick = React.useCallback((_e: any, d: any) => {
    const label = String(d?.label ?? d?.data?.label ?? '').toLowerCase();
    const id = Number.isFinite(Number(d?.id)) ? Number(d.id) : (Number.isFinite(Number(d?.data?.id)) ? Number(d?.data?.id) : NaN);
    if (label.includes('без') || id === 0) {
      setKpiFilter((f) => (f === 'ok' ? 'all' : 'ok'));
    } else if (label.includes('наруш') || id === 1) {
      setKpiFilter((f) => (f === 'bad' ? 'all' : 'bad'));
    }
  }, []);

  const onCard2PieArcClick = React.useCallback((_e: any, d: any) => {
    const label = String(d?.label ?? d?.data?.label ?? '').toLowerCase();
    const id = Number.isFinite(Number(d?.id)) ? Number(d.id) : (Number.isFinite(Number(d?.data?.id)) ? Number(d?.data?.id) : NaN);
    if (label.includes('этп') || id === 0) {
      setKpi2Filter((f) => (f === 'etp' ? 'none' : 'etp'));
    } else if (label.includes('ям') || id === 1) {
      setKpi2Filter((f) => (f === 'ym' ? 'none' : 'ym'));
    } else if (label.includes('поряд') || id === 2) {
      setKpi2Filter((f) => (f === 'order' ? 'none' : 'order'));
    }
  }, []);

  const handleApply = () => {
    if (isFormValid) {
      setAppliedDateRange(dateRange);
      setAppliedPlanning(selectedPlanning);
      setDialogOpen(false);
    } else {
      setTouchedDate(true);
      setTouchedPlanning(true);
    }
  };

  const handleExit = () => {
    navigate("/reports");
  };

  const handleClose = (_event: object, reason?: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    setDialogOpen(false);
  };

  return (
    <ConfigProvider locale={ruLocale}>
      <div className="reports-transport-page">
        <div className="breadcrumbs-row">
          <PageBreadcrumbs onCurrentClick={() => setDialogOpen(true)} />
          <div className="breadcrumbs-actions">
            <span className="breadcrumbs-date-range" aria-label="Выбранный период">
              {isFilterDateValid ? `${dayjs(appliedDateRange[0]).format('DD.MM.YYYY')} – ${dayjs(appliedDateRange[1]).format('DD.MM.YYYY')}` : '—'}
            </span>
            <Button size="small" variant="outlined" className="breadcrumbs-filter-btn" aria-label="Открыть фильтр" onClick={() => setDialogOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Button>
          </div>
        </div>

        <div className="transport-grid" onDragOver={onGridDragOver} onDrop={onGridDrop}>
          {cards.map((card, idx) => (
            <div
              key={card.id}
              className={`transport-card-wrapper${card.id === "card4" ? " full-width full-rest" : ""}${card.id === "card5" ? " full-width full-rest" : ""}${(card.id === "card1" || card.id === "card2") ? " taller-17" : ""}${overIndex === idx ? " drag-over" : ""}`}
              onDragOver={onCardDragOver(idx)}
              onDrop={onCardDrop(idx)}
            >
              <div
                className={`transport-card${draggingId === card.id ? " is-dragging" : ""}`}
                ref={(el) => {
                  if (el) cardRefs.current.set(card.id, el);
                  else cardRefs.current.delete(card.id);
                }}
              >
                <div className="card-drag-handle" draggable onDragStart={onDragStart(card.id)} onDragEnd={onDragEnd} aria-label="Перетащить карточку">
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="4" cy="3" r="1.5"/>
                    <circle cx="12" cy="3" r="1.5"/>
                    <circle cx="20" cy="3" r="1.5"/>
                    <circle cx="4" cy="9" r="1.5"/>
                    <circle cx="12" cy="9" r="1.5"/>
                    <circle cx="20" cy="9" r="1.5"/>
                  </svg>
                </div>
                {card.id !== "card5" && card.id !== "card1" && card.id !== "card2" && <div className="transport-card-title">{card.title}</div>}
                {card.id === "card2" && (
                  <div
                    className="transport-card-content card1-analytics-grid card2-analytics-grid"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onDragStart={(e) => e.stopPropagation()}
                  >
                    <div className="card1-summary-left" onClick={onKpi2Click}>
                      <div className={`kpi-inline${kpi2Filter==='etp' ? ' is-active' : ''}`} role="button" tabIndex={0} aria-pressed={kpi2Filter==='etp'}>
                        <div className="kpi-row">
                          <div className="kpi-icon-left" aria-hidden>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.9"/>
                              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="kpi-number" aria-label="��очек с опозданием ЭТП значение">{card2Sums.etp}</div>
                        </div>
                        <div className="kpi-caption">Точек с ��позданием ЭТП</div>
                      </div>
                      <div className={`kpi-inline${kpi2Filter==='ym' ? ' is-active' : ''}`} role="button" tabIndex={0} aria-pressed={kpi2Filter==='ym'}>
                        <div className="kpi-row">
                          <div className="kpi-icon-left" aria-hidden>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.9"/>
                              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="kpi-number" aria-label="Точек с опо��данием ЯМ значение">{card2Sums.ym}</div>
                        </div>
                        <div className="kpi-caption">Точек с опозданием ЯМ</div>
                      </div>
                      <div className={`kpi-inline${kpi2Filter==='order' ? ' is-active' : ''}`} role="button" tabIndex={0} aria-pressed={kpi2Filter==='order'}>
                        <div className="kpi-row">
                          <div className="kpi-icon-left" aria-hidden>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2c3.866 0 7 3.134 7 7 0 5.25-7 13-7 13S5 14.25 5 9c0-3.866 3.134-7 7-7z" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <circle cx="12" cy="9" r="2" fill="currentColor"/>
                            </svg>
                          </div>
                          <div className="kpi-number" aria-label="Точек выполнили не по порядку значение">{card2Sums.failed}</div>
                        </div>
                        <div className="kpi-caption">Точек выполнили не по порядку</div>
                      </div>
                    </div>
                    <div className="card1-summary-right">
                      <div className="chart-fill" ref={pie2ContainerRef}>
                        <PieChart hideLegend
                          width={pie2Size}
                          height={pie2Size}
                          series={[{
                            innerRadius: Math.max(32, Math.round(pie2Size * 0.30)),
                            data: [
                              { id: 0, value: card2Sums.etp, label: 'ЭТП', color: '#ff9800' },
                              { id: 1, value: card2Sums.ym, label: 'ЯМ', color: '#f44336' },
                              { id: 2, value: card2Sums.failed, label: 'Не по порядку', color: '#2196f3' },
                            ],
                            valueFormatter: (item: any) => `${item.value}`,
                          }]}
                          slotProps={{ legend: { hidden: true }, pieArc: { onClick: onCard2PieArcClick } } as any}
                        />
                        <div className="donut-legend legend-inline" aria-label="Легенда диаграммы">
                          <div className={`legend-item${kpi2Filter==='etp' ? ' is-active' : ''}`} role="button" tabIndex={0} aria-pressed={kpi2Filter==='etp'} onClick={() => setKpi2Filter(kpi2Filter==='etp' ? 'none' : 'etp')} onKeyDown={(e) => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); setKpi2Filter(kpi2Filter==='etp' ? 'none' : 'etp'); } }}><span className="legend-swatch legend-etp" aria-hidden></span><span className="legend-label">ЭТП</span></div>
                          <div className={`legend-item${kpi2Filter==='ym' ? ' is-active' : ''}`} role="button" tabIndex={0} aria-pressed={kpi2Filter==='ym'} onClick={() => setKpi2Filter(kpi2Filter==='ym' ? 'none' : 'ym')} onKeyDown={(e) => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); setKpi2Filter(kpi2Filter==='ym' ? 'none' : 'ym'); } }}><span className="legend-swatch legend-ym" aria-hidden></span><span className="legend-label">ЯМ</span></div>
                          <div className={`legend-item${kpi2Filter==='order' ? ' is-active' : ''}`} role="button" tabIndex={0} aria-pressed={kpi2Filter==='order'} onClick={() => setKpi2Filter(kpi2Filter==='order' ? 'none' : 'order')} onKeyDown={(e) => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); setKpi2Filter(kpi2Filter==='order' ? 'none' : 'order'); } }}><span className="legend-swatch legend-order" aria-hidden></span><span className="legend-label">Не по порядку</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {card.id === "card1" && (
                  <div
                    className="transport-card-content card1-analytics-grid"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onDragStart={(e) => e.stopPropagation()}
                  >
                    <div className="card1-summary-left">
                      <div className={`card1-total${kpiFilter==='all' ? ' is-active' : ''}`} role="button" tabIndex={0} aria-pressed={kpiFilter==='all'} onClick={() => setKpiFilter('all')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setKpiFilter('all'); } }}>
                        <div className="stat-summary-value" aria-label="Общ��е количество транспортировок значение">{cardTotals.total}</div>
                        <div className="stat-summary-label" aria-label="Общее количество транспортировок подпись">Общее количество транспортировок</div>
                      </div>
                      <div className={`kpi-inline${kpiFilter==='ok' ? ' is-active' : ''}`} role="button" tabIndex={0} aria-pressed={kpiFilter==='ok'} onClick={() => setKpiFilter(kpiFilter==='ok' ? 'all' : 'ok')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setKpiFilter(kpiFilter==='ok' ? 'all' : 'ok'); } }}>
                        <div className="kpi-row">
                          <div className="kpi-icon-left" aria-hidden>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.9"/>
                              <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="kpi-number" aria-label="Без нарушений значение">{cardTotals.withoutViolations}</div>
                        </div>
                        <div className="kpi-caption">Без нарушений</div>
                      </div>
                      <div className={`kpi-inline${kpiFilter==='bad' ? ' is-active' : ''}`} role="button" tabIndex={0} aria-pressed={kpiFilter==='bad'} onClick={() => setKpiFilter(kpiFilter==='bad' ? 'all' : 'bad')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setKpiFilter(kpiFilter==='bad' ? 'all' : 'bad'); } }}>
                        <div className="kpi-row">
                          <div className="kpi-icon-left" aria-hidden>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.9"/>
                              <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              <circle cx="12" cy="16" r="1.2" fill="currentColor"/>
                            </svg>
                          </div>
                          <div className="kpi-number" aria-label="С нарушениями значение">{cardTotals.withViolations}</div>
                        </div>
                        <div className="kpi-caption">С нарушениями</div>
                      </div>
                    </div>
                    <div className="card1-summary-right">
                      <div className="chart-fill" ref={pieContainerRef}>
                        <PieChart hideLegend
                          width={pieSize}
                          height={pieSize}
                          series={[{
                            innerRadius: Math.max(32, Math.round(pieSize * 0.30)),
                            data: [
                              { id: 0, value: cardTotals.withoutViolations, label: 'Без нарушений', color: '#008ffb' },
                              { id: 1, value: cardTotals.withViolations, label: 'С нарушениями', color: '#9c27b0' },
                            ],
                            valueFormatter: (item: any) => `${Math.round((item.value / Math.max(1, cardTotals.total)) * 100)}%`,
                          }]}
                          slotProps={{ legend: { hidden: true }, pieArc: { onClick: onCard1PieArcClick } } as any}
                        />
                        <div className="donut-legend" aria-label="Легенда диаг��аммы">
                          <div className={`legend-item${kpiFilter==='ok' ? ' is-active' : ''}`} role="button" tabIndex={0} aria-pressed={kpiFilter==='ok'} onClick={() => setKpiFilter(kpiFilter==='ok' ? 'all' : 'ok')} onKeyDown={(e) => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); setKpiFilter(kpiFilter==='ok' ? 'all' : 'ok'); } }}>
                            <span className="legend-swatch legend-ok" aria-hidden></span>
                            <span className="legend-label">Без нарушений</span>
                          </div>
                          <div className={`legend-item${kpiFilter==='bad' ? ' is-active' : ''}`} role="button" tabIndex={0} aria-pressed={kpiFilter==='bad'} onClick={() => setKpiFilter(kpiFilter==='bad' ? 'all' : 'bad')} onKeyDown={(e) => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); setKpiFilter(kpiFilter==='bad' ? 'all' : 'bad'); } }}>
                            <span className="legend-swatch legend-bad" aria-hidden></span>
                            <span className="legend-label">С нарушениями</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {card.id === "card4" && (
                  <div className="transport-card-content no-scroll" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onDragStart={(e) => e.stopPropagation()}>
                    <ApexChart
                      type="bar"
                      height={450}
                      options={apexOptions as any}
                      series={apexSeries as any}
                    />
                  </div>
                )}
                {card.id === "card5" && (
                  <div
                    className="transport-card-content"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onDragStart={(e) => e.stopPropagation()}
                  >
                    <div className="table-toolbar-row">
                      <div className="toolbar-search-grow">
                        <TextField
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          placeholder="Поиск"
                          size="small"
                          fullWidth
                          variant="outlined"
                          InputProps={{ startAdornment: (
                            <InputAdornment position="start">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                                <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </InputAdornment>
                          ) }}
                          inputProps={{ 'aria-label': 'Поиск' }}
                        />
                      </div>
                      <Button className="columns-menu-button" aria-label="Настройка колонок" size="small" variant="text" onClick={(e) => setColumnsMenuEl(e.currentTarget)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <rect x="3" y="6" width="18" height="2" fill="currentColor" />
                          <rect x="3" y="11" width="18" height="2" fill="currentColor" />
                          <rect x="3" y="16" width="18" height="2" fill="currentColor" />
                        </svg>
                      </Button>
                      <Menu anchorEl={columnsMenuEl} open={Boolean(columnsMenuEl)} onClose={() => setColumnsMenuEl(null)}>
                        {columns.map((col) => {
                          const key = String(col.key);
                          const label = typeof col.title === 'string' ? col.title : key;
                          const checked = visibleCols[key] !== false;
                          return (
                            <MenuItem key={key} dense onClick={() => setVisibleCols((prev) => ({ ...prev, [key]: !checked }))}>
                              <FormControlLabel
                                control={<Checkbox size="small" checked={checked} onChange={() => setVisibleCols((prev) => ({ ...prev, [key]: !checked }))} />}
                                label={label}
                              />
                            </MenuItem>
                          );
                        })}
                      </Menu>
                    </div>
                    <Table
                      dataSource={filteredData}
                      columns={displayedColumns}
                      size="middle"
                      pagination={{ current: tablePagination.current, pageSize: tablePagination.pageSize, showSizeChanger: true, pageSizeOptions: ["10", "20", "50", "100"] }}
                      rowKey="key"
                      sticky
                      scroll={{ y: 420 }}
                      onChange={(pag) => setTablePagination({ current: pag.current || 1, pageSize: pag.pageSize || 10 })}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Dialog
          open={routeDialogOpen}
          onClose={() => setRouteDialogOpen(false)}
          aria-labelledby="routes-dialog-title"
        >
          <DialogTitle id="routes-dialog-title">Полный маршрут</DialogTitle>
          <DialogContent>
            <ul className="routes-listbox" role="listbox" aria-labelledby="routes-dialog-title">
              {routeDialogItems.map((r, i) => (
                <li role="option" key={`${r}-${i}`}>{r}</li>
              ))}
            </ul>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRouteDialogOpen(false)} variant="contained">Закрыть</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={dialogOpen}
          onClose={handleClose}
          aria-labelledby="transport-report-dialog-title"
          PaperProps={{ sx: { width: "auto", maxWidth: "none" } }}
        >
          <DialogTitle id="transport-report-dialog-title">Выберите параметры</DialogTitle>
          <DialogContent>
            <CustomProvider locale={ruRU}>
              <div className="report-params-group">
                <div className="report-date-range-row">
                  <span className="report-date-range-label">Период</span>
                  <DateRangePicker
                    value={dateRange}
                    onChange={(value) => { setDateRange((value || [null, null]) as [Date | null, Date | null]); setTouchedDate(true); }}
                    locale={ruRU}
                    format="dd.MM.yyyy"
                    character=" - "
                    placeholder="Дата начала - Дата окончания"
                    className={`report-date-range-input${!isDateValid && touchedDate ? " is-invalid" : ""}`}
                    container={getDialogContainer}
                    preventOverflow
                    placement="bottomStart"
                  />
                </div>
                {!isDateValid && touchedDate && (
                  <div className="field-error-text">Укажите период</div>
                )}
                <div className="planning-picker-row">
                  <Select
                      aria-label="Место планирования транспортировки"
                      className={`planning-picker-input planning-select-container${!isPlanningValid && touchedPlanning ? " is-invalid" : ""}`}
                      classNamePrefix="planning"
                      isMulti
                      placeholder="Место планирования транспо��тировки"
                      noOptionsMessage={() => "Нет вариантов"}
                      loadingMessage={() => "Загрузка..."}
                      options={planningOptions}
                      value={planningOptions.filter((o) => selectedPlanning.includes(o.value))}
                      onChange={(vals) => { setSelectedPlanning(((vals as MultiValue<any>) || []).map((v) => (v as any).value)); setTouchedPlanning(true); }}
                      getOptionValue={(o) => (o as any).value}
                    getOptionLabel={(o) => `${(o as any).mpt} — ${(o as any).name}`}
                    formatOptionLabel={(option: any) => (
                      <div className="planning-option">
                        <span className="option-checkbox" aria-hidden>
                          <input type="checkbox" checked={selectedPlanning.includes(option.value)} readOnly />
                        </span>
                        <span className="option-code">{option.mpt}</span>
                        <span className="option-name">{option.name}</span>
                      </div>
                    )}
                    components={{
                      MenuList: (props: MenuListProps) => {
                        const allValues = planningOptions.map((p) => p.value);
                        const allSelected = selectedPlanning.length === allValues.length && allValues.every((v) => selectedPlanning.includes(v));
                        const someSelected = selectedPlanning.length > 0 && !allSelected;
                        return (
                          <components.MenuList {...props}>
                            <label className="planning-select-all-row">
                              <input
                                type="checkbox"
                                checked={allSelected}
                                ref={(el) => el && (el.indeterminate = someSelected)}
                                onChange={(e) => setSelectedPlanning(e.target.checked ? allValues : [])}
                              />
                              <span>Выбрать все</span>
                            </label>
                            {props.children}
                          </components.MenuList>
                        );
                      },
                      Option: (optionProps: OptionProps<any>) => (
                        <components.Option {...optionProps}>
                          <div className="planning-option">
                            <span className="option-checkbox" aria-hidden>
                              <input type="checkbox" checked={optionProps.isSelected} readOnly />
                            </span>
                            <span className="option-code">{optionProps.data.mpt}</span>
                            <span className="option-name">{optionProps.data.name}</span>
                          </div>
                        </components.Option>
                      ),
                    }}
                    menuPortalTarget={getDialogContainer()}
                    menuPosition="fixed"
                    onBlur={() => setTouchedPlanning(true)}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 1500 }) }}
                  />
                </div>
              </div>
              {!isPlanningValid && touchedPlanning && (
                <div className="field-error-text">Выберите место планирования транспортировки</div>
              )}
            </CustomProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleExit} color="inherit">Выйти</Button>
            <Button onClick={handleApply} variant="contained" disabled={!isFormValid}>Применить</Button>
          </DialogActions>
        </Dialog>
      </div>
    </ConfigProvider>
  );
}
