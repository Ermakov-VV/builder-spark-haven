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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import PageBreadcrumbs from "../components/PageBreadcrumbs";

export default function ReportsTransport() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = React.useState(true);
  const [dateFrom, setDateFrom] = React.useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = React.useState<Dayjs | null>(null);

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
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="transport-report-dialog-title">Выберите параметры</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Укажите интервал дат для формирования отчета.
          </DialogContentText>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="report-date-range">
              <DatePicker
                label="Дата начала"
                value={dateFrom}
                onChange={(newValue) => setDateFrom(newValue)}
                slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
              />
              <DatePicker
                label="Дата окончания"
                value={dateTo}
                onChange={(newValue) => setDateTo(newValue)}
                slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
              />
            </div>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExit} color="inherit">Выйти</Button>
          <Button onClick={handleApply} variant="contained">Применить</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
