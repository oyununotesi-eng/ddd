import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Check,
  CircleAlert,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileBadge,
  Fingerprint,
  History,
  LoaderCircle,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import type { CertificateHistoryRecord, CertificateHistoryResponse, SSLCheckResponse } from '../../types';

type CheckerTab = 'live' | 'details' | 'history';
type PreviewTarget = { host: string; port: number; error?: string } | null;

const getTargetPreview = (value: string): PreviewTarget => {
  const input = value.trim();
  if (!input) return null;
  try {
    const url = new URL(input.includes('://') ? input : `https://${input}`);
    if (url.protocol !== 'https:') return { host: '', port: 0, error: 'Only HTTPS/TLS is supported.' };
    if (url.username || url.password) return { host: '', port: 0, error: 'URLs with credentials are not accepted.' };
    const port = Number(url.port || 443);
    if (port !== 443) return { host: url.hostname, port, error: 'Only public HTTPS port 443 is currently allowed.' };
    return { host: url.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, ''), port };
  } catch {
    return { host: '', port: 0, error: 'Enter a valid domain or HTTPS URL.' };
  }
};

const normalizeFingerprint = (value: string): string | null => {
  if (!/^[\da-f:\s-]+$/i.test(value.trim())) return null;
  const normalized = value.replace(/[:\s-]/g, '').toUpperCase();
  return /^[\dA-F]{64}$/.test(normalized) ? normalized : null;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return 'Not provided by source';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const statusStyle: Record<SSLCheckResponse['status'], string> = {
  Valid: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  'Expiring Soon': 'border-amber-200 bg-amber-50 text-amber-800',
  Expired: 'border-rose-200 bg-rose-50 text-rose-800',
  'Hostname Mismatch': 'border-rose-200 bg-rose-50 text-rose-800',
  'Untrusted / Chain Error': 'border-rose-200 bg-rose-50 text-rose-800',
  'Connection Error': 'border-slate-200 bg-slate-100 text-slate-700',
};

const StatusIcon: React.FC<{ status: SSLCheckResponse['status']; className?: string }> = ({ status, className = 'h-4 w-4' }) => {
  if (status === 'Valid') return <BadgeCheck className={className} />;
  if (status === 'Expiring Soon') return <Clock3 className={className} />;
  if (status === 'Connection Error') return <CircleAlert className={className} />;
  return <XCircle className={className} />;
};

const VerificationRow: React.FC<{ label: string; passed: boolean | null; message: string }> = ({ label, passed, message }) => (
  <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0">
    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${passed === true ? 'bg-emerald-100 text-emerald-700' : passed === false ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
      {passed === true ? <Check className="h-3 w-3" /> : passed === false ? <XCircle className="h-3 w-3" /> : <span className="text-xs">—</span>}
    </span>
    <div className="min-w-0"><p className="text-xs font-bold text-slate-800">{label}</p><p className="mt-0.5 break-words text-[11px] leading-relaxed text-slate-500">{message}</p></div>
  </div>
);

const HistoryCard: React.FC<{ record: CertificateHistoryRecord }> = ({ record }) => (
  <details className="group rounded-xl border border-slate-200 bg-white">
    <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3 p-4 marker:hidden">
      <span className="min-w-0 flex-1"><span className="block break-words text-sm font-bold text-slate-900">{record.commonName}</span><span className="mt-1 block break-all font-mono text-[10px] text-slate-500">{record.names.slice(0, 3).join(' · ') || 'Names unavailable'}</span></span>
      <span className="shrink-0 text-right"><span className="block text-[10px] font-semibold text-slate-600">Logged {formatDate(record.loggedAt)}</span><span className="mt-1 block text-[10px] text-slate-400">CT entry #{record.id}</span></span>
    </summary>
    <div className="grid grid-cols-1 gap-x-5 gap-y-3 border-t border-slate-100 bg-slate-50/70 p-4 text-[11px] sm:grid-cols-2">
      <div><span className="block font-bold text-slate-500">Issuer</span><span className="mt-1 block break-words text-slate-700">{record.issuer}</span></div>
      <div><span className="block font-bold text-slate-500">Serial number</span><code className="mt-1 block break-all text-slate-700">{record.serialNumber}</code></div>
      <div><span className="block font-bold text-slate-500">Not before</span><span className="mt-1 block text-slate-700">{formatDate(record.notBefore)}</span></div>
      <div><span className="block font-bold text-slate-500">Not after</span><span className="mt-1 block text-slate-700">{formatDate(record.notAfter)}</span></div>
      <div className="sm:col-span-2"><span className="block font-bold text-slate-500">DNS names / SAN</span><span className="mt-1 block break-all font-mono text-slate-700">{record.names.join(', ') || 'Not provided by source'}</span></div>
      <p className="sm:col-span-2 text-[10px] text-slate-500">SHA-256 fingerprint is not included in this crt.sh response.</p>
    </div>
  </details>
);

export const SSLCertificateCheckerPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [targetInput, setTargetInput] = useState('');
  const [tab, setTab] = useState<CheckerTab>('live');
  const [result, setResult] = useState<SSLCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [notice, setNotice] = useState('');
  const [fingerprintA, setFingerprintA] = useState('');
  const [fingerprintB, setFingerprintB] = useState('');
  const [history, setHistory] = useState<CertificateHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyFilter, setHistoryFilter] = useState('');
  const [historySort, setHistorySort] = useState<'loggedAt' | 'notAfter'>('loggedAt');

  const preview = useMemo(() => getTargetPreview(targetInput), [targetInput]);
  const filteredHistory = useMemo(() => {
    if (!history) return [];
    const query = historyFilter.trim().toLowerCase();
    return [...history.records]
      .filter((record) => !query || [record.commonName, record.issuer, ...record.names].join(' ').toLowerCase().includes(query))
      .sort((left, right) => (right[historySort] || '').localeCompare(left[historySort] || ''));
  }, [history, historyFilter, historySort]);
  const validFingerprintA = normalizeFingerprint(fingerprintA);
  const validFingerprintB = normalizeFingerprint(fingerprintB);
  const fingerprintsMatch = validFingerprintA && validFingerprintB ? validFingerprintA === validFingerprintB : null;

  const apiErrorMessage = async (response: Response) => {
    const apiUnavailableMessage = 'The Workspace API could not be reached. Restart the app with `npm run dev` so the backend starts with the UI.';
    if (response.status === 404) {
      return 'The SSL Checker API route was not found. Restart the app with `npm run dev` to start the current backend.';
    }
    try {
      const payload = await response.json() as { error?: { message?: string } };
      return payload.error?.message || (response.status === 502 ? apiUnavailableMessage : `Request failed with HTTP ${response.status}.`);
    } catch {
      return response.status === 502 ? apiUnavailableMessage : `Request failed with HTTP ${response.status}.`;
    }
  };

  const checkCertificate = async (event: React.FormEvent) => {
    event.preventDefault();
    setTab('live');
    setResult(null);
    setFingerprintA('');
    setRequestError('');
    setNotice('');
    setLoading(true);
    try {
      const response = await fetch('/api/tools/ssl-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetInput }),
      });
      if (!response.ok) throw new Error(await apiErrorMessage(response));
      const data = await response.json() as SSLCheckResponse;
      setResult(data);
      if (data.certificate?.fingerprintSha256) setFingerprintA(data.certificate.fingerprintSha256);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'The certificate check could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!preview?.host || preview.error) {
      setHistoryError(preview?.error || 'Enter a public domain before searching certificate history.');
      return;
    }
    setHistory(null);
    setHistoryError('');
    setHistoryLoading(true);
    try {
      const response = await fetch('/api/tools/certificate-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: preview.host }),
      });
      if (!response.ok) throw new Error(await apiErrorMessage(response));
      setHistory(await response.json() as CertificateHistoryResponse);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Certificate Transparency history could not be loaded.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const copyText = async (text: string, label: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      setNotice(`${label} copied to clipboard.`);
    } catch {
      setNotice('Clipboard access failed. Select and copy the value manually.');
    }
  };

  const downloadJson = (value: unknown, fileName: string, label: string) => {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
    setNotice(`${label} JSON downloaded.`);
  };

  const tabs: { id: CheckerTab; label: string; icon: React.ElementType }[] = [
    { id: 'live', label: 'Live SSL Check', icon: ShieldCheck },
    { id: 'details', label: 'Certificate Details', icon: FileBadge },
    { id: 'history', label: 'Certificate History', icon: History },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button type="button" onClick={onBack} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-xs hover:border-slate-300 hover:text-slate-900"><ArrowLeft className="h-4 w-4" />Tools</button>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700"><ShieldCheck className="h-6 w-6" /></span>
          <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-rose-700">Security &amp; Cryptography</p><h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">SSL/TLS Certificate Checker</h1><p className="mt-1 max-w-2xl text-xs text-slate-500">Inspect a public HTTPS certificate, compare SHA-256 fingerprints, and search Certificate Transparency history.</p></div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500"><LockKeyholeIcon />Server-verified · public port 443 only</span>
      </header>

      <form onSubmit={(event) => void checkCertificate(event)} className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1"><label htmlFor="ssl-target" className="mb-1.5 block text-xs font-bold text-slate-700">Domain or HTTPS URL</label><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="ssl-target" value={targetInput} onChange={(event) => { setTargetInput(event.target.value); setRequestError(''); setNotice(''); }} placeholder="example.com or https://api.example.com" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" /></div>
            {preview && <p className={`mt-2 text-[11px] ${preview.error ? 'text-rose-700' : 'text-slate-500'}`}>{preview.error ? preview.error : <>Check target: <code className="font-semibold text-slate-700">https://{preview.host}:{preview.port}</code>. Private and non-public addresses are blocked by the backend.</>}</p>}
          </div>
          <button type="submit" disabled={loading || !targetInput.trim()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-xs font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}{loading ? 'Checking certificate…' : 'Check Certificate'}</button>
        </div>
        {requestError && <div role="alert" className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{requestError}</div>}
      </form>

      <nav aria-label="Certificate views" className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">{tabs.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} onClick={() => setTab(item.id)} aria-current={tab === item.id ? 'page' : undefined} className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition-colors sm:px-4 ${tab === item.id ? 'border-rose-600 text-rose-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</nav>

      {tab === 'live' && <div className="space-y-4">
        {!result && !loading && !requestError && <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 text-sm font-bold text-slate-700">No live check yet</h2><p className="mt-1 text-xs text-slate-500">Enter a public HTTPS domain above. Results only appear after the backend performs a real TLS connection.</p></div>}
        {loading && <div role="status" className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-14 text-sm font-semibold text-slate-600"><LoaderCircle className="h-5 w-5 animate-spin text-rose-600" />Resolving the public address and validating the TLS certificate…</div>}
        {result && <>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live endpoint</p><h2 className="mt-1 break-all font-mono text-sm font-bold text-slate-900">https://{result.target.host}:{result.target.port}</h2><p className="mt-1 text-[10px] text-slate-400">Checked {formatDate(result.checkedAt)}</p></div><div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${statusStyle[result.status]}`}><StatusIcon status={result.status} />{result.status}</div></div>
            {result.status === 'Expiring Soon' && <p className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800"><CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />Certificate expires in {result.checks.daysUntilExpiry} days. Plan renewal before the expiry date.</p>}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4"><div className="mb-1 flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${result.tls.handshakeEstablished ? 'bg-emerald-500' : 'bg-rose-500'}`} /><h3 className="text-xs font-bold text-slate-800">TLS connection</h3></div><p className="text-[11px] text-slate-600">{result.tls.handshakeEstablished ? `Handshake established${result.tls.verificationPassed ? ' and verified' : '; certificate verification did not pass'}.` : 'TLS handshake could not be completed.'}</p><dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[10px]"><dt className="text-slate-400">Protocol</dt><dd className="text-right font-semibold text-slate-700">{result.tls.protocol || 'Unavailable'}</dd><dt className="text-slate-400">Cipher</dt><dd className="break-all text-right font-mono text-slate-700">{result.tls.cipher || 'Unavailable'}</dd></dl></div>
              <div className="rounded-xl border border-slate-200 px-4"><VerificationRow label="Hostname match" passed={result.checks.hostnameMatches} message={result.checks.hostnameMessage} /><VerificationRow label="Certificate chain" passed={result.checks.chainTrusted} message={result.checks.chainMessage} /><VerificationRow label="Validity period" passed={result.checks.validityPassed} message={result.checks.validityMessage} /></div>
            </div>
            {result.certificate && <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"><SummaryValue label="Issuer" value={result.certificate.issuer} /><SummaryValue label="Expires" value={formatDate(result.certificate.validTo)} /><SummaryValue label="Days remaining" value={result.checks.daysUntilExpiry === null ? 'Unavailable' : String(result.checks.daysUntilExpiry)} /></div>}
            {result.error && <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[10px] leading-relaxed text-slate-600">Technical result: <code className="font-semibold">{result.error.code}</code> · {result.error.message}</p>}
            {result.certificate && <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => downloadJson(result, 'ssl-certificate-report.json', 'Certificate report')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Download className="h-3.5 w-3.5" />Download JSON report</button><button type="button" onClick={() => void copyText(JSON.stringify(result, null, 2), 'Certificate report')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Copy className="h-3.5 w-3.5" />Copy report</button></div>}
          </section>
          <p className="flex items-start gap-2 px-1 text-[10px] leading-relaxed text-slate-500"><LockKeyholeIcon />The backend connects to the resolved public IP directly and uses strict Node.js TLS verification. When verification fails, a separate diagnostic handshake may read the presented certificate; that never counts as a verified connection.</p>
        </>}
      </div>}

      {tab === 'details' && <div className="space-y-4">
        {!result?.certificate && <EmptyPanel title="Certificate details unavailable" description="Run a live check first. A certificate that could not be retrieved will not be replaced with sample data." />}
        {result?.certificate && <>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-slate-900">Presented certificate</h2><p className="mt-1 text-[11px] text-slate-500">Details read from the endpoint’s X.509 certificate.</p></div><button type="button" onClick={() => downloadJson(result.certificate, 'certificate-details.json', 'Certificate details')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Download className="h-3.5 w-3.5" />Export JSON</button></div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"><Detail label="Subject" value={result.certificate.subject} /><Detail label="Issuer" value={result.certificate.issuer} /><Detail label="Serial number" value={result.certificate.serialNumber} mono /><Detail label="SHA-256 fingerprint" value={result.certificate.fingerprintSha256} mono copy={() => void copyText(result.certificate!.fingerprintSha256, 'Fingerprint')} /><Detail label="Not before" value={formatDate(result.certificate.validFrom)} /><Detail label="Not after" value={formatDate(result.certificate.validTo)} /><Detail label="Signature algorithm" value={result.certificate.signatureAlgorithm || 'Not exposed by the Node.js TLS certificate metadata'} /><Detail label="Public key" value={[result.certificate.publicKeyAlgorithm, result.certificate.publicKeySizeBits ? `${result.certificate.publicKeySizeBits} bits` : null, result.certificate.publicKeyCurve].filter(Boolean).join(' · ') || 'Not provided by source'} /></div>
            <div className="mt-4 rounded-xl border border-slate-200 p-4"><h3 className="text-xs font-bold text-slate-800">Subject Alternative Names</h3>{result.certificate.subjectAltNames.length ? <ul className="mt-2 flex flex-wrap gap-1.5">{result.certificate.subjectAltNames.map((name) => <li key={name} className="break-all rounded-md bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-700">{name}</li>)}</ul> : <p className="mt-1 text-[11px] text-slate-500">No SAN values were provided.</p>}</div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5"><h2 className="text-sm font-bold text-slate-900">Certificate chain</h2><p className="mt-1 text-[11px] text-slate-500">Certificates returned by the TLS peer. Trust is determined by the strict live verification result.</p><div className="mt-3 space-y-2">{result.certificate.chain.map((item, index) => <div key={item.fingerprintSha256} className="rounded-xl border border-slate-200 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-slate-800">{index === 0 ? 'Leaf certificate' : `Chain certificate ${index + 1}`}</span><code className="break-all text-[9px] text-slate-400">{item.fingerprintSha256}</code></div><p className="mt-2 break-words text-[11px] text-slate-600"><strong>Subject:</strong> {item.subject}</p><p className="mt-1 break-words text-[11px] text-slate-600"><strong>Issuer:</strong> {item.issuer}</p><p className="mt-1 text-[10px] text-slate-400">{formatDate(item.validFrom)} — {formatDate(item.validTo)}</p></div>)}</div></section>
        </>}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5"><div className="flex items-start gap-2"><Fingerprint className="mt-0.5 h-4 w-4 text-indigo-600" /><div><h2 className="text-sm font-bold text-slate-900">Compare SHA-256 fingerprints</h2><p className="mt-1 text-[11px] text-slate-500">Fingerprint equality means the certificate bytes match; it does not prove the certificate is trusted.</p></div></div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2"><label className="text-[11px] font-semibold text-slate-600">Fingerprint A<input value={fingerprintA} onChange={(event) => setFingerprintA(event.target.value)} placeholder="SHA-256 fingerprint" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-[10px] text-slate-800 outline-none focus:border-indigo-400" /></label><label className="text-[11px] font-semibold text-slate-600">Fingerprint B<input value={fingerprintB} onChange={(event) => setFingerprintB(event.target.value)} placeholder="Paste another SHA-256 fingerprint" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-[10px] text-slate-800 outline-none focus:border-indigo-400" /></label></div>
          {fingerprintA || fingerprintB ? <p role="status" className={`mt-3 text-xs font-semibold ${fingerprintsMatch === true ? 'text-emerald-700' : fingerprintsMatch === false ? 'text-rose-700' : 'text-amber-700'}`}>{fingerprintsMatch === true ? 'Fingerprints match.' : fingerprintsMatch === false ? 'Fingerprints differ.' : 'Enter two valid 64-character SHA-256 fingerprints to compare.'}</p> : null}
        </section>
      </div>}

      {tab === 'history' && <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-slate-900">Certificate Transparency history</h2><p className="mt-1 text-[11px] text-slate-500">Searches crt.sh, a public CT log index. Entries show logged certificates and do not prove what a live server currently presents.</p></div><button type="button" onClick={() => void loadHistory()} disabled={historyLoading || !targetInput.trim()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{historyLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}{historyLoading ? 'Searching…' : 'Search CT history'}</button></div>
          {historyError && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{historyError}</p>}
          {historyLoading && <div role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-3 text-xs text-slate-600"><LoaderCircle className="h-4 w-4 animate-spin text-indigo-600" />Loading records from crt.sh…</div>}
          {history && <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center"><p className="mr-auto text-[10px] text-slate-500">{history.records.length} records for <strong className="text-slate-700">{history.domain}</strong> · checked {formatDate(history.checkedAt)}</p><label className="relative"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input value={historyFilter} onChange={(event) => setHistoryFilter(event.target.value)} placeholder="Filter domain or SAN" className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-2 text-[11px] outline-none focus:border-indigo-400 sm:w-48" /></label><select value={historySort} onChange={(event) => setHistorySort(event.target.value as 'loggedAt' | 'notAfter')} aria-label="Sort certificate history" className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] text-slate-600"><option value="loggedAt">Newest logged</option><option value="notAfter">Latest expiry</option></select><button type="button" onClick={() => downloadJson(history, `${history.domain}-certificate-history.json`, 'Certificate history')} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Download className="h-3.5 w-3.5" />Export JSON</button></div>}
          {history && !history.records.length && <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-xs text-slate-500">crt.sh returned no records for this domain.</div>}
          {history && history.records.length > 0 && !filteredHistory.length && <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-xs text-slate-500">No records match this filter.</div>}
          {history && filteredHistory.length > 0 && <div className="mt-4 space-y-2">{filteredHistory.map((record) => <HistoryCard key={record.id} record={record} />)}</div>}
          {history && <a href={history.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:underline">Open source query at crt.sh <ExternalLink className="h-3 w-3" /></a>}
        </section>
      </div>}

      {notice && <div role="status" className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl"><Check className="h-4 w-4 shrink-0 text-emerald-400" />{notice}</div>}
    </div>
  );
};

const SummaryValue: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="min-w-0 rounded-lg bg-slate-50 p-3"><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span><span className="mt-1 block break-words text-[11px] font-semibold text-slate-700">{value}</span></div>;

const Detail: React.FC<{ label: string; value: string; mono?: boolean; copy?: () => void }> = ({ label, value, mono, copy }) => <div className="min-w-0 rounded-xl border border-slate-200 p-3"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>{copy && <button type="button" onClick={copy} aria-label={`Copy ${label}`} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"><Copy className="h-3.5 w-3.5" /></button>}</div><p className={`mt-1 break-all text-[11px] text-slate-700 ${mono ? 'font-mono' : ''}`}>{value}</p></div>;

const EmptyPanel: React.FC<{ title: string; description: string }> = ({ title, description }) => <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center"><FileBadge className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 text-sm font-bold text-slate-700">{title}</h2><p className="mx-auto mt-1 max-w-xl text-xs text-slate-500">{description}</p></div>;

const LockKeyholeIcon: React.FC = () => <span aria-hidden="true" className="inline-flex h-3.5 w-3.5 items-center justify-center rounded border border-current text-[8px] leading-none">TLS</span>;
