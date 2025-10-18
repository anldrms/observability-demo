# Observability Demo

This project starts a demo stack with:
- Demo Node.js web app (Express) emitting Prometheus metrics and GELF logs
- Prometheus for scraping metrics
- Grafana for dashboards (pre-provisioned Prometheus datasource and example dashboard)
- Graylog for centralized logs (auto-creates a GELF UDP input)
- MongoDB + OpenSearch for Graylog storage

Quick start
1. Install Docker and Docker Compose
2. In this folder, run: docker compose up -d --build
3. Open:
   - App: http://localhost:3000
   - Grafana: http://localhost:3001 (admin/admin)
   - Prometheus: http://localhost:9090
   - Graylog: http://localhost:9000 (admin/admin)

Notes
- From the app homepage, click Start Simulation to generate traffic. Metrics appear in Prometheus/Grafana, logs in Graylog.
- Grafana dashboard: Dashboards > Browse > Demo App Overview
- Graylog input is created by graylog-setup container. If it fails initially, it will be retried on next up.
