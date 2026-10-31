import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import {
  calculateCertificateFingerprint,
  isPublicIpAddress,
  parseSslTarget,
  parseSubjectAltNames,
  SslTargetError,
  validateResolvedAddresses,
} from './sslCertificate';

test('accepts domain and HTTPS URL forms and normalizes the destination', () => {
  assert.deepEqual(parseSslTarget('example.com'), { host: 'example.com', port: 443, protocol: 'https:', isIpAddress: false });
  assert.deepEqual(parseSslTarget('https://api.example.com:443/path?view=cert'), { host: 'api.example.com', port: 443, protocol: 'https:', isIpAddress: false });
  assert.deepEqual(parseSslTarget('https://8.8.8.8'), { host: '8.8.8.8', port: 443, protocol: 'https:', isIpAddress: true });
});

test('rejects protocols, ports, credentials, malformed targets, and private literals', () => {
  const invalidTargets = [
    ['http://example.com', 'UNSUPPORTED_PROTOCOL'],
    ['ftp://example.com', 'UNSUPPORTED_PROTOCOL'],
    ['https://example.com:8443', 'UNSUPPORTED_PORT'],
    ['https://user:secret@example.com', 'INVALID_TARGET'],
    ['not a valid host', 'INVALID_TARGET'],
    ['localhost', 'INVALID_HOSTNAME'],
    ['https://127.0.0.1', 'TARGET_BLOCKED'],
    ['https://[::1]', 'TARGET_BLOCKED'],
  ] as const;
  for (const [target, expectedCode] of invalidTargets) {
    assert.throws(() => parseSslTarget(target), (error: unknown) => error instanceof SslTargetError && error.code === expectedCode, target);
  }
});

test('allows public addresses and blocks private, loopback, link-local, reserved, and documentation ranges', () => {
  for (const address of ['8.8.8.8', '1.1.1.1', '2001:4860:4860::8888']) assert.equal(isPublicIpAddress(address), true, address);
  for (const address of [
    '0.1.2.3', '10.1.2.3', '100.64.0.1', '127.1.2.3', '169.254.1.1', '172.20.1.1',
    '192.168.1.2', '198.18.0.1', '203.0.113.9', '224.0.0.1', '::', '::1', 'fc00::1',
    'fe80::1', '::ffff:127.0.0.1', '2001:db8::1', '2002:7f00:1::', '3fff::1',
  ]) assert.equal(isPublicIpAddress(address), false, address);
});

test('rejects a DNS answer set containing even one non-public address', () => {
  assert.throws(
    () => validateResolvedAddresses([{ address: '93.184.216.34', family: 4 }, { address: '10.0.0.12', family: 4 }]),
    (error: unknown) => error instanceof SslTargetError && error.code === 'TARGET_BLOCKED',
  );
  assert.throws(
    () => validateResolvedAddresses([{ address: '93.184.216.34', family: 6 }]),
    (error: unknown) => error instanceof SslTargetError && error.code === 'TARGET_BLOCKED',
  );
  assert.doesNotThrow(() => validateResolvedAddresses([{ address: '93.184.216.34', family: 4 }]));
});

test('parses quoted SAN values without splitting commas inside the quoted name', () => {
  assert.deepEqual(parseSubjectAltNames('DNS:example.com, DNS:"service,blue.example.com", IP Address:203.0.113.4'), [
    'DNS: example.com',
    'DNS: service,blue.example.com',
    'IP Address: 203.0.113.4',
  ]);
});

test('calculates a colon-separated SHA-256 certificate fingerprint', () => {
  const bytes = Buffer.from('certificate fixture');
  const expected = createHash('sha256').update(bytes).digest('hex').toUpperCase().match(/.{2}/g)!.join(':');
  assert.equal(calculateCertificateFingerprint(bytes), expected);
  assert.match(calculateCertificateFingerprint(bytes), /^(?:[\dA-F]{2}:){31}[\dA-F]{2}$/);
});
