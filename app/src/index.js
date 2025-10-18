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
register.registerMetric(httpRequestCounter);
register.registerMetric(workHistogram);

// Graylog (GELF UDP)
const GELF_HOST = process.env.GELF_HOST || 'graylog';
const GELF_PORT = parseInt(process.env.GELF_PORT || '12201', 10);
const APP_NAME = process.env.APP_NAME || 'demo-app';

// Configure gelf-pro
try {
  gelf.setConfig({
    adapterName: 'udp',
    adapterOptions: { host: GELF_HOST, port: GELF_PORT },
    fields: { facility: APP_NAME }
  });
} catch (e) {
  console.error('Failed to configure gelf-pro', e);
}

function logInfo(message, extra = {}) {
  try {
    gelf.info(message, { app: APP_NAME, ...extra });
  } catch (_) {}
}
function logError(message, extra = {}) {
  try {
    gelf.error(message, { app: APP_NAME, ...extra });
  } catch (_) {}
}

app.use(express.static(path.join(__dirname, 'public')));

// Simple middleware to count requests
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

// Simulated work endpoint
app.get('/work', async (req, res) => {
  const duration = Math.random() * 800 + 20; // 20-820 ms
  const end = workHistogram.startTimer();
  await new Promise(r => setTimeout(r, duration));
  end();
  if (Math.random() < 0.1) {
    logError('simulated_error', { duration_ms: duration.toFixed(2) });
    return res.status(500).json({ ok: false, error: 'simulated_error' });
  }
  res.json({ ok: true, duration_ms: duration.toFixed(2) });
});

// Trigger N simulated calls
app.get('/simulate', async (req, res) => {
  const count = Math.min(parseInt(req.query.count || '50', 10), 500);
  let completed = 0;
  for (let i = 0; i < count; i++) {
    // Fire and forget
    (async () => {
      try {
        const duration = Math.random() * 800 + 20;
        const end = workHistogram.startTimer();
        await new Promise(r => setTimeout(r, duration));
        end();
        if (Math.random() < 0.1) {
          logError('simulated_error', { duration_ms: duration.toFixed(2), batch: true });
        } else {
          logInfo('simulated_ok', { duration_ms: duration.toFixed(2), batch: true });
        }
      } catch (e) {
        logError('simulate_exception', { message: e.message });
      } finally {
        completed++;
      }
    })();
  }
  res.json({ started: count, message: 'Simulation started. Metrics/logs will appear shortly.' });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Demo app listening on port ${port}`);
  logInfo('app_started', { port });
});
