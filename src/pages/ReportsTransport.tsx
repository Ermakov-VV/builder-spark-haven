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
      { mpt: "RD01", name: "РОМ Росто��-на-Дону", value: "RD01", label: "RD01 — РОМ Ростов-на-Дону" },
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
    { id: "card4", title: "Карточка 4" },
    { id: "card5", title: "Карточка 5" },
  ]);

  const tableData: TransportRow[] = React.useMemo(() => {
    const mpts = ["VE86", "RD01", "NN01", "MSK1", "SPB1"];
    const drivers = [
      "Иванов И.И.",
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
      "Ростов-на-Дону — Азов",
      "Москва — Химки",
      "Санкт-Петербург — Пушкин",
      "Казань — Зеленодольск",
      "Екатеринбург — Березовский",
    ];
    const base = dayjs("2025-09-17T08:00:00Z");
    return Array.from({ length: 30 }, (_, idx) => {
      const i = idx + 1;
      const dep = base.add(i % 6, "hour").add(Math.floor(i / 6), "day");
      const durationHours = 4 + (i % 7);
      const finish = dep.add(durationHours, "hour").add((i % 3) * 10, "minute");
      const multCount = (i % 3) === 0 ? 3 : (i % 3) === 1 ? 1 : 2;
      const routeList = Array.from({ length: multCount }, (_, k) => routesPool[(i + k) % routesPool.length]);
      return {
        key: String(i),
        mpt: mpts[i % mpts.length],
        transportNo: `TR-2025-${String(i).padStart(4, "0")}`,
        driver: drivers[i % drivers.length],
        carBrand: brands[i % brands.length],
        carPlate: plates[i % plates.length],
        route: multCount === 1 ? routeList[0] : routeList,
        addressCount: 8 + (i % 12),
        outOfOrderCount: i % 4,
        violationsPct: (i * 3) % 21,
        planDeparture: dep.toISOString(),
        planFinish: finish.toISOString(),
      } as TransportRow;
    });
  }, []);

  const unique = <T extends keyof TransportRow>(key: T) =>
    Array.from(new Set(tableData.map((r) => String(r[key])))).map((v) => ({ text: v, value: v }));

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

  const routeFilters = React.useMemo(() => {
    const s = new Set<string>();
    tableData.forEach((r) => {
      const list = Array.isArray(r.route) ? r.route : [r.route];
      list.forEach((v) => s.add(v));
    });
    return Array.from(s).map((v) => ({ text: v, value: v }));
  }, [tableData]);

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
        filters: unique("mpt"),
        onFilter: (val: any, record: TransportRow) => record.mpt === val,
        sorter: (a: TransportRow, b: TransportRow) => a.mpt.localeCompare(b.mpt),
      },
      {
        title: "№ Транспортировки",
        dataIndex: "transportNo",
        key: "transportNo",
        filters: unique("transportNo"),
        onFilter: (val: any, record: TransportRow) => record.transportNo === val,
        sorter: (a: TransportRow, b: TransportRow) => a.transportNo.localeCompare(b.transportNo),
      },
      {
        title: "Водитель",
        dataIndex: "driver",
        key: "driver",
        filters: unique("driver"),
        onFilter: (val: any, record: TransportRow) => record.driver === val,
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
        filters: routeFilters,
        onFilter: (val: any, record: TransportRow) => {
          const list = Array.isArray(record.route) ? record.route : [record.route];
          return list.includes(String(val));
        },
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
        filters: unique("addressCount"),
        onFilter: (val: any, record: TransportRow) => String(record.addressCount) === String(val),
        sorter: (a: TransportRow, b: TransportRow) => a.addressCount - b.addressCount,
      },
      {
        title: "Кол-во точек не по-порядку",
        dataIndex: "outOfOrderCount",
        key: "outOfOrderCount",
        filters: unique("outOfOrderCount"),
        onFilter: (val: any, record: TransportRow) => String(record.outOfOrderCount) === String(val),
        sorter: (a: TransportRow, b: TransportRow) => a.outOfOrderCount - b.outOfOrderCount,
      },
      {
        title: "% Нарушений",
        dataIndex: "violationsPct",
        key: "violationsPct",
        filters: unique("violationsPct"),
        onFilter: (val: any, record: TransportRow) => String(record.violationsPct) === String(val),
        sorter: (a: TransportRow, b: TransportRow) => a.violationsPct - b.violationsPct,
        render: (v: number) => `${v}%`,
      },
      {
        title: "План. время выезда",
        dataIndex: "planDeparture",
        key: "planDeparture",
        filters: unique("planDeparture"),
        onFilter: (val: any, record: TransportRow) => record.planDeparture === val,
        sorter: (a: TransportRow, b: TransportRow) => dayjs(a.planDeparture).valueOf() - dayjs(b.planDeparture).valueOf(),
        render: (v: string) => dayjs(v).format("DD.MM.YYYY HH:mm"),
      },
      {
        title: "План. оконч. транс-ки",
        dataIndex: "planFinish",
        key: "planFinish",
        filters: unique("planFinish"),
        onFilter: (val: any, record: TransportRow) => record.planFinish === val,
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
            className={`transport-card-wrapper${card.id === "card4" ? " full-width" : ""}${card.id === "card5" ? " full-width full-rest" : ""}${overIndex === idx ? " drag-over" : ""}`}
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
              {card.id !== "card5" && <div className="transport-card-title">{card.title}</div>}
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
                    <Button aria-label="Настройка колонок" size="small" variant="outlined" onClick={(e) => setColumnsMenuEl(e.currentTarget)}>
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
                      pagination={{ pageSize: 10, showSizeChanger: true }}
                      rowKey="key"
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
  );
}
