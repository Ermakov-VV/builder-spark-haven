import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  LinearProgress,
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

type TransportRow = {
  key: string;
  mpt: string;
  transportNo: string;
  driver: string;
  carBrand: string;
  carPlate: string;
  route: string | string[];
  addressCount: number;
  outOfOrderCount: number;
  violationsPct: number;
  planDeparture: string; // ISO
  planFinish: string; // ISO
};

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
  const planningPlaces = React.useMemo(
    () => [
      { mpt: "VE86", name: "СК86 EWM", value: "VE86", label: "VE86 — СК86 EWM" },
      { mpt: "RD01", name: "РОМ Росто��-на-Дону", value: "RD01", label: "RD01 — РО�� Ростов-на-Дону" },
      { mpt: "NN01", name: "РОМ Н.Новгород", value: "NN01", label: "NN01 — РОМ Н.Новгород" },
    ],
    [],
  );
  const [selectedPlanning, setSelectedPlanning] = React.useState<string[]>([]);
  const [touchedDate, setTouchedDate] = React.useState(false);
  const [touchedPlanning, setTouchedPlanning] = React.useState(false);
  const isDateValid = Boolean(dateRange[0]) && Boolean(dateRange[1]);
  const isPlanningValid = selectedPlanning.length > 0;
  const isFormValid = isDateValid && isPlanningValid;
  const getDialogContainer = React.useCallback(() => (document.querySelector('.MuiDialog-root') as HTMLElement) || document.body, []);

  const [cards, setCards] = React.useState([
    { id: "card1", title: "Карточка 1" },
    { id: "card2", title: "Карточка 2" },
    { id: "card3", title: "Карточк�� 3" },
    { id: "card4", title: "Количество транспортировок по дням" },
    { id: "card5", title: "Карточка 5" },
  ]);

  const tableData: TransportRow[] = React.useMemo(() => {
    const mpts = ["VE86", "RD01", "NN01", "MSK1", "SPB1"];
    const drivers = [
      "Иван��в И.И.",
      "Петров П.П.",
      "Сидоров С.С.",
      "Кузнецов К.К.",
      "Смирнов С.С.",
      "Попов П.П.",
      "Васильев В.В.",
    ];
    const brands = ["ГАЗель", "КАМАЗ", "MAN", "Scania", "Volvo", "Hyundai", "Isuzu"];
    const plates = [
      "А123ВС 161",
      "В456ЕЕ 52",
      "К789МН 34",
      "О321ОР 77",
      "Р654АК 78",
      "Н987ТТ 16",
      "Т246ХХ 66",
    ];
    const routesPool = [
      "Ростов-на-Дону — Батайск",
      "Н.Новгород — Дзержинск",
      "Ростов-на-Дону ��� Азов",
      "Москва — Химки",
      "Санкт-Петербург — Пушкин",
      "Казань — Зеленодольск",
      "Екатеринбург — Березовский",
    ];

    const monthRef = dateRange?.[0] ? dayjs(dateRange[0]) : dayjs();
    const mStart = monthRef.startOf("month");
    const mEnd = monthRef.endOf("month");

    const rows: TransportRow[] = [];
    let keySeq = 1;
    let cur = mStart.startOf("day");
    while (cur.isBefore(mEnd) || cur.isSame(mEnd)) {
      const dayIdx = cur.date();
      const count = (dayIdx % 3) + 1; // 1..4 пе��евозок в день, детерминированно
      for (let c = 0; c < count; c++) {
        const dep = cur.hour(8 + (c * 3) % 10).minute((c * 17) % 60).second(0).millisecond(0);
        const durationHours = 4 + ((dayIdx + c) % 7);
        const finish = dep.add(durationHours, "hour").add(((dayIdx + c) % 3) * 10, "minute");
        const multCount = (dayIdx + c) % 3 === 0 ? 3 : (dayIdx + c) % 3 === 1 ? 1 : 2;
        const routeList = Array.from({ length: multCount }, (_, k) => routesPool[(dayIdx + c + k) % routesPool.length]);
        rows.push({
          key: String(keySeq++),
          mpt: mpts[(dayIdx + c) % mpts.length],
          transportNo: `TR-${monthRef.format("YYYYMM")}-${String(keySeq).padStart(4, "0")}`,
          driver: drivers[(dayIdx + c) % drivers.length],
          carBrand: brands[(dayIdx + c) % brands.length],
          carPlate: plates[(dayIdx + c) % plates.length],
          route: multCount === 1 ? routeList[0] : routeList,
          addressCount: 8 + ((dayIdx + c) % 12),
          outOfOrderCount: (dayIdx + c) % 4,
          violationsPct: ((dayIdx + c) * 3) % 21,
          planDeparture: dep.toISOString(),
          planFinish: finish.toISOString(),
        } as TransportRow);
      }
      cur = cur.add(1, "day");
    }
    return rows;
  }, [dateRange]);


  const [searchText, setSearchText] = React.useState("");

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
      `${r.violationsPct}%`,
      dayjs(r.planDeparture).format("DD.MM.YYYY HH:mm"),
      dayjs(r.planDeparture).toISOString(),
      dayjs(r.planFinish).format("DD.MM.YYYY HH:mm"),
      dayjs(r.planFinish).toISOString(),
    ]
      .map(normalized)
      .join(" ");
    return hay.includes(needle) || hay.indexOf(needle) !== -1;
  };

  const filteredData = React.useMemo(() => tableData.filter((r) => recordMatchesSearch(r, searchText)), [tableData, searchText]);

  const dateChart = React.useMemo(() => {
    // One month window; prefer month of selected start date, else month of earliest data, else current month
    const startSel = dateRange?.[0] ? dayjs(dateRange[0]) : null;
    let monthRef: dayjs.Dayjs | null = startSel;
    if (!monthRef) {
      let minD: dayjs.Dayjs | null = null;
      tableData.forEach((r) => {
        const d = dayjs(r.planDeparture);
        if (!minD || d.isBefore(minD)) minD = d;
      });
      monthRef = minD || dayjs();
    }
    const mStart = monthRef.startOf('month');
    const mEnd = monthRef.endOf('month');

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
    tableData.forEach((r) => {
      const k = dayjs(r.planDeparture).format('YYYY-MM-DD');
      if (!totalsMap.has(k)) return;
      totalsMap.set(k, (totalsMap.get(k) || 0) + 1);
      if ((r.violationsPct ?? 0) > 0) violMap.set(k, (violMap.get(k) || 0) + 1);
    });

    // Drop days without transports (no empty values)
    const rows = keysAll.map((k, i) => ({ label: labelsAll[i], t: totalsMap.get(k) || 0, v: violMap.get(k) || 0 }))
      .filter((r) => r.t > 0);

    return {
      labels: rows.map((r) => r.label),
      totals: rows.map((r) => r.t),
      violations: rows.map((r) => r.v),
    };
  }, [tableData, dateRange]);

  const yMax = React.useMemo(() => {
    const t = dateChart.totals || [];
    const v = dateChart.violations || [];
    const maxVal = Math.max(0, ...(t.length ? t : [0]), ...(v.length ? v : [0]));
    return Math.max(1, maxVal);
  }, [dateChart]);

  const totals = React.useMemo(() => {
    const total = tableData.length;
    let withViol = 0;
    tableData.forEach((r) => { if ((r.violationsPct || 0) > 0) withViol++; });
    const withoutViol = Math.max(0, total - withViol);
    const pctWith = total > 0 ? (withViol / total) * 100 : 0;
    const pctWithout = total > 0 ? (withoutViol / total) * 100 : 0;
    return { total, withViolations: withViol, withoutViolations: withoutViol, pctWith, pctWithout };
  }, [tableData]);

  const apexSeries = React.useMemo(() => (
    [
      { name: "Всего", data: dateChart.totals || [] },
      { name: "С нарушениями", data: dateChart.violations || [] },
    ]
  ), [dateChart]);

  const apexOptions = React.useMemo(() => ({
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '60%', borderRadius: 4 } },
    colors: ['#008ffb', '#feb019'],
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
  React.useEffect(() => {
    setTablePagination((p) => ({ ...p, current: 1 }));
  }, [searchText]);


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
          return a1.localeCompare(b1);
        },
        render: (val: string | string[]) => {
          const list = Array.isArray(val) ? val : [val];
          if (list.length <= 1) return list[0];
          const first = list[0];
          const rest = list.length - 1;
          return (
            <span>
              {first} {" "}
              <Button
                size="small"
                variant="text"
                onClick={(e) => { e.stopPropagation(); openRoutesDialog(list); }}
              >
                и ещё{rest > 1 ? ` ${rest}` : ""}
              </Button>
            </span>
          );
        },
      },
      {
        title: "Кол-во адресов",
        dataIndex: "addressCount",
        key: "addressCount",
        sorter: (a: TransportRow, b: TransportRow) => a.addressCount - b.addressCount,
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
      {
        title: "П��ан. время выезда",
        dataIndex: "planDeparture",
        key: "planDeparture",
        sorter: (a: TransportRow, b: TransportRow) => dayjs(a.planDeparture).valueOf() - dayjs(b.planDeparture).valueOf(),
        render: (v: string) => dayjs(v).format("DD.MM.YYYY HH:mm"),
      },
      {
        title: "План. оконч. транс-ки",
        dataIndex: "planFinish",
        key: "planFinish",
        sorter: (a: TransportRow, b: TransportRow) => dayjs(a.planFinish).valueOf() - dayjs(b.planFinish).valueOf(),
        render: (v: string) => dayjs(v).format("DD.MM.YYYY HH:mm"),
      },
    ],
    [tableData],
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



  const handleApply = () => {
    setDialogOpen(false);
  };

  const handleExit = () => {
    navigate("/reports");
  };

  const handleClose = (_event: object, reason?: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    setDialogOpen(false);
  };

  return (
    <div className="reports-transport-page">
      <PageBreadcrumbs onCurrentClick={() => setDialogOpen(true)} />

      <div className="transport-grid" onDragOver={onGridDragOver} onDrop={onGridDrop}>
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className={`transport-card-wrapper${card.id === "card4" ? " full-width full-rest" : ""}${card.id === "card5" ? " full-width full-rest" : ""}${overIndex === idx ? " drag-over" : ""}`}
            onDragOver={onCardDragOver(idx)}
            onDrop={onCardDrop(idx)}
          >
            <div
              className={`transport-card${draggingId === card.id ? " is-dragging" : ""}`}
              draggable
              onDragStart={onDragStart(card.id)}
              onDragEnd={onDragEnd}
              ref={(el) => {
                if (el) cardRefs.current.set(card.id, el);
                else cardRefs.current.delete(card.id);
              }}
            >
              {card.id !== "card5" && card.id !== "card1" && <div className="transport-card-title">{card.title}</div>}
              {card.id === "card1" && (
                <div
                  className="transport-card-content stat-summary-block"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onDragStart={(e) => e.stopPropagation()}
                >
                  <div className="stat-summary-value" aria-label="Общее количество транспортировок значение">1300</div>
                  <div className="stat-summary-label" aria-label="Общее количество ��ранспортировок подпись">Общее количество транспортировок</div>
                  <div className="progress-summary">
                    <div className="progress-row">
                      <div className="progress-meta">
                        <span className="progress-label">Без нарушений</span>
                        <span className="progress-count" aria-label="Количество без нарушений">{totals.withoutViolations}</span>
                      </div>
                      <LinearProgress variant="determinate" value={totals.pctWithout} color="primary" className="progress-bar ok" />
                    </div>
                    <div className="progress-row">
                      <div className="progress-meta">
                        <span className="progress-label">С нарушениями</span>
                        <span className="progress-count" aria-label="Количество с нарушениями">{totals.withViolations}</span>
                      </div>
                      <LinearProgress variant="determinate" value={totals.pctWith} color="secondary" className="progress-bar warn" />
                    </div>
                  </div>
                </div>
              )}
              {card.id === "card4" && (
                <div className="transport-card-content" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onDragStart={(e) => e.stopPropagation()}>
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
                        placeholder="Поиск по всей таблице"
                        size="small"
                        fullWidth
                        variant="outlined"
                        inputProps={{ 'aria-label': 'Поиск по всей таблице' }}
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
                  <ConfigProvider locale={ruLocale}>
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
                  </ConfigProvider>
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
          <ul className="routes-listbox" role="listbox" aria-label="Список маршрут��в">
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
                <span className="report-date-range-label">Перио��</span>
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
                  className={`planning-picker-input planning-select-container${!isPlanningValid && touchedPlanning ? " is-invalid" : ""}`}
                  classNamePrefix="planning"
                  isMulti
                  placeholder="Место планирования транспортировки"
                  options={planningPlaces}
                  value={planningPlaces.filter((o) => selectedPlanning.includes(o.value))}
                  onChange={(vals) => { setSelectedPlanning(((vals as MultiValue<any>) || []).map((v) => v.value)); setTouchedPlanning(true); }}
                  getOptionValue={(o) => o.value}
                  getOptionLabel={(o) => `${o.mpt} — ${o.name}`}
                  formatOptionLabel={(option) => (
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
                      const allValues = planningPlaces.map((p) => p.value);
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
                            <span>��ыбрать все</span>
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
              <div className="field-error-text">Выберите мес��о планирования транспортировки</div>
            )}
          </CustomProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExit} color="inherit">Выйти</Button>
          <Button onClick={handleApply} variant="contained" disabled={!isFormValid}>Применить</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
