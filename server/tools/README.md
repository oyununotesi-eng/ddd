# SSL/TLS checker scope and security

- `POST /api/tools/ssl-check` accepts HTTPS URLs or hostnames on port 443 only. URLs with credentials, malformed names, local/special-use names, and non-public IP addresses are rejected.
- Hostnames are resolved once. Every A/AAAA answer must be public, and the TLS socket connects to one of those exact validated IPs while preserving SNI and hostname verification. Redirects are not followed because the checker does not make an HTTP request to the target.
- TLS uses Node.js strict certificate verification with TLS 1.2 or newer. If strict verification fails for a certificate error, a second diagnostic-only handshake may read the server-presented certificate. The diagnostic result is never marked verified or valid; the original verification error remains visible.
- The backend limits TLS handshakes to 8 seconds each, DNS lookup to 4 seconds, three concurrent live checks, twelve combined certificate requests per client per minute, and JSON request bodies to 4 KB. Live checks accept only port 443.
- Certificate Transparency history is fetched only from the fixed `https://crt.sh/` source. Redirects are rejected, the fetch times out after 8 seconds, the response is limited to 2 MB, and at most 100 records are returned. CT entries indicate logged certificates and do not represent the current live endpoint certificate.
- SHA-256 fingerprints are computed from the leaf certificate DER bytes. Node's public TLS/X.509 metadata does not expose the certificate signature algorithm on this runtime, so the UI reports it as unavailable. The certificate chain contains only certificates actually returned by the peer.
- The backend does not persist or log target hosts, certificate details, or request bodies. The current app server listens on loopback as configured in `server/index.ts`.

The checker intentionally does not probe internal services and does not support uploaded certificate files or non-443 TLS endpoints. A separate authenticated, explicitly configured internal-check mode would be needed for private infrastructure.
