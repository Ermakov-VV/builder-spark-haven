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
import { DateRangePicker, CustomProvider, CheckPicker } from "rsuite";
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
    ],
    [],
  );
  const [selectedPlanning, setSelectedPlanning] = React.useState<string[]>([]);
  const getDialogContainer = React.useCallback(() => (document.querySelector('.MuiDialog-root') as HTMLElement) || document.body, []);

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
      <h1>Отчет по транспортировкам</h1>

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        aria-labelledby="transport-report-dialog-title"
        PaperProps={{ sx: { width: "auto", maxWidth: "none" } }}
      >
        <DialogTitle id="transport-report-dialog-title">Выберите параметры</DialogTitle>
        <DialogContent>
          <CustomProvider locale={ruRU}>
            <div className="report-date-range-row">
              <span className="report-date-range-label">Период</span>
              <DateRangePicker
                value={dateRange}
                onChange={(value) => setDateRange((value || [null, null]) as [Date | null, Date | null])}
                locale={ruRU}
                format="dd.MM.yyyy"
                character=" - "
                placeholder="Дата начала - Дата окончания"
                className="report-date-range-input"
                container={getDialogContainer}
                preventOverflow
                placement="bottomStart"
              />
            </div>
            <div className="planning-picker-row">
              <CheckPicker
                data={planningPlaces}
                value={selectedPlanning}
                onChange={(next) => setSelectedPlanning((next as string[]) || [])}
                placeholder="Место планирования транспортировки"
                className="planning-picker-input"
                container={getDialogContainer}
                placement="bottomStart"
                searchable={false}
                renderMenuItem={(label, item) => (
                  <div className="planning-item">
                    <span className="col-mpt">{item.mpt}</span>
                    <span className="col-name">{item.name}</span>
                  </div>
                )}
                renderValue={(value, items) => {
                  if (!items || items.length === 0) return null;
                  return (
                    <span>
                      {items.map((it) => `${(it as any).mpt} — ${(it as any).name}`).join(", ")}
                    </span>
                  );
                }}
                renderExtraFooter={() => (
                  <div className="planning-picker-footer">
                    <button
                      type="button"
                      className="planning-footer-action"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedPlanning(planningPlaces.map((p) => p.value));
                      }}
                    >
                      Выбрать все
                    </button>
                  </div>
                )}
              />
            </div>
          </CustomProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExit} color="inherit">Выйти</Button>
          <Button onClick={handleApply} variant="contained">Применить</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
