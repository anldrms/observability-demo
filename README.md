# Observability Demo Platform

🌐 **Live Demo**: https://anldrms.github.io/observability-demo/

A production-ready observability stack with Prometheus, Grafana, and Graylog.

## ✨ New: GitHub Pages Deployment

The frontend is now available as a **static site on GitHub Pages**! No backend required to try the UI.

### Quick Start

1. **Visit the live site**: https://anldrms.github.io/observability-demo/
2. **Deploy your backend** to any cloud platform (see below)
3. **Configure** by entering your backend URL
4. **Start monitoring**!

## 🚀 Two-Part Architecture

### Frontend (GitHub Pages - Free!)
- Static HTML/CSS/JavaScript
- No server required
- Hosted on GitHub Pages
- Live at: https://anldrms.github.io/observability-demo/

### Backend (Your Cloud Platform)
- Node.js Express API
- Prometheus metrics
- Graylog logging
- Deploy to: Fly.io, Railway, Render, etc.

## 📦 Quick Deploy

### Option 1: Frontend Only (Try the UI)

Just visit: https://anldrms.github.io/observability-demo/

The UI works standalone and can be configured to connect to any backend.

### Option 2: Full Stack (Frontend + Backend)

#### Deploy Backend:

```bash
# Clone the repo
git clone git@github.com:anldrms/observability-demo.git
cd observability-demo

# Deploy to Fly.io (easiest)
./deploy-cloud.sh flyio

# Or Railway
./deploy-cloud.sh railway

# Or run locally
./deploy-cloud.sh local
```

#### Configure Frontend:

1. Go to https://anldrms.github.io/observability-demo/
2. Enter your backend URL (e.g., `https://your-app.fly.dev`)
3. Click "Save Configuration"
4. Start generating traffic!

### Option 3: Full Local Development

```bash
git clone git@github.com:anldrms/observability-demo.git
cd observability-demo
docker compose up -d --build
```

Access at:
- Frontend: http://localhost:3000
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090
- Graylog: http://localhost:9000

## 🎯 Features

✅ **Frontend (GitHub Pages)**
- Beautiful, responsive UI
- Traffic simulation controls
- Real-time status monitoring
- Dynamic configuration
- LocalStorage for settings

✅ **Backend (Cloud/Local)**
- Express.js API server
- Prometheus metrics endpoint
- GELF logging to Graylog
- Health checks
- CORS enabled for GitHub Pages

✅ **Monitoring Stack**
- Prometheus (metrics collection)
- Grafana (dashboards)
- Graylog (log aggregation)
- OpenSearch (log storage)
- MongoDB (Graylog metadata)

## 📚 Documentation

- **[GITHUB_PAGES.md](./GITHUB_PAGES.md)** - GitHub Pages deployment guide
- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 1 command
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed cloud deployment guides
- **[API Documentation](#api-endpoints)** - Below

## 🏗️ Architecture

```
┌──────────────────────┐
│   GitHub Pages       │  ← Free static hosting
│   (Frontend UI)      │     https://anldrms.github.io/...
└──────────┬───────────┘
           │ CORS-enabled API calls
           ▼
┌──────────────────────┐
│   Cloud Platform     │  ← Deploy to Fly.io, Railway, etc.
│   (Express API)      │
└──────────┬───────────┘
           │
    ┌──────┴──────┬──────────┐
    ▼             ▼          ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│Prometheu│  │ Grafana │  │ Graylog │
└─────────┘  └─────────┘  └─────────┘
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Web UI (served from backend) |
| `/config` | GET | Get monitoring URLs configuration |
| `/health` | GET | Health check with uptime |
| `/metrics` | GET | Prometheus metrics |
| `/work` | GET | Single simulated work operation |
| `/simulate` | GET | Generate N operations (?count=100) |

## 🌐 Environment Variables

### Backend Configuration

```bash
# Application
NODE_ENV=production
PORT=3000

# Logging
GELF_HOST=graylog
GELF_PORT=12201

# Public URLs (for frontend)
PUBLIC_GRAFANA_URL=https://grafana.yourapp.com
PUBLIC_PROMETHEUS_URL=https://prometheus.yourapp.com
PUBLIC_GRAYLOG_URL=https://graylog.yourapp.com
```

See `.env.example` for complete list.

## 🔒 Security

### CORS Configuration

By default, CORS is enabled for all origins to work with GitHub Pages. For production:

```javascript
// Restrict to your domain only
res.header('Access-Control-Allow-Origin', 'https://anldrms.github.io');
```

### API Authentication

Add API key authentication for production:

```bash
# Set environment variable
API_KEY=your-secret-key

# In frontend, add header
fetch(url, {
  headers: { 'X-API-Key': 'your-secret-key' }
});
```

## 📊 Metrics

The demo app exposes these Prometheus metrics:

- `demo_http_requests_total` - HTTP request counter (by route, method, status)
- `demo_work_duration_seconds` - Work duration histogram
- `demo_errors_total` - Error counter (by type)
- `process_*` - Standard Node.js process metrics
- `nodejs_*` - Node.js runtime metrics

## 📝 Logs

Logs are sent via GELF UDP to Graylog:

- Application startup/shutdown
- Request logs with duration
- Error logs with details
- Simulated work operations

## 🛠️ Development

### Frontend Development

```bash
cd docs
python3 -m http.server 8000
# Open http://localhost:8000
```

### Backend Development

```bash
cd app
npm install
npm start
# API at http://localhost:3000
```

### Full Stack Development

```bash
docker compose up -d
# All services available
```

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend

1. Check CORS is enabled on backend
2. Verify backend URL is correct
3. Ensure backend is running: `curl https://your-backend/health`
4. Check browser console for errors

### GitHub Pages Not Updating

1. Check Settings → Pages is enabled
2. Verify source is set to `main` branch, `/docs` folder
3. Check Actions tab for build status
4. Clear browser cache

### Backend Deployment Issues

See [DEPLOYMENT.md](./DEPLOYMENT.md) for platform-specific troubleshooting.

## 📄 License

MIT

## 🤝 Contributing

Pull requests welcome! Please:
- Follow existing code style
- Test your changes locally
- Update documentation

## 🔗 Links

- **Live Demo**: https://anldrms.github.io/observability-demo/
- **GitHub**: https://github.com/anldrms/observability-demo
- **Issues**: https://github.com/anldrms/observability-demo/issues

## ⭐ Star This Repo

If you find this useful, please star the repo!

---

Built with ❤️ using Node.js, Express, Prometheus, Grafana, and Graylog
