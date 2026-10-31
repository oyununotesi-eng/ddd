import assert from 'node:assert/strict';
import test from 'node:test';
import { CertificateHistoryError, fetchCertificateHistory, normalizeHistoryRow } from './certificateHistory';

test('maps crt.sh fields and parses newline-delimited DNS names', () => {
  assert.deepEqual(normalizeHistoryRow({
    id: 12345,
    common_name: 'api.example.com',
    name_value: 'api.example.com\nexample.com\napi.example.com',
    issuer_name: 'Example Test CA',
    not_before: '2025-01-01T00:00:00',
    not_after: '2026-01-01T00:00:00',
    entry_timestamp: '2025-01-01T00:01:00',
    serial_number: 'ABC123',
  }), {
    id: '12345',
    commonName: 'api.example.com',
    names: ['api.example.com', 'example.com'],
    issuer: 'Example Test CA',
    notBefore: '2025-01-01T00:00:00',
    notAfter: '2026-01-01T00:00:00',
    loggedAt: '2025-01-01T00:01:00',
    serialNumber: 'ABC123',
  });
  assert.equal(normalizeHistoryRow({ common_name: 'missing id' }), null);
});

test('fetches CT data only from crt.sh and sorts newest logs first', async () => {
  let requestedUrl = '';
  const responseRows = [
    { id: 10, common_name: 'older.example.com', entry_timestamp: '2025-01-01', name_value: 'older.example.com' },
    { id: 11, common_name: 'newer.example.com', entry_timestamp: '2026-01-01', name_value: 'newer.example.com' },
  ];
  const result = await fetchCertificateHistory('example.com', async (input) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify(responseRows), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  assert.match(requestedUrl, /^https:\/\/crt\.sh\//);
  assert.equal(new URL(requestedUrl).searchParams.get('q'), 'example.com');
  assert.deepEqual(result.records.map((record) => record.id), ['11', '10']);
  assert.equal(result.domain, 'example.com');
});

test('reports Certificate Transparency rate limits as a clear error', async () => {
  await assert.rejects(
    fetchCertificateHistory('example.com', async () => new Response('rate limited', { status: 429 })),
    (error: unknown) => error instanceof CertificateHistoryError && error.code === 'CT_RATE_LIMITED',
  );
});

test('does not accept an IP address for CT history', async () => {
  await assert.rejects(
    fetchCertificateHistory('8.8.8.8', async () => new Response('[]')),
    (error: unknown) => error instanceof CertificateHistoryError && error.code === 'DOMAIN_REQUIRED',
  );
});
