import type { CertificateHistoryRecord, CertificateHistoryResponse } from '../../src/types';
import { parseSslTarget, SslTargetError } from './sslCertificate';

const CRT_SH_BASE_URL = 'https://crt.sh/';
const CRT_SH_TIMEOUT_MS = 8_000;
const MAX_CRT_SH_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_HISTORY_RECORDS = 100;

export class CertificateHistoryError extends Error {
  constructor(message: string, readonly statusCode = 502, readonly code = 'CT_SOURCE_ERROR') {
    super(message);
    this.name = 'CertificateHistoryError';
  }
}

const readBoundedBody = async (response: Response): Promise<string> => {
  if (!response.body) throw new CertificateHistoryError('Certificate Transparency source returned an empty response.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_CRT_SH_RESPONSE_BYTES) {
        await reader.cancel();
        throw new CertificateHistoryError('Certificate Transparency response exceeded the size limit.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks).toString('utf8');
};

const asString = (value: unknown, maxLength = 2_000): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value).slice(0, maxLength) : '';

export const normalizeHistoryRow = (value: unknown): CertificateHistoryRecord | null => {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const id = asString(row.id, 40);
  if (!id) return null;
  const names = [...new Set(asString(row.name_value, 10_000).split(/\r?\n/).map((name) => name.trim()).filter(Boolean))].slice(0, 100);
  return {
    id,
    commonName: asString(row.common_name, 500) || '(not provided)',
    names,
    issuer: asString(row.issuer_name, 1_000) || '(not provided)',
    notBefore: asString(row.not_before, 80) || null,
    notAfter: asString(row.not_after, 80) || null,
    loggedAt: asString(row.entry_timestamp, 80) || null,
    serialNumber: asString(row.serial_number, 300) || '(not provided)',
  };
};

export const fetchCertificateHistory = async (input: unknown, fetcher: typeof fetch = fetch): Promise<CertificateHistoryResponse> => {
  let target;
  try {
    target = parseSslTarget(input);
  } catch (error) {
    if (error instanceof SslTargetError) throw error;
    throw new CertificateHistoryError('Enter a valid public domain name.', 400, 'INVALID_DOMAIN');
  }
  if (target.isIpAddress) throw new CertificateHistoryError('Certificate Transparency history requires a domain name, not an IP address.', 400, 'DOMAIN_REQUIRED');

  const source = new URL(CRT_SH_BASE_URL);
  source.searchParams.set('q', target.host);
  source.searchParams.set('output', 'json');

  let response: Response;
  try {
    response = await fetcher(source, { signal: AbortSignal.timeout(CRT_SH_TIMEOUT_MS), redirect: 'error', headers: { Accept: 'application/json' } });
  } catch (error) {
    const code = error instanceof Error && error.name === 'TimeoutError' ? 'CT_TIMEOUT' : 'CT_UNAVAILABLE';
    throw new CertificateHistoryError(code === 'CT_TIMEOUT' ? 'crt.sh did not respond before the timeout.' : 'Could not reach crt.sh Certificate Transparency service.', 502, code);
  }
  if (!response.ok) {
    const code = response.status === 429 ? 'CT_RATE_LIMITED' : 'CT_HTTP_ERROR';
    throw new CertificateHistoryError(response.status === 429 ? 'crt.sh rate limit was reached. Try again later.' : `crt.sh returned HTTP ${response.status}.`, 502, code);
  }

  let rows: unknown;
  try {
    rows = JSON.parse(await readBoundedBody(response)) as unknown;
  } catch (error) {
    if (error instanceof CertificateHistoryError) throw error;
    throw new CertificateHistoryError('crt.sh returned data that could not be parsed as JSON.', 502, 'CT_INVALID_RESPONSE');
  }
  if (!Array.isArray(rows)) throw new CertificateHistoryError('crt.sh returned an unexpected response format.', 502, 'CT_INVALID_RESPONSE');

  const recordsById = new Map<string, CertificateHistoryRecord>();
  for (const row of rows) {
    const record = normalizeHistoryRow(row);
    if (record) recordsById.set(record.id, record);
  }
  const records = [...recordsById.values()]
    .sort((left, right) => (right.loggedAt || right.notBefore || '').localeCompare(left.loggedAt || left.notBefore || ''))
    .slice(0, MAX_HISTORY_RECORDS);

  return {
    domain: target.host,
    sourceUrl: source.toString(),
    checkedAt: new Date().toISOString(),
    records,
  };
};

