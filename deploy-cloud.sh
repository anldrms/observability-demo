#!/usr/bin/env bash
set -euo pipefail

# Observability Demo - Cloud Deployment Helper
# This script helps deploy the app to various cloud platforms

echo "🚀 Observability Demo - Cloud Deployment Helper"
echo "================================================"
echo ""

# Check if platform is specified
if [ $# -eq 0 ]; then
    echo "Usage: ./deploy-cloud.sh <platform>"
    echo ""
    echo "Available platforms:"
    echo "  flyio      - Deploy to Fly.io"
    echo "  railway    - Deploy to Railway" 
    echo "  render     - Deploy to Render"
    echo "  local      - Run locally with Docker Compose"
    echo ""
    echo "Example: ./deploy-cloud.sh flyio"
    exit 1
fi

PLATFORM=$1

case "$PLATFORM" in
    flyio)
        echo "📦 Deploying to Fly.io..."
        echo ""
        
        # Check if flyctl is installed
        if ! command -v fly &> /dev/null; then
            echo "❌ flyctl not found. Installing..."
            if [[ "$OSTYPE" == "darwin"* ]]; then
                brew install flyctl
            else
                curl -L https://fly.io/install.sh | sh
            fi
        fi
        
        echo "✅ flyctl found"
        echo ""
        
        # Check if logged in
        if ! fly auth whoami &> /dev/null; then
            echo "🔐 Please login to Fly.io:"
            fly auth login
        fi
        
        echo "✅ Authenticated"
        echo ""
        
        # Check if app exists
        APP_NAME="observability-demo-$(whoami)"
        echo "🏗️  App name: $APP_NAME"
        
        if fly apps list | grep -q "$APP_NAME"; then
            echo "📱 App exists, deploying update..."
            fly deploy
        else
            echo "📱 Creating new app..."
            fly launch --name "$APP_NAME" --config fly.toml --now
        fi
        
        echo ""
        echo "✅ Deployment complete!"
        echo "🌐 Your app: https://$APP_NAME.fly.dev"
        echo ""
        echo "⚙️  Next steps:"
        echo "   1. Deploy monitoring services separately or use managed services"
        echo "   2. Update environment variables:"
        echo "      fly secrets set PUBLIC_GRAFANA_URL=https://your-grafana-url.com"
        echo "   3. Visit your app and test!"
        ;;
        
    railway)
        echo "📦 Deploying to Railway..."
        echo ""
        
        # Check if railway is installed
        if ! command -v railway &> /dev/null; then
            echo "❌ Railway CLI not found. Installing..."
            npm install -g @railway/cli
        fi
        
        echo "✅ Railway CLI found"
        echo ""
        
        # Check if logged in
        if ! railway whoami &> /dev/null; then
            echo "🔐 Please login to Railway:"
            railway login
        fi
        
        echo "✅ Authenticated"
        echo ""
        
        echo "🏗️  Initializing Railway project..."
        railway init
        
        echo "🚀 Deploying with docker-compose..."
        railway up
        
        echo ""
        echo "✅ Deployment complete!"
        echo "🌐 Visit Railway dashboard to get your URLs"
        ;;
        
    render)
        echo "📦 Deploying to Render..."
        echo ""
        echo "Render deployment is best done via the web UI:"
        echo ""
        echo "1. Go to https://render.com"
        echo "2. Click 'New +' → 'Web Service'"
        echo "3. Connect your GitHub repo: anldrms/observability-demo"
        echo "4. Configure:"
        echo "   - Name: observability-demo"
        echo "   - Environment: Docker"
        echo "   - Docker Context: /app"
        echo "   - Dockerfile: /app/Dockerfile"
        echo "5. Add environment variables from .env.example"
        echo "6. Click 'Create Web Service'"
        echo ""
        echo "Opening Render in browser..."
        sleep 2
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open https://render.com
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open https://render.com
        else
            echo "Please visit: https://render.com"
        fi
        ;;
        
    local)
        echo "🏠 Running locally with Docker Compose..."
        echo ""
        
        # Check if docker is running
        if ! docker info &> /dev/null; then
            echo "❌ Docker is not running. Please start Docker and try again."
            exit 1
        fi
        
        echo "✅ Docker is running"
        echo ""
        
        # Check if .env exists
        if [ ! -f .env ]; then
            echo "⚙️  Creating .env from .env.example..."
            cp .env.example .env
            
            # Generate secrets
            echo "🔐 Generating secrets..."
            SECRET=$(openssl rand -hex 32)
            PASSWORD_HASH=$(echo -n 'admin' | shasum -a 256 | awk '{print $1}')
            
            # Update .env
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/^GRAYLOG_PASSWORD_SECRET=$/GRAYLOG_PASSWORD_SECRET=$SECRET/" .env
                sed -i '' "s/^GRAYLOG_ROOT_PASSWORD_SHA2=$/GRAYLOG_ROOT_PASSWORD_SHA2=$PASSWORD_HASH/" .env
            else
                sed -i "s/^GRAYLOG_PASSWORD_SECRET=$/GRAYLOG_PASSWORD_SECRET=$SECRET/" .env
                sed -i "s/^GRAYLOG_ROOT_PASSWORD_SHA2=$/GRAYLOG_ROOT_PASSWORD_SHA2=$PASSWORD_HASH/" .env
            fi
            
            echo "✅ .env created with generated secrets"
        else
            echo "✅ .env already exists"
        fi
        
        echo ""
        echo "🚀 Starting services..."
        docker compose up -d --build
        
        echo ""
        echo "⏳ Waiting for services to start..."
        sleep 10
        
        echo ""
        echo "✅ Services started!"
        echo ""
        echo "🌐 Access your services:"
        echo "   App:        http://localhost:3000"
        echo "   Grafana:    http://localhost:3001 (admin/admin)"
        echo "   Prometheus: http://localhost:9090"
        echo "   Graylog:    http://localhost:9000 (admin/admin)"
        echo ""
        echo "📊 To view logs: docker compose logs -f"
        echo "🛑 To stop: docker compose down"
        echo "🗑️  To clean up: docker compose down -v"
        ;;
        
    *)
        echo "❌ Unknown platform: $PLATFORM"
        echo ""
        echo "Available platforms: flyio, railway, render, local"
        exit 1
        ;;
esac
