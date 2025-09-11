import * as React from "react";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import PlaceIcon from "@mui/icons-material/Place";
import { Link } from "react-router-dom";

export default function ToolsIndex() {
  return (
    <div>
      <PageBreadcrumbs />
      <h1>Инструменты</h1>
      <section className="home-section">
        <div className="cards-grid">
          <Card className="feature-card feature-card--srvp" elevation={3}>
            <CardActionArea component={Link} to="/tools/srvp">
              <CardHeader avatar={<AltRouteIcon />} title={<span className="feature-card-title">Маршрутизация SRVP</span>} />
              <CardContent className="feature-card-content">
                <Typography variant="body2" component="p">
                  Настроить маршрутизацию SRVP и параметры оптимизации.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card className="feature-card feature-card--geocode" elevation={3}>
            <CardActionArea component={Link} to="/tools/geocode">
              <CardHeader avatar={<PlaceIcon />} title={<span className="feature-card-title">Геокодирование</span>} />
              <CardContent className="feature-card-content">
                <Typography variant="body2" component="p">
                  Преобразование адресов в координаты и обратно для карт и сервисов.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </div>
      </section>
    </div>
  );
}
