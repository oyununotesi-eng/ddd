import { lookup } from 'node:dns/promises';
import { createHash, X509Certificate } from 'node:crypto';
import { isIP } from 'node:net';
import { checkServerIdentity, connect as tlsConnect, type DetailedPeerCertificate, type PeerCertificate, type TLSSocket } from 'node:tls';
import type { CertificateChainEntry, CertificateDetails, SSLCheckResponse, SSLCheckStatus } from '../../src/types';

const TLS_TIMEOUT_MS = 8_000;
const DNS_TIMEOUT_MS = 4_000;
const MAX_DNS_ADDRESSES = 16;
const EXPIRING_SOON_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1_000;

export class SslTargetError extends Error {
  constructor(message: string, readonly statusCode: number, readonly code: string) {
    super(message);
    this.name = 'SslTargetError';
  }
}

export interface NormalizedSslTarget {
  host: string;
  port: 443;
  protocol: 'https:';
  isIpAddress: boolean;
}

const ipv4ToBigInt = (address: string): bigint | null => {
  const parts = address.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) return null;
  return parts.reduce((value, part) => (value << 8n) | BigInt(Number(part)), 0n);
};

const isInIpv4Cidr = (address: string, network: string, prefix: number): boolean => {
  const ip = ipv4ToBigInt(address);
  const base = ipv4ToBigInt(network);
  if (ip === null || base === null) return false;
  const shift = BigInt(32 - prefix);
  return (ip >> shift) === (base >> shift);
};

const ipv6ToBigInt = (input: string): bigint | null => {
  let address = input.toLowerCase().split('%')[0];
  if (!address || (address.match(/::/g) || []).length > 1) return null;

  const embeddedIpv4 = address.match(/(?:^|:)(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (embeddedIpv4) {
    const v4 = ipv4ToBigInt(embeddedIpv4[1]);
    if (v4 === null) return null;
    const replacement = `${(v4 >> 16n).toString(16)}:${(v4 & 0xffffn).toString(16)}`;
    address = address.slice(0, address.length - embeddedIpv4[1].length) + replacement;
  }

  const hasCompression = address.includes('::');
  const [leftText, rightText = ''] = address.split('::');
  const left = leftText ? leftText.split(':') : [];
  const right = rightText ? rightText.split(':') : [];
  const missing = 8 - left.length - right.length;
  if ((!hasCompression && missing !== 0) || (hasCompression && missing < 1)) return null;
  const words = [...left, ...(hasCompression ? Array(missing).fill('0') : []), ...right];
  if (words.length !== 8 || words.some((word) => !/^[0-9a-f]{1,4}$/.test(word))) return null;
  return words.reduce((value, word) => (value << 16n) | BigInt(`0x${word}`), 0n);
};

const isInIpv6Cidr = (address: bigint, network: string, prefix: number): boolean => {
  const base = ipv6ToBigInt(network);
  if (base === null) return false;
  const shift = BigInt(128 - prefix);
  return (address >> shift) === (base >> shift);
};

export const isPublicIpAddress = (address: string): boolean => {
  const family = isIP(address);
  if (family === 4) {
    const blockedRanges: Array<[string, number]> = [
      ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
      ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
      ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
      ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
    ];
    return !blockedRanges.some(([network, prefix]) => isInIpv4Cidr(address, network, prefix));
  }

  if (family === 6) {
    const value = ipv6ToBigInt(address);
    if (value === null) return false;
    // Only permit global-unicast space, excluding special-purpose and documentation ranges.
    const inGlobalUnicast = (value >> 125n) === 1n; // 2000::/3
    const reserved = ([
      ['2001::', 23], // protocol assignments, benchmarking and other special-purpose ranges
      ['2001:db8::', 32], // documentation
      ['2002::', 16], // 6to4 embeds an IPv4 destination
      ['3fff::', 20], // documentation
    ] as Array<[string, number]>).some(([network, prefix]) => isInIpv6Cidr(value, network, prefix));
    return inGlobalUnicast && !reserved;
  }
  return false;
};

const isValidDnsName = (host: string): boolean => {
  const name = host.endsWith('.') ? host.slice(0, -1) : host;
  if (!name || name.length > 253 || !name.includes('.')) return false;
  const labels = name.split('.');
  if (labels.some((label) => label.length < 1 || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label))) return false;
  const blockedSuffixes = ['localhost', 'local', 'internal', 'test', 'invalid', 'example', 'home', 'lan', 'corp', 'onion', 'arpa'];
  return !blockedSuffixes.some((suffix) => name.toLowerCase() === suffix || name.toLowerCase().endsWith(`.${suffix}`));
};

export const parseSslTarget = (input: unknown): NormalizedSslTarget => {
  if (typeof input !== 'string' || !input.trim()) {
    throw new SslTargetError('Enter a domain or an HTTPS URL.', 400, 'INVALID_TARGET');
  }
  const raw = input.trim();
  if (raw.length > 2_048 || /[\u0000-\u001f\u007f]/.test(raw)) {
    throw new SslTargetError('The target is too long or contains invalid characters.', 400, 'INVALID_TARGET');
  }

  let candidate = raw;
  if (!raw.includes('://')) {
    candidate = isIP(raw) === 6 ? `https://[${raw}]` : `https://${raw}`;
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new SslTargetError('Enter a valid domain or HTTPS URL.', 400, 'INVALID_TARGET');
  }
  if (url.protocol !== 'https:') {
    throw new SslTargetError('Only HTTPS/TLS targets are supported.', 400, 'UNSUPPORTED_PROTOCOL');
  }
  if (url.username || url.password) {
    throw new SslTargetError('URLs containing usernames or passwords are not accepted.', 400, 'INVALID_TARGET');
  }
  if (url.port && url.port !== '443') {
    throw new SslTargetError('Only port 443 is allowed for public TLS checks.', 400, 'UNSUPPORTED_PORT');
  }

  const host = url.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase();
  const family = isIP(host);
  if (!family && !isValidDnsName(host)) {
    throw new SslTargetError('Enter a fully qualified public domain name.', 400, 'INVALID_HOSTNAME');
  }
  if (family && !isPublicIpAddress(host)) {
    throw new SslTargetError('Private, loopback, link-local, reserved, and non-public IP addresses are blocked.', 403, 'TARGET_BLOCKED');
  }

  return { host, port: 443, protocol: 'https:', isIpAddress: Boolean(family) };
};

export const resolvePublicAddresses = async (host: string): Promise<Array<{ address: string; family: number }>> => {
  if (isIP(host)) return [{ address: host, family: isIP(host) }];
  let addresses: Array<{ address: string; family: number }>;
  try {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      addresses = await Promise.race([
        // A final dot forces an absolute DNS lookup and avoids resolver search-suffix expansion.
        lookup(`${host}.`, { all: true, verbatim: true }),
        new Promise<never>((_resolve, reject) => {
          timeout = setTimeout(() => reject(Object.assign(new Error('DNS lookup timed out.'), { code: 'DNS_TIMEOUT' })), DNS_TIMEOUT_MS);
        }),
      ]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : 'DNS_LOOKUP_FAILED';
    if (code === 'DNS_TIMEOUT') throw new SslTargetError('DNS lookup timed out.', 504, code);
    throw new SslTargetError(code === 'ENOTFOUND' ? 'The domain could not be resolved.' : 'DNS lookup failed for this domain.', 502, code);
  }
  validateResolvedAddresses(addresses);
  return addresses;
};

export const validateResolvedAddresses = (addresses: Array<{ address: string; family: number }>): void => {
  if (!addresses.length || addresses.length > MAX_DNS_ADDRESSES) {
    throw new SslTargetError('The domain did not return a usable public address.', 502, 'DNS_LOOKUP_FAILED');
  }
  if (addresses.some(({ address, family }) => isIP(address) !== family || !isPublicIpAddress(address))) {
    throw new SslTargetError('The domain resolves to a non-public address; the request was blocked.', 403, 'TARGET_BLOCKED');
  }
};

interface ProbeOutcome {
  peer: DetailedPeerCertificate | PeerCertificate | null;
  handshakeEstablished: boolean;
  verificationPassed: boolean;
  protocol: string | null;
  cipher: string | null;
  error: { code: string; message: string } | null;
}

const shortErrorMessage = (code: string, message: string): string => {
  if (code === 'ENOTFOUND') return 'The domain could not be resolved.';
  if (code === 'ECONNREFUSED') return 'The server refused the connection on port 443.';
  if (code === 'ETIMEDOUT' || code === 'TLS_TIMEOUT') return 'The TLS connection timed out.';
  if (code === 'ECONNRESET') return 'The server closed the connection unexpectedly.';
  if (code === 'ERR_TLS_CERT_ALTNAME_INVALID') return 'The certificate does not match the requested hostname.';
  if (code === 'CERT_HAS_EXPIRED') return 'The certificate has expired.';
  if (code === 'CERT_NOT_YET_VALID') return 'The certificate is not valid yet.';
  if (code === 'DEPTH_ZERO_SELF_SIGNED_CERT' || code === 'SELF_SIGNED_CERT_IN_CHAIN') return 'The certificate is self-signed or its issuer is not trusted.';
  if (code.startsWith('UNABLE_TO_') || code === 'CERT_UNTRUSTED') return 'The certificate chain could not be verified.';
  return message.slice(0, 240) || 'A TLS connection error occurred.';
};

const probeTls = (target: NormalizedSslTarget, address: string, rejectUnauthorized: boolean): Promise<ProbeOutcome> =>
  new Promise((resolve) => {
    let finished = false;
    const socket: TLSSocket = tlsConnect({
      host: address,
      port: target.port,
      ...(target.isIpAddress ? {} : { servername: target.host }),
      rejectUnauthorized,
      minVersion: 'TLSv1.2',
    });

    const finish = (error?: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      let peer: DetailedPeerCertificate | PeerCertificate | null = null;
      try {
        const candidate = socket.getPeerCertificate(true);
        if (candidate && candidate.raw?.length) peer = candidate;
      } catch { /* The TLS peer did not provide a parseable certificate. */ }
      const socketError = error || (socket.authorizationError ? new Error(String(socket.authorizationError)) : null);
      const code = socketError && 'code' in socketError && socketError.code ? String(socketError.code) : 'TLS_ERROR';
      let cipher: string | null = null;
      try { cipher = socket.getCipher()?.standardName || socket.getCipher()?.name || null; } catch { /* handshake did not negotiate a cipher */ }
      const outcome: ProbeOutcome = {
        peer,
        handshakeEstablished: !error && Boolean(socket.getProtocol()),
        verificationPassed: Boolean(socket.authorized),
        protocol: socket.getProtocol() || null,
        cipher,
        error: socket.authorized ? null : socketError ? { code, message: shortErrorMessage(code, socketError.message) } : null,
      };
      socket.destroy();
      resolve(outcome);
    };

    const timer = setTimeout(() => {
      const timeout = Object.assign(new Error('TLS connection timed out.'), { code: 'TLS_TIMEOUT' });
      socket.destroy(timeout);
    }, TLS_TIMEOUT_MS);
    socket.once('secureConnect', () => finish());
    socket.once('error', (error) => finish(error));
  });

export const parseSubjectAltNames = (value?: string): string[] => {
  if (!value) return [];
  const entries: string[] = [];
  let current = '';
  let quoted = false;
  let escaped = false;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (escaped) { current += character; escaped = false; continue; }
    if (character === '\\' && quoted) { current += character; escaped = true; continue; }
    if (character === '"') { quoted = !quoted; current += character; continue; }
    if (character === ',' && !quoted && /^\s*(?:DNS|IP Address|email|URI|RID|othername|DirName|Registered ID):/i.test(value.slice(index + 1))) {
      entries.push(current.trim());
      current = '';
      continue;
    }
    current += character;
  }
  if (current.trim()) entries.push(current.trim());
  return entries.map((entry) => {
    const colon = entry.indexOf(':');
    if (colon < 0) return entry;
    const kind = entry.slice(0, colon);
    let name = entry.slice(colon + 1).trim();
    if (name.startsWith('"')) {
      try { name = JSON.parse(name) as string; } catch { /* Keep the original SAN text if it is not JSON-quoted. */ }
    }
    return `${kind}: ${name}`;
  });
};

export const calculateCertificateFingerprint = (raw: Uint8Array) => createHash('sha256').update(raw).digest('hex').toUpperCase().match(/.{2}/g)?.join(':') || '';

const fingerprint = calculateCertificateFingerprint;

const chainEntry = (peer: PeerCertificate): CertificateChainEntry => {
  const x509 = new X509Certificate(peer.raw);
  return {
    subject: x509.subject,
    issuer: x509.issuer,
    serialNumber: x509.serialNumber,
    validFrom: x509.validFrom,
    validTo: x509.validTo,
    fingerprintSha256: fingerprint(peer.raw),
  };
};

const readCertificate = (peer: DetailedPeerCertificate | PeerCertificate): CertificateDetails => {
  const leaf = new X509Certificate(peer.raw);
  const publicKey = leaf.publicKey;
  const chain: CertificateChainEntry[] = [];
  const seen = new Set<string>();
  let current: DetailedPeerCertificate | PeerCertificate | undefined = peer;
  for (let depth = 0; current && depth < 10; depth += 1) {
    let entry: CertificateChainEntry;
    try { entry = chainEntry(current); } catch { break; }
    if (seen.has(entry.fingerprintSha256)) break;
    seen.add(entry.fingerprintSha256);
    chain.push(entry);
    const issuer: DetailedPeerCertificate | undefined = (current as DetailedPeerCertificate).issuerCertificate;
    if (!issuer || issuer === current) break;
    current = issuer;
  }

  return {
    subject: leaf.subject,
    issuer: leaf.issuer,
    serialNumber: leaf.serialNumber,
    validFrom: leaf.validFrom,
    validTo: leaf.validTo,
    subjectAltNames: parseSubjectAltNames(leaf.subjectAltName),
    fingerprintSha256: fingerprint(peer.raw),
    // Node's public X509 metadata does not expose the certificate signature algorithm.
    signatureAlgorithm: null,
    publicKeyAlgorithm: publicKey.asymmetricKeyType || null,
    publicKeySizeBits: publicKey.asymmetricKeyDetails?.modulusLength ?? null,
    publicKeyCurve: publicKey.asymmetricKeyDetails?.namedCurve || null,
    chain,
  };
};

const createConnectionError = (target: NormalizedSslTarget, code: string, message: string): SSLCheckResponse => ({
  target: { host: target.host, port: target.port, protocol: target.protocol },
  checkedAt: new Date().toISOString(),
  status: 'Connection Error',
  tls: { handshakeEstablished: false, verificationPassed: false, protocol: null, cipher: null },
  checks: {
    hostnameMatches: null,
    hostnameMessage: 'No certificate was available to check the hostname.',
    chainTrusted: null,
    chainMessage: 'No certificate chain was available to verify.',
    validityPassed: null,
    validityMessage: 'No certificate was available to check its validity period.',
    daysUntilExpiry: null,
  },
  certificate: null,
  error: { code, message },
});

const certificateErrorCodes = new Set([
  'ERR_TLS_CERT_ALTNAME_INVALID', 'CERT_HAS_EXPIRED', 'CERT_NOT_YET_VALID', 'CERT_UNTRUSTED',
  'DEPTH_ZERO_SELF_SIGNED_CERT', 'SELF_SIGNED_CERT_IN_CHAIN', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'UNABLE_TO_GET_ISSUER_CERT', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'UNABLE_TO_GET_CRL',
]);

export const inspectSslTarget = async (input: unknown): Promise<SSLCheckResponse> => {
  const target = parseSslTarget(input);
  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = await resolvePublicAddresses(target.host);
  } catch (error) {
    if (error instanceof SslTargetError && error.statusCode === 403) throw error;
    const sslError = error instanceof SslTargetError ? error : new SslTargetError('DNS lookup failed.', 502, 'DNS_LOOKUP_FAILED');
    return createConnectionError(target, sslError.code, sslError.message);
  }

  // Every DNS answer is checked above, then the TCP/TLS connection is pinned to this exact IP.
  const pinnedAddress = addresses[0].address;
  const strictProbe = await probeTls(target, pinnedAddress, true);
  let observedProbe = strictProbe;
  if (!strictProbe.verificationPassed && strictProbe.error && certificateErrorCodes.has(strictProbe.error.code)) {
    // Diagnostic-only handshake to inspect the presented certificate after strict verification failed.
    // Its result never changes verificationPassed or produces a Valid/Expiring Soon status.
    const diagnosticProbe = await probeTls(target, pinnedAddress, false);
    if (diagnosticProbe.peer) observedProbe = diagnosticProbe;
  }

  const peer = observedProbe.peer || strictProbe.peer;
  if (!peer?.raw?.length) {
    const error = strictProbe.error || observedProbe.error;
    return createConnectionError(target, error?.code || 'TLS_CONNECTION_FAILED', error?.message || 'A TLS connection could not be established.');
  }

  let certificate: CertificateDetails;
  try {
    certificate = readCertificate(peer);
  } catch {
    return createConnectionError(target, 'CERTIFICATE_PARSE_FAILED', 'The server sent a certificate that could not be parsed.');
  }

  const identityError = checkServerIdentity(target.host, peer);
  const hostnameMatches = !identityError;
  const from = Date.parse(certificate.validFrom);
  const until = Date.parse(certificate.validTo);
  const now = Date.now();
  const validityPassed = Number.isFinite(from) && Number.isFinite(until) && from <= now && now <= until;
  const daysUntilExpiry = Number.isFinite(until) ? Math.ceil((until - now) / DAY_MS) : null;
  const strictErrorCode = strictProbe.error?.code || '';
  const chainTrusted = strictProbe.verificationPassed || strictErrorCode === 'ERR_TLS_CERT_ALTNAME_INVALID'
    ? true
    : certificateErrorCodes.has(strictErrorCode) ? false : null;
  const isExpired = Number.isFinite(until) && until < now;
  let status: SSLCheckStatus = 'Valid';
  if (isExpired) status = 'Expired';
  else if (!hostnameMatches) status = 'Hostname Mismatch';
  else if (chainTrusted !== true || !validityPassed) status = 'Untrusted / Chain Error';
  else if (daysUntilExpiry !== null && daysUntilExpiry <= EXPIRING_SOON_DAYS) status = 'Expiring Soon';

  const verificationMessage = strictProbe.verificationPassed
    ? 'The certificate chain and hostname passed Node.js TLS verification.'
    : strictProbe.error?.message || 'Strict TLS certificate verification did not pass.';
  const validityMessage = !Number.isFinite(from) || !Number.isFinite(until)
    ? 'The certificate validity dates could not be parsed.'
    : now < from ? `The certificate is not valid before ${certificate.validFrom}.`
      : now > until ? `The certificate expired on ${certificate.validTo}.`
        : `Valid through ${certificate.validTo}.`;

  return {
    target: { host: target.host, port: target.port, protocol: target.protocol },
    checkedAt: new Date().toISOString(),
    status,
    tls: {
      handshakeEstablished: observedProbe.handshakeEstablished || strictProbe.handshakeEstablished,
      verificationPassed: strictProbe.verificationPassed,
      protocol: observedProbe.protocol || strictProbe.protocol,
      cipher: observedProbe.cipher || strictProbe.cipher,
    },
    checks: {
      hostnameMatches,
      hostnameMessage: hostnameMatches ? 'Certificate identity matches this host.' : identityError?.message || 'The certificate does not match this host.',
      chainTrusted,
      chainMessage: verificationMessage,
      validityPassed,
      validityMessage,
      daysUntilExpiry,
    },
    certificate,
    error: strictProbe.error,
  };
};

