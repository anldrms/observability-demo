# 🚀 Quick Start Guide

Get your observability platform running in minutes!

## Option 1: Deploy to Cloud (Recommended)

### Fly.io (Easiest - Full Stack)

```bash
./deploy-cloud.sh flyio
```

That's it! The script will:
1. Install flyctl if needed
2. Authenticate you
3. Deploy your app
4. Give you a public URL

### Railway (Docker Compose Support)

```bash
./deploy-cloud.sh railway
```

Railway automatically detects `docker-compose.yml` and deploys all services.

### Render / Others

```bash
./deploy-cloud.sh render  # Opens web UI with instructions
```

---

## Option 2: Run Locally

```bash
./deploy-cloud.sh local
```

This will:
1. Check Docker is running
2. Create `.env` with generated secrets
3. Start all services with `docker compose up`
4. Give you access URLs

**Services:**
- 🌐 App: http://localhost:3000
- 📊 Grafana: http://localhost:3001 (admin/admin)
- 🔥 Prometheus: http://localhost:9090
- 📝 Graylog: http://localhost:9000 (admin/admin)

---

## Option 3: Manual Deploy

### Local Development

```bash
# Clone and setup
git clone git@github.com:anldrms/observability-demo.git
cd observability-demo
cp .env.example .env

# Generate secrets
export SECRET=$(openssl rand -hex 32)
export HASH=$(echo -n 'admin' | shasum -a 256 | awk '{print $1}')

# Update .env (or do it manually)
sed -i '' "s/^GRAYLOG_PASSWORD_SECRET=$/GRAYLOG_PASSWORD_SECRET=$SECRET/" .env
sed -i '' "s/^GRAYLOG_ROOT_PASSWORD_SHA2=$/GRAYLOG_ROOT_PASSWORD_SHA2=$HASH/" .env

# Start
docker compose up -d --build

# View logs
docker compose logs -f
```

### Cloud Deployment (Manual)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed platform-specific instructions.

---

## 🎯 Using the Platform

1. **Open the app**: http://localhost:3000 (or your cloud URL)
2. **Generate traffic**: Click "Start Simulation" → Enter count (e.g., 100)
3. **View metrics**:
   - Click "Prometheus Metrics" to see raw metrics
   - Click "Grafana Dashboard" to see visualizations
   - Click "Graylog Logs" to see log aggregation

---

## 🔧 Configuration

### Change Public URLs (Cloud Deployment)

Edit `.env`:

```bash
PUBLIC_GRAFANA_URL=https://your-grafana.fly.dev
PUBLIC_PROMETHEUS_URL=https://your-prometheus.fly.dev
PUBLIC_GRAYLOG_URL=https://your-graylog.fly.dev
```

Or set via platform secrets:

```bash
# Fly.io
fly secrets set PUBLIC_GRAFANA_URL=https://...

# Railway
railway variables set PUBLIC_GRAFANA_URL=https://...
```

### Change Passwords

Edit `.env`:

```bash
# Generate new hash for "mypassword"
echo -n 'mypassword' | shasum -a 256 | awk '{print $1}'

# Update .env
GRAYLOG_ROOT_PASSWORD_SHA2=<new_hash>
GRAFANA_ADMIN_PASSWORD=mypassword
```

---

## 🆘 Troubleshooting

### Services not starting?

```bash
# Check logs
docker compose logs

# Specific service
docker compose logs graylog

# Restart everything
docker compose restart
```

### Graylog taking forever?

Graylog needs 2-3 minutes to start. Check:

```bash
docker logs graylog | tail -20
```

Look for: `Graylog server up and running`

### Can't access services?

Check if ports are already in use:

```bash
lsof -i :3000  # App
lsof -i :3001  # Grafana
lsof -i :9090  # Prometheus
lsof -i :9000  # Graylog
```

Change ports in `.env`:

```bash
APP_PORT=3000
GRAFANA_PORT=3001
PROMETHEUS_PORT=9090
GRAYLOG_PORT=9000
```

### High memory usage?

Increase Docker memory to 8GB+ in Docker Desktop settings.

---

## 📚 Learn More

- [Full Deployment Guide](./DEPLOYMENT.md)
- [Architecture & API Docs](./README.md)
- [GitHub Repository](https://github.com/anldrms/observability-demo)

---

## 🎉 Success!

Once everything is running:

1. ✅ Generate traffic from the web UI
2. ✅ Watch metrics in Prometheus/Grafana
3. ✅ View logs in Graylog
4. ✅ Explore the dashboards
5. ✅ Customize and extend!

**Enjoy your observability platform!** 🚀
