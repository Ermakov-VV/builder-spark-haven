import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { DateRangePicker, CustomProvider } from "rsuite";
import Select, { components, MenuListProps, OptionProps, MultiValue } from "react-select";
import ruRU from "rsuite/esm/locales/ru_RU";
import "rsuite/dist/rsuite-no-reset.min.css";
import PageBreadcrumbs from "../components/PageBreadcrumbs";

export default function ReportsTransport() {
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
      { mpt: "RD01", name: "РОМ Ростов-на-Дону", value: "RD01", label: "RD01 — РОМ Ростов-на-Дону" },
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
    { id: "card3", title: "Карточка 3" },
  ]);
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
            className={`transport-card-wrapper${overIndex === idx ? " drag-over" : ""}`}
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
              <div className="transport-card-title">{card.title}</div>
            </div>
          </div>
        ))}
      </div>

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
