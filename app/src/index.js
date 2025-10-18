import express from 'express';
import client from 'prom-client';
import gelf from 'gelf-pro';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Environment configuration
const ENV = process.env.NODE_ENV || 'development';
const PORT = parseInt(process.env.PORT || '3000', 10);
const GELF_HOST = process.env.GELF_HOST || 'graylog';
const GELF_PORT = parseInt(process.env.GELF_PORT || '12201', 10);
const APP_NAME = process.env.APP_NAME || 'demo-app';

// Public URLs for external access (cloud deployment)
const PUBLIC_GRAFANA_URL = process.env.PUBLIC_GRAFANA_URL || 'http://localhost:3001';
const PUBLIC_PROMETHEUS_URL = process.env.PUBLIC_PROMETHEUS_URL || 'http://localhost:9090';
const PUBLIC_GRAYLOG_URL = process.env.PUBLIC_GRAYLOG_URL || 'http://localhost:9000';

// Custom metrics
const httpRequestCounter = new client.Counter({
  name: 'demo_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['route', 'method', 'status']
});
const workHistogram = new client.Histogram({
  name: 'demo_work_duration_seconds',
  help: 'Duration of simulated work in seconds',
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2]
});
const errorCounter = new client.Counter({
  name: 'demo_errors_total',
  help: 'Total number of errors',
  labelNames: ['type']
});
register.registerMetric(httpRequestCounter);
register.registerMetric(workHistogram);
register.registerMetric(errorCounter);

// Graylog (GELF UDP)
try {
  gelf.setConfig({
    adapterName: 'udp',
    adapterOptions: { host: GELF_HOST, port: GELF_PORT },
    fields: { facility: APP_NAME, environment: ENV }
  });
  console.log(`GELF logging configured: ${GELF_HOST}:${GELF_PORT}`);
} catch (e) {
  console.error('Failed to configure gelf-pro', e);
}

function logInfo(message, extra = {}) {
  try {
    gelf.info(message, { app: APP_NAME, env: ENV, ...extra });
  } catch (_) {}
}
function logError(message, extra = {}) {
  try {
    gelf.error(message, { app: APP_NAME, env: ENV, ...extra });
  } catch (_) {}
}

// Enable CORS for GitHub Pages
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const status = res.statusCode;
    httpRequestCounter.inc({ route: req.path, method: req.method, status });
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    logInfo('request_finished', { route: req.path, method: req.method, status, duration_ms: ms.toFixed(2) });
  });
  next();
});

// Config endpoint - returns public URLs
app.get('/config', (req, res) => {
  res.json({
    app_name: APP_NAME,
    environment: ENV,
    version: '1.0.0',
    grafana_url: PUBLIC_GRAFANA_URL,
    prometheus_url: PUBLIC_PROMETHEUS_URL,
    graylog_url: PUBLIC_GRAYLOG_URL
  });
});

// Simulated work endpoint
app.get('/work', async (req, res) => {
  const duration = Math.random() * 800 + 20; // 20-820 ms
  const end = workHistogram.startTimer();
  await new Promise(r => setTimeout(r, duration));
  end();
  if (Math.random() < 0.1) {
    errorCounter.inc({ type: 'simulated' });
    logError('simulated_error', { duration_ms: duration.toFixed(2) });
    return res.status(500).json({ ok: false, error: 'simulated_error', duration_ms: duration.toFixed(2) });
  }
  res.json({ ok: true, duration_ms: duration.toFixed(2) });
});

// Trigger N simulated calls
app.get('/simulate', async (req, res) => {
  const count = Math.min(parseInt(req.query.count || '50', 10), 500);
  let completed = 0;
  let errors = 0;
  
  for (let i = 0; i < count; i++) {
    // Fire and forget
    (async () => {
      try {
        const duration = Math.random() * 800 + 20;
        const end = workHistogram.startTimer();
        await new Promise(r => setTimeout(r, duration));
        end();
        if (Math.random() < 0.1) {
          errors++;
          errorCounter.inc({ type: 'simulated' });
          logError('simulated_error', { duration_ms: duration.toFixed(2), batch: true });
        } else {
          logInfo('simulated_ok', { duration_ms: duration.toFixed(2), batch: true });
        }
      } catch (e) {
        errors++;
        errorCounter.inc({ type: 'exception' });
        logError('simulate_exception', { message: e.message });
      } finally {
        completed++;
      }
    })();
  }
  res.json({ 
    started: count, 
    message: `Simulation started. ${count} operations queued.`,
    expected_errors: Math.floor(count * 0.1)
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    environment: ENV,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Demo app listening on 0.0.0.0:${PORT}`);
  console.log(`📊 Environment: ${ENV}`);
  console.log(`📈 Metrics: http://0.0.0.0:${PORT}/metrics`);
  console.log(`🏥 Health: http://0.0.0.0:${PORT}/health`);
  logInfo('app_started', { port: PORT, environment: ENV });
});
