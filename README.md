# Observability Demo Platform 🔍

A production-ready observability stack with Prometheus, Grafana, and Graylog integrated with a demo application.

## 🌟 Features

- **Demo Web App**: Express.js app with simulated traffic generation
- **Prometheus**: Metrics collection and time-series storage
- **Grafana**: Pre-configured dashboards for visualization
- **Graylog**: Centralized log aggregation with OpenSearch backend
- **MongoDB**: Graylog metadata storage
- **Cloud-Ready**: Environment-based configuration for easy deployment

## 🚀 Quick Start (Local)

### Prerequisites
- Docker & Docker Compose
- 8GB+ RAM recommended

### Run Locally

```bash
git clone git@github.com:anldrms/observability-demo.git
cd observability-demo
cp .env.example .env
# Edit .env if needed (defaults work for local development)
docker compose up -d --build
```

### Access Services

- **App**: http://localhost:3000
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Graylog**: http://localhost:9000 (admin/admin)

## 📊 Using the Platform

1. Open http://localhost:3000
2. Click "Start Simulation" to generate traffic
3. View metrics in:
   - Prometheus: http://localhost:9090/graph
   - Grafana: http://localhost:3001 → Dashboards → Demo App Overview
   - Graylog: http://localhost:9000 → Search (wait ~1 minute for logs)

## ☁️ Cloud Deployment

### Deploy to Fly.io (Recommended)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy the demo app
fly launch --config fly.toml

# Set environment variables
fly secrets set \
  GELF_HOST=your-graylog-host \
  GELF_PORT=12201 \
  PUBLIC_GRAFANA_URL=https://your-grafana.fly.dev \
  PUBLIC_PROMETHEUS_URL=https://your-prometheus.fly.dev \
  PUBLIC_GRAYLOG_URL=https://your-graylog.fly.dev

# Deploy
fly deploy
```

### Deploy Full Stack to Cloud

For production deployment with all services, consider:

1. **Kubernetes (Recommended for full stack)**
   - Use Helm charts for Prometheus, Grafana, Graylog
   - Deploy to GKE, EKS, or AKS
   - See `k8s/` directory for manifests

2. **Docker Swarm / Cloud Services**
   - Deploy individual services to managed platforms
   - Grafana Cloud for dashboards
   - CloudWatch/Datadog for logs
   - Update `.env` with public URLs

3. **Railway / Render**
   - Deploy app as web service
   - Use environment variables for external monitoring services

### Environment Variables for Cloud

Update `.env` with your cloud URLs:

```bash
PUBLIC_GRAFANA_URL=https://grafana.yourapp.com
PUBLIC_PROMETHEUS_URL=https://prometheus.yourapp.com
PUBLIC_GRAYLOG_URL=https://graylog.yourapp.com
GRAYLOG_EXTERNAL_URI=https://graylog.yourapp.com/
```

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Demo App   │─────▶│  Prometheus  │─────▶│   Grafana   │
│  (Express)  │      │  (Metrics)   │      │ (Dashboard) │
└─────────────┘      └──────────────┘      └─────────────┘
      │
      │ GELF/UDP
      ▼
┌─────────────┐      ┌──────────────┐
│  Graylog    │◀────▶│ OpenSearch   │
│   (Logs)    │      │  (Storage)   │
└─────────────┘      └──────────────┘
      │
      ▼
┌─────────────┐
│  MongoDB    │
│ (Metadata)  │
└─────────────┘
```

## 📁 Project Structure

```
observability-demo/
├── app/                    # Demo Node.js application
│   ├── src/
│   │   ├── index.js       # Main server
│   │   └── public/        # Frontend
│   ├── Dockerfile
│   └── package.json
├── prometheus/
│   └── prometheus.yml     # Prometheus config
├── grafana/
│   └── provisioning/      # Auto-provisioned datasources & dashboards
├── graylog-setup/
│   └── setup.sh           # Auto-creates GELF input
├── docker-compose.yml     # Full stack orchestration
├── fly.toml              # Fly.io deployment config
├── .env                   # Environment configuration
└── README.md
```

## 🔧 Configuration

### Ports

| Service    | Port | Protocol |
|------------|------|----------|
| Demo App   | 3000 | HTTP     |
| Grafana    | 3001 | HTTP     |
| Prometheus | 9090 | HTTP     |
| Graylog    | 9000 | HTTP     |
| GELF       | 12201| UDP      |
| OpenSearch | 9200 | HTTP     |

### Credentials

All services use `admin/admin` by default (change in production).

### Metrics

The demo app exposes Prometheus metrics at `/metrics`:
- `demo_http_requests_total` - HTTP request counter
- `demo_work_duration_seconds` - Work duration histogram
- `demo_errors_total` - Error counter
- Standard Node.js metrics (CPU, memory, etc.)

### Logs

Logs are sent via GELF UDP to Graylog:
- Application logs
- Request logs with duration
- Error logs with stack traces

## 🛠️ Development

### Run App Standalone

```bash
cd app
npm install
npm start
```

### Build Docker Image

```bash
docker build -t observability-demo-app ./app
docker run -p 3000:3000 \
  -e GELF_HOST=localhost \
  -e GELF_PORT=12201 \
  observability-demo-app
```

### MCP Server

The app can run as an MCP server:

```bash
# See mcp.json for configuration
node app/src/index.js
```

## 📝 API Endpoints

| Endpoint    | Method | Description                           |
|-------------|--------|---------------------------------------|
| `/`         | GET    | Web UI                                |
| `/config`   | GET    | Get public URLs configuration         |
| `/health`   | GET    | Health check                          |
| `/metrics`  | GET    | Prometheus metrics                    |
| `/work`     | GET    | Single simulated work operation       |
| `/simulate` | GET    | Generate N operations (?count=100)    |

## 🐛 Troubleshooting

### Graylog Not Starting
- Increase Docker memory to 8GB+
- Wait 2-3 minutes for OpenSearch to initialize
- Check logs: `docker logs graylog`

### No Logs in Graylog
- Verify GELF input created: Graylog → System → Inputs
- Check container networking: `docker network inspect observability-demo_observability`
- Verify app can reach Graylog: `docker exec demo-app ping graylog`

### Metrics Not Appearing
- Check Prometheus targets: http://localhost:9090/targets
- Verify app /metrics endpoint: http://localhost:3000/metrics
- Check Prometheus config: `docker exec prometheus cat /etc/prometheus/prometheus.yml`

## 📄 License

MIT

## 🤝 Contributing

Pull requests welcome! Please ensure:
- Code follows existing style
- All services start successfully
- Documentation is updated

## 🔗 Links

- [Prometheus Docs](https://prometheus.io/docs/)
- [Grafana Docs](https://grafana.com/docs/)
- [Graylog Docs](https://docs.graylog.org/)
- [prom-client](https://github.com/siimon/prom-client)
- [gelf-pro](https://github.com/kkamkou/node-gelf-pro)
