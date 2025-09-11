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
