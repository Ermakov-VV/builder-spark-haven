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
            <div className="report-params-group">
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
                <Select
                  className="planning-picker-input planning-select-container"
                  classNamePrefix="planning"
                  isMulti
                  placeholder="Место планирования транспортировки"
                  options={planningPlaces}
                  value={planningPlaces.filter((o) => selectedPlanning.includes(o.value))}
                  onChange={(vals) => setSelectedPlanning(((vals as MultiValue<any>) || []).map((v) => v.value))}
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
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 1500 }) }}
                />
              </div>
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
