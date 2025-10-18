# GitHub Pages Deployment Guide

## 🌐 Deploy Frontend to GitHub Pages

The frontend is a static HTML page that connects to your backend API via CORS.

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/anldrms/observability-demo
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/docs`
4. Click **Save**

GitHub will build and deploy your site. It will be available at:
**https://anldrms.github.io/observability-demo/**

### Step 2: Deploy Backend

Deploy your backend to any cloud platform:

#### Option A: Fly.io (Recommended)

```bash
cd observability-demo
fly launch --name observability-demo-api
fly deploy
```

Your API will be at: `https://observability-demo-api.fly.dev`

#### Option B: Railway

```bash
railway init
railway up
```

#### Option C: Render

1. Go to https://render.com
2. New → Web Service
3. Connect your repo
4. Select `/app` as build context
5. Deploy

### Step 3: Configure Frontend

1. Open your GitHub Pages site: https://anldrms.github.io/observability-demo/
2. Enter your backend URL in the configuration box:
   - Example: `https://observability-demo-api.fly.dev`
3. Click **Save Configuration**
4. Click **Test Connection**

That's it! The frontend will save your config in browser localStorage.

### Step 4: Deploy Monitoring Stack

You have two options:

#### Option A: Use Managed Services (Easier)

1. **Grafana Cloud**: https://grafana.com/products/cloud/ (free tier)
2. **Datadog**: https://www.datadoghq.com/ (free trial)
3. Update backend environment variables with these URLs

#### Option B: Deploy Full Stack (Complete Solution)

Deploy Prometheus, Grafana, and Graylog to the same platform:

```bash
# On Fly.io
fly launch --name observability-demo-grafana --image grafana/grafana:11.2.0
fly launch --name observability-demo-prometheus --image prom/prometheus:v2.53.0

# Set environment variables
fly secrets set \
  PUBLIC_GRAFANA_URL=https://observability-demo-grafana.fly.dev \
  PUBLIC_PROMETHEUS_URL=https://observability-demo-prometheus.fly.dev
```

## 🔧 How It Works

### Architecture

```
┌─────────────────────┐
│   GitHub Pages      │  ← Static HTML/CSS/JS
│   (Frontend)        │
└──────────┬──────────┘
           │ CORS API calls
           ▼
┌─────────────────────┐
│   Cloud Platform    │  ← Node.js Express API
│   (Backend API)     │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌─────────┐  ┌─────────┐
│Prometheu│  │ Graylog │
│  Grafana│  │         │
└─────────┘  └─────────┘
```

### Key Features

1. **Static Frontend**: Hosted free on GitHub Pages
2. **CORS Enabled**: Backend allows cross-origin requests
3. **LocalStorage Config**: Your backend URL is saved in the browser
4. **Dynamic Links**: Frontend fetches monitoring URLs from backend
5. **No Backend Required**: Works with any API that implements the endpoints

## 🔒 Security Notes

### CORS Configuration

The backend enables CORS for all origins (`*`). For production:

```javascript
// In app/src/index.js, replace:
res.header('Access-Control-Allow-Origin', '*');

// With your specific domain:
res.header('Access-Control-Allow-Origin', 'https://anldrms.github.io');
```

### API Authentication

For production, add API key authentication:

```javascript
// Backend
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Frontend
fetch(url, {
  headers: { 'X-API-Key': 'your-api-key' }
});
```

## 🎨 Customization

### Change Frontend Theme

Edit `docs/index.html`:

```css
/* Change gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add Custom Endpoints

Add new buttons in the HTML:

```html
<a href="#" class="link-btn" id="link-custom" target="_blank">
  🎯 Custom Endpoint
</a>
```

Update JavaScript:

```javascript
if (config.apiUrl) {
  document.getElementById('link-custom').href = `${config.apiUrl}/custom`;
}
```

## 📊 Testing Locally

Test the GitHub Pages site locally:

```bash
cd docs
python3 -m http.server 8000
# or
npx http-server -p 8000
```

Open: http://localhost:8000

## 🚀 Going Live Checklist

- [ ] Enable GitHub Pages in repository settings
- [ ] Deploy backend to cloud platform
- [ ] Enable CORS on backend
- [ ] Test connection from GitHub Pages site
- [ ] Configure monitoring URLs
- [ ] Test traffic simulation
- [ ] Update README with your URLs
- [ ] (Optional) Add custom domain

## 📝 Custom Domain

To use a custom domain (e.g., observability.yourdomain.com):

1. Add a `CNAME` file in `docs/`:
   ```
   observability.yourdomain.com
   ```

2. Add DNS records at your domain registrar:
   ```
   Type: CNAME
   Name: observability
   Value: anldrms.github.io
   ```

3. In GitHub Settings → Pages, enter your custom domain

## 🆘 Troubleshooting

### "Connection failed" Error

1. Check backend is running: `curl https://your-backend.fly.dev/health`
2. Verify CORS headers: Check browser console
3. Ensure HTTPS (GitHub Pages requires it)

### GitHub Pages Not Updating

1. Check Actions tab for build status
2. Clear browser cache
3. Wait 5-10 minutes for CDN propagation
4. Force rebuild: Make a small commit

### Backend Not Accessible

1. Check if backend is deployed: `fly status`
2. Verify environment variables
3. Check backend logs: `fly logs`
4. Test directly: `curl https://your-backend.fly.dev/health`

## 💡 Pro Tips

1. **Use Environment Variables**: Store API URL in frontend config
2. **Add Loading States**: Show spinners while fetching
3. **Error Handling**: Display user-friendly error messages
4. **Caching**: Cache monitoring URLs in localStorage
5. **Analytics**: Add Google Analytics to track usage

## 📚 Resources

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Fly.io Docs](https://fly.io/docs/)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
