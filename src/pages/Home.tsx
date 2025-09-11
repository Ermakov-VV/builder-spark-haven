import * as React from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import PlaceIcon from "@mui/icons-material/Place";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-section">
        <h2 className="section-title">Инструменты</h2>
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

      <section className="home-section">
        <h2 className="section-title">Отчеты</h2>
        <div className="cards-grid">
          <Card className="feature-card feature-card--report" elevation={3}>
            <CardActionArea component={Link} to="/reports/transport">
              <CardHeader avatar={<LocalShippingIcon />} title={<span className="feature-card-title">Отчет по транспортировкам</span>} />
              <CardContent className="feature-card-content">
                <Typography variant="body2" component="p">
                  Сводная аналитика по транспортировк��м за выбранный период.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </div>
      </section>
    </div>
  );
}
