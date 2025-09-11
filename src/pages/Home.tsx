import * as React from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-section">
        <h2 className="section-title">Инструменты</h2>
        <div className="cards-grid">
          <Card className="feature-card" variant="outlined">
            <CardHeader title={<span className="feature-card-title">Маршрутизация SRVP</span>} />
            <CardContent className="feature-card-content">
              <Typography variant="body2" component="p">
                Настроить маршрутизацию SRVP и параметры оптимизации.
              </Typography>
            </CardContent>
          </Card>
          <Card className="feature-card" variant="outlined">
            <CardHeader title={<span className="feature-card-title">Геокодирование</span>} />
            <CardContent className="feature-card-content">
              <Typography variant="body2" component="p">
                Преобразование адресов в координаты и обратно для карт и сервисов.
              </Typography>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="home-section">
        <h2 className="section-title">Отчеты</h2>
        <div className="cards-grid">
          <Card className="feature-card" variant="outlined">
            <CardHeader title={<span className="feature-card-title">Отчет по транспортировкам</span>} />
            <CardContent className="feature-card-content">
              <Typography variant="body2" component="p">
                Сводная аналитика по транспортировкам за выбранный период.
              </Typography>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
