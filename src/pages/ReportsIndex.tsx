import * as React from "react";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { Link } from "react-router-dom";

export default function ReportsIndex() {
  return (
    <div>
      <PageBreadcrumbs />
      <h1>Отчеты</h1>
      <section className="home-section">
        <div className="cards-grid">
          <Card className="feature-card feature-card--report" elevation={3}>
            <CardActionArea component={Link} to="/reports/transport">
              <CardHeader
                avatar={<LocalShippingIcon />}
                title={<span className="feature-card-title">Отчет по транспортировкам</span>}
              />
              <CardContent className="feature-card-content">
                <Typography variant="body2" component="p">
                  Сводная аналитика по транспортировкам за выбранный период.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </div>
      </section>
    </div>
  );
}
