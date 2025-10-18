# Cloud Deployment Guide

This guide helps you deploy the observability demo to various cloud platforms.

## 🚀 Option 1: Deploy to Fly.io (Easiest)

Fly.io supports multi-container deployment. Deploy the entire stack:

### Install Fly CLI

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Deploy Demo App

```bash
# Login
fly auth login

# Launch app
fly launch --name observability-demo-app

# Set secrets (these won't be localhost in cloud)
fly secrets set \
  NODE_ENV=production \
  PUBLIC_GRAFANA_URL=https://grafana.yourdomain.com \
  PUBLIC_PROMETHEUS_URL=https://prometheus.yourdomain.com \
  PUBLIC_GRAYLOG_URL=https://graylog.yourdomain.com

# Deploy
fly deploy
```

Your app will be available at: `https://observability-demo-app.fly.dev`

### For Full Stack on Fly.io

Deploy each service separately:

```bash
# Deploy Prometheus
cd prometheus
fly launch --name observability-demo-prometheus
fly deploy

# Deploy Grafana
cd ../
fly launch --name observability-demo-grafana
fly secrets set GF_SECURITY_ADMIN_PASSWORD=yourpassword
fly deploy

# Update app with actual URLs
fly secrets set \
  PUBLIC_GRAFANA_URL=https://observability-demo-grafana.fly.dev \
  PUBLIC_PROMETHEUS_URL=https://observability-demo-prometheus.fly.dev
```

---

## 🌊 Option 2: Deploy to Railway

Railway is great for Docker Compose apps.

### Steps

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `observability-demo` repo
4. Railway will detect `docker-compose.yml` and deploy all services
5. Go to each service and get the public URL
6. Update environment variables with public URLs

---

## 🎨 Option 3: Deploy to Render

### Deploy App

1. Go to [render.com](https://render.com)
2. New → Web Service → Connect GitHub repo
3. Configure:
   - **Name**: observability-demo
   - **Environment**: Docker
   - **Docker Build Context**: `/app`
   - **Dockerfile Path**: `/app/Dockerfile`
4. Add environment variables:
   ```
   NODE_ENV=production
   PUBLIC_GRAFANA_URL=https://grafana.onrender.com
   PUBLIC_PROMETHEUS_URL=https://prometheus.onrender.com
   PUBLIC_GRAYLOG_URL=https://graylog.onrender.com
   ```
5. Click Create Web Service

### Deploy Monitoring Stack

Repeat for each service (Prometheus, Grafana, Graylog).

---

## ☸️ Option 4: Deploy to Kubernetes

For production-grade deployment:

### Prerequisites
- kubectl installed
- Access to a Kubernetes cluster (GKE, EKS, AKS, or local k3s)

### Deploy with Helm

```bash
# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/prometheus \
  --namespace monitoring --create-namespace

# Install Grafana
helm install grafana grafana/grafana \
  --namespace monitoring \
  --set adminPassword=admin

# Deploy your app
kubectl apply -f k8s/
```

### Get Service URLs

```bash
# Get Grafana URL
kubectl get svc -n monitoring grafana -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Get Prometheus URL
kubectl get svc -n monitoring prometheus-server -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

---

## 🐳 Option 5: Deploy to DigitalOcean App Platform

### Via UI

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Create App → GitHub → Select repo
3. DigitalOcean detects Dockerfile
4. Configure:
   - HTTP Port: 3000
   - Environment variables (PUBLIC_* URLs)
5. Deploy

### Via CLI

```bash
# Install doctl
brew install doctl  # macOS
apt install doctl   # Ubuntu

# Authenticate
doctl auth init

# Create app spec
cat > app-spec.yaml <<EOF
name: observability-demo
services:
- name: app
  github:
    repo: anldrms/observability-demo
    branch: main
  dockerfile_path: app/Dockerfile
  http_port: 3000
  envs:
  - key: NODE_ENV
    value: "production"
  - key: PUBLIC_GRAFANA_URL
    value: "https://grafana.yourdomain.com"
EOF

# Deploy
doctl apps create --spec app-spec.yaml
```

---

## 📦 Option 6: Deploy to AWS (ECS/Fargate)

### Using AWS Copilot

```bash
# Install AWS Copilot
brew install aws/tap/copilot-cli

# Initialize
copilot app init observability-demo

# Create service
copilot svc init --name demo-app --svc-type "Load Balanced Web Service" --dockerfile ./app/Dockerfile

# Deploy
copilot svc deploy --name demo-app

# Get URL
copilot svc show --name demo-app
```

---

## 🌐 Option 7: Deploy with Managed Services

For a simpler approach, use managed monitoring services:

### Architecture

- **App**: Deploy to any platform (Fly.io, Railway, Render)
- **Metrics**: Use [Grafana Cloud](https://grafana.com/products/cloud/) (free tier)
- **Logs**: Use [Datadog](https://www.datadoghq.com/) or [Loggly](https://www.loggly.com/)

### Update App Configuration

```bash
# Update to use Grafana Cloud
export PUBLIC_GRAFANA_URL=https://yourworkspace.grafana.net
export PUBLIC_PROMETHEUS_URL=https://yourworkspace.grafana.net/prometheus

# Remove Graylog dependency if using external logging
export GELF_HOST=logs.yourdomain.com
```

---

## 🔒 Security Best Practices

### Before Going to Production

1. **Change Default Passwords**
   ```bash
   # Generate secure password
   openssl rand -base64 32
   
   # Update .env
   GRAFANA_ADMIN_PASSWORD=<secure-password>
   GRAYLOG_ROOT_PASSWORD_SHA2=$(echo -n '<your-password>' | shasum -a 256 | awk '{print $1}')
   ```

2. **Use Secrets Management**
   - AWS: AWS Secrets Manager
   - GCP: Secret Manager
   - Azure: Key Vault
   - Kubernetes: Sealed Secrets or External Secrets

3. **Enable HTTPS**
   - Use platform SSL/TLS (most cloud platforms provide free SSL)
   - Or use Let's Encrypt with cert-manager (Kubernetes)

4. **Set Up Authentication**
   - Enable OAuth for Grafana
   - Use API keys for Prometheus
   - Configure LDAP/SSO for Graylog

5. **Restrict Network Access**
   - Use VPC/private networks
   - Configure firewall rules
   - Enable IP allowlisting if needed

---

## 📊 Monitoring Your Monitoring

Once deployed, ensure your monitoring stack is healthy:

```bash
# Check app health
curl https://your-app.domain.com/health

# Check Prometheus targets
curl https://prometheus.domain.com/api/v1/targets

# Check Grafana
curl https://grafana.domain.com/api/health
```

---

## 🆘 Troubleshooting Cloud Deployments

### App Can't Connect to Graylog
- Ensure services are on same network/VPC
- Use internal DNS names if available
- Check firewall rules for UDP port 12201

### High Memory Usage
- Reduce retention periods in Prometheus
- Limit OpenSearch heap size
- Use managed services for logs/metrics

### Slow Performance
- Use persistent volumes for data
- Scale horizontally (multiple app instances)
- Use CDN for frontend assets
- Enable caching in Grafana

---

## 💰 Cost Optimization

### Free Tiers
- **Fly.io**: 3 shared-cpu VMs free
- **Railway**: $5 free credits/month
- **Render**: Free for static sites, $7/month for services
- **Grafana Cloud**: Free tier includes 10k series
- **Datadog**: Free tier for 5 hosts

### Recommendations
- Start with managed services (Grafana Cloud, etc.)
- Use spot/preemptible instances for non-critical workloads
- Set up auto-scaling based on traffic
- Monitor costs with cloud provider tools

---

## 📞 Need Help?

- Open an issue: https://github.com/anldrms/observability-demo/issues
- Check logs: `docker logs <container-name>` or platform logs
- Review health endpoints: `/health` on each service
