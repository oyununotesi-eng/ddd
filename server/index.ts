import express from 'express';
import { CertificateHistoryError, fetchCertificateHistory } from './tools/certificateHistory';
import { inspectSslTarget, SslTargetError } from './tools/sslCertificate';

const app = express();
const port = Number(process.env.API_PORT || 3002);
app.use(express.json({ limit: '4kb', strict: true }));

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_PER_CLIENT = 12;
const rateWindowByClient = new Map<string, number[]>();
let activeSslChecks = 0;
let activeHistoryLookups = 0;

const allowRateLimitedRequest = (request: express.Request, response: express.Response): boolean => {
  const now = Date.now();
  const clientKey = request.socket.remoteAddress || 'unknown';
  for (const [key, requests] of rateWindowByClient) {
    const activeRequests = requests.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
    if (activeRequests.length) rateWindowByClient.set(key, activeRequests);
    else rateWindowByClient.delete(key);
  }
  const requests = rateWindowByClient.get(clientKey) || [];
  if (requests.length >= RATE_LIMIT_PER_CLIENT) {
    response.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many certificate requests. Wait a minute and try again.' } });
    return false;
  }
  requests.push(now);
  rateWindowByClient.set(clientKey, requests);
  return true;
};

app.post('/api/tools/ssl-check', (request, response) => {
  if (!allowRateLimitedRequest(request, response)) return;
  if (activeSslChecks >= 3) {
    response.status(503).json({ error: { code: 'CHECK_CAPACITY', message: 'Certificate checks are busy. Try again shortly.' } });
    return;
  }
  activeSslChecks += 1;
  const input = request.body && typeof request.body === 'object' ? (request.body as Record<string, unknown>).target : undefined;
  void inspectSslTarget(input)
    .then((result) => response.json(result))
    .catch((error: unknown) => {
      if (error instanceof SslTargetError) {
        response.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
        return;
      }
      response.status(500).json({ error: { code: 'SSL_CHECK_FAILED', message: 'The certificate check could not be completed.' } });
    })
    .finally(() => { activeSslChecks -= 1; });
});

app.post('/api/tools/certificate-history', (request, response) => {
  if (!allowRateLimitedRequest(request, response)) return;
  if (activeHistoryLookups >= 2) {
    response.status(503).json({ error: { code: 'HISTORY_CAPACITY', message: 'Certificate history lookups are busy. Try again shortly.' } });
    return;
  }
  activeHistoryLookups += 1;
  const input = request.body && typeof request.body === 'object' ? (request.body as Record<string, unknown>).domain : undefined;
  void fetchCertificateHistory(input)
    .then((result) => response.json(result))
    .catch((error: unknown) => {
      if (error instanceof CertificateHistoryError || error instanceof SslTargetError) {
        response.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
        return;
      }
      response.status(502).json({ error: { code: 'CT_SOURCE_ERROR', message: 'Certificate Transparency history could not be loaded.' } });
    })
    .finally(() => { activeHistoryLookups -= 1; });
});

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

app.listen(port, '127.0.0.1', () => {
  console.log(`Workspace API listening on http://127.0.0.1:${port}`);
});
