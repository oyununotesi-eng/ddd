import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpDown,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  History,
  Info,
  Layers3,
  PackageCheck,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import type {
  ProductRelease,
  ReleaseCompatibilityEntry,
  ReleaseLifecyclePhase,
  ReleaseProduct,
  ReleaseSource,
} from '../../types';
import {
  compareReleaseVersions,
  getProductById,
  getProductDataById,
  getProductLastVerifiedAt,
  getProductReleases,
  getProducts,
  getProductSources,
  getReleaseCompatibility,
  getReleaseLifecycle,
  getUpdatesAvailable,
} from '../../data/releases/releaseData';

type DetailTab = 'overview' | 'notes' | 'downloads' | 'compatibility' | 'lifecycle' | 'sources';

const DETAIL_TABS: { id: DetailTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'notes', label: 'Release Notes', icon: FileText },
  { id: 'downloads', label: 'Downloads', icon: ArrowDownToLine },
  { id: 'compatibility', label: 'Compatibility', icon: Layers3 },
  { id: 'lifecycle', label: 'Lifecycle', icon: ShieldCheck },
  { id: 'sources', label: 'Sources', icon: ExternalLink },
];

const NOTE_SECTIONS: { key: keyof ProductRelease['releaseNotes']; label: string }[] = [
  { key: 'newFeatures', label: 'New Features' },
  { key: 'improvements', label: 'Improvements' },
  { key: 'bugFixes', label: 'Bug Fixes' },
  { key: 'securityFixes', label: 'Security Fixes' },
  { key: 'breakingChanges', label: 'Breaking Changes' },
  { key: 'knownIssues', label: 'Known Issues' },
  { key: 'upgradeNotes', label: 'Upgrade Notes' },
];

const COMPATIBILITY_CATEGORIES: ReleaseCompatibilityEntry['category'][] = [
  'Java', 'Operating Systems', 'Architecture', 'Database', 'JMS',
];

const formatDate = (value?: string | null, includeTime = false) => {
  if (!value) return 'Kaynakta belirtilmemiş';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Kaynakta belirtilmemiş';
  return new Intl.DateTimeFormat('tr-TR', includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' }).format(date);
};

const verificationTone = (status: string) => {
  if (status === 'Verified') return 'bg-emerald-50 text-emerald-700';
  if (status === 'Needs Review') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-600';
};

const releaseTone = (status: string) => {
  if (status === 'Released') return 'bg-blue-50 text-blue-700';
  if (status === 'Preview' || status === 'Beta') return 'bg-violet-50 text-violet-700';
  return 'bg-slate-100 text-slate-600';
};

const trackedProducts = getProducts();

export const ReleaseDashboard: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState(trackedProducts[0]?.id || '');
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('overview');
  const [query, setQuery] = useState('');
  const [releaseType, setReleaseType] = useState('');
  const [status, setStatus] = useState('');
  const [verification, setVerification] = useState('');
  const [newestFirst, setNewestFirst] = useState(true);
  const [page, setPage] = useState(1);

  const product = getProductById(selectedProductId);
  const productData = getProductDataById(selectedProductId);
  const releases = useMemo(() => getProductReleases(selectedProductId), [selectedProductId]);
  const compatibility = useMemo(() => getReleaseCompatibility(selectedProductId), [selectedProductId]);
  const lifecycle = useMemo(() => getReleaseLifecycle(selectedProductId), [selectedProductId]);
  const sources = useMemo(() => getProductSources(selectedProductId), [selectedProductId]);
  const verifiedAt = getProductLastVerifiedAt(selectedProductId);
  const latestStable = releases.find((release) => release.status === 'Released' && !release.prerelease) || null;
  const latestPreview = releases.find((release) => release.prerelease) || null;
  const selectedRelease = releases.find((release) => release.id === selectedReleaseId) || latestStable || releases[0] || null;
  const updatesAvailable = product ? getUpdatesAvailable(product) : null;
  const latestVersionsByProduct = Object.fromEntries(trackedProducts.map((item) => {
    const stable = getProductReleases(item.id).find((release) => release.status === 'Released' && !release.prerelease);
    return [item.id, stable?.version || item.category];
  }));

  const releaseTypes = useMemo(() => [...new Set(releases.map((release) => release.releaseType))], [releases]);
  const releaseStatuses = useMemo(() => [...new Set(releases.map((release) => release.status))], [releases]);
  const verificationStatuses = useMemo(() => [...new Set(releases.map((release) => release.verificationStatus))], [releases]);

  const filteredReleases = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matching = releases.filter((release) => {
      const haystack = [release.version, release.releaseLine, release.releaseType, release.releaseChannel, release.status]
        .filter(Boolean).join(' ').toLowerCase();
      return (!normalizedQuery || haystack.includes(normalizedQuery))
        && (!releaseType || release.releaseType === releaseType)
        && (!status || release.status === status)
        && (!verification || release.verificationStatus === verification);
    });
    return matching.sort((left, right) => newestFirst
      ? compareReleaseVersions(right.version, left.version)
      : compareReleaseVersions(left.version, right.version));
  }, [newestFirst, query, releases, releaseType, status, verification]);

  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredReleases.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageReleases = filteredReleases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => setPage(1), [selectedProductId, query, releaseType, status, verification, newestFirst]);

  const openDetails = (release: ProductRelease, tab: DetailTab = 'overview') => {
    setSelectedReleaseId(release.id);
    setActiveDetailTab(tab);
    setIsDetailsOpen(true);
  };

  const resetFilters = () => {
    setQuery('');
    setReleaseType('');
    setStatus('');
    setVerification('');
  };

  if (!trackedProducts.length) {
    return <EmptyState title="Takip edilen ürün yok" description="Ürünler releases/products.json dosyasından yönetilir." />;
  }

  return (
    <div className="space-y-5 animate-in fade-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#f96332]">Product Release Management</span>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Release Tracker</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">Sürümler, uyumluluk ve yaşam döngüsü bilgileri yerel JSON dosyalarından yüklenir.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-500">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Backend/API kullanılmıyor
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Layers3} label="Total Products" value={String(trackedProducts.length)} hint="Takip edilen ürün" accent="blue" />
        <StatCard icon={History} label="Total Releases" value={String(releases.length)} hint="JSON kayıtları" accent="violet" />
        <StatCard icon={PackageCheck} label="Latest Release" value={latestStable?.version || 'Veri yok'} hint={latestStable?.releaseType || 'Doğrulanmış sürüm yok'} accent="cyan" />
        <StatCard icon={Clock3} label="Last Verified" value={formatDate(verifiedAt)} hint="JSON içindeki doğrulama tarihi" accent="emerald" />
        <StatCard icon={ArrowUpRight} label="Updates Available" value={updatesAvailable === null ? 'Tanımlı değil' : String(updatesAvailable)} hint={product?.installedVersion ? `Kurulu: ${product.installedVersion}` : 'Kurulu sürüm girilmedi'} accent="amber" />
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
        <ProductList
          products={trackedProducts}
          selectedProductId={selectedProductId}
          latestVersions={latestVersionsByProduct}
          onSelect={(id) => { setSelectedProductId(id); setSelectedReleaseId(null); }}
        />

        <main className="min-w-0 space-y-5">
          {product && !productData ? (
            <EmptyState title="Ürün veri dosyası bulunamadı" description={`Ürün kaydı ${product.dataFile} dosyasına işaret ediyor, ancak bu dosya import edilemedi.`} />
          ) : product ? (
            <ProductOverview product={product} latestStable={latestStable} latestPreview={latestPreview} verifiedAt={verifiedAt} sources={sources} />
          ) : (
            <EmptyState title="Ürün verisi bulunamadı" description="Ürün kaydı ile releases/products altındaki JSON dosya adı eşleşmiyor." />
          )}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
              <div>
                <div className="flex items-center gap-2"><History className="h-4 w-4 text-blue-600" /><h2 className="text-sm font-black text-slate-900">Release History</h2></div>
                <p className="mt-1 text-[11px] text-slate-500">Sürüm numaraları metinsel değil, sayısal parçalara göre sıralanır.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-600">{filteredReleases.length} kayıt</span>
            </div>

            <div className="space-y-3 border-b border-slate-100 bg-slate-50/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <label className="relative min-w-[210px] flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sürüm ara" className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
                </label>
                <FilterSelect label="Release type" value={releaseType} options={releaseTypes} onChange={setReleaseType} />
                <FilterSelect label="Status" value={status} options={releaseStatuses} onChange={setStatus} />
                <FilterSelect label="Verification" value={verification} options={verificationStatuses} onChange={setVerification} />
                <button type="button" onClick={() => setNewestFirst((value) => !value)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-100">
                  <ArrowUpDown className="h-3.5 w-3.5" />{newestFirst ? 'En yeni sürüm' : 'En eski sürüm'}
                </button>
                <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-slate-500 hover:bg-white"><Filter className="h-3.5 w-3.5" />Temizle</button>
              </div>
              {(!releaseTypes.length || !releases.length) && <p className="text-[11px] text-amber-700">Bu ürünün JSON dosyasında sürüm kaydı bulunmuyor.</p>}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead><tr className="bg-slate-50 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">Version</th><th className="px-3 py-3">Release Type</th><th className="px-3 py-3">Release Date</th><th className="px-3 py-3">Last Modified</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Verification</th><th className="px-3 py-3 text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {pageReleases.map((release) => (
                    <tr key={release.id} className="border-t border-slate-100 text-[10px] hover:bg-slate-50/70">
                      <td className="px-3 py-3 font-bold text-slate-800">{release.version}{release.prerelease && <span className="ml-2 rounded px-1.5 py-1 text-[8px] font-black uppercase tracking-wide text-violet-700 bg-violet-50">Preview</span>}</td>
                      <td className="px-3 py-3 text-slate-600">{release.releaseType || 'Kaynakta belirtilmemiş'}</td>
                      <td className="px-3 py-3 text-slate-600">{formatDate(release.publishedAt)}</td>
                      <td className="px-3 py-3 text-slate-600">{formatDate(release.directoryModifiedAt)}</td>
                      <td className="px-3 py-3"><StatusPill label={release.status} className={releaseTone(release.status)} /></td>
                      <td className="px-3 py-3"><StatusPill label={release.verificationStatus} className={verificationTone(release.verificationStatus)} /></td>
                      <td className="px-3 py-3"><div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => openDetails(release)} className="rounded-md px-2 py-1.5 font-bold text-blue-700 hover:bg-blue-50">Details</button>
                        {release.releaseNotesUrl && <a href={release.releaseNotesUrl} target="_blank" rel="noreferrer" aria-label={`${release.version} Release Notes`} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"><FileText className="h-3.5 w-3.5" /></a>}
                        {release.downloadUrl && <a href={release.downloadUrl} target="_blank" rel="noreferrer" aria-label={`${release.version} download`} className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"><ArrowDownToLine className="h-3.5 w-3.5" /></a>}
                      </div></td>
                    </tr>
                  ))}
                  {!pageReleases.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-500">Filtrelerle eşleşen doğrulanmış sürüm kaydı yok.</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-[10px] text-slate-500">
              <span>{filteredReleases.length} sürüm kaydı</span>
              {pageCount > 1 && <div className="flex items-center gap-1">
                <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Önceki sayfa" className="rounded-md p-1.5 hover:bg-slate-100 disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /></button>
                <span className="px-2 font-semibold">{currentPage} / {pageCount}</span>
                <button type="button" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} aria-label="Sonraki sayfa" className="rounded-md p-1.5 hover:bg-slate-100 disabled:opacity-40"><ChevronRight className="h-3.5 w-3.5" /></button>
              </div>}
            </div>
          </section>

          <UpcomingReleases releases={releases.filter((release) => release.prerelease)} onOpen={openDetails} />
        </main>
      </div>

      {isDetailsOpen && selectedRelease && product && (
        <ReleaseDetailsDialog
          release={selectedRelease}
          product={product}
          compatibility={compatibility}
          lifecycle={lifecycle}
          sources={sources}
          activeTab={activeDetailTab}
          onTabChange={setActiveDetailTab}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </div>
  );
};

const ProductList: React.FC<{
  products: ReleaseProduct[];
  selectedProductId: string;
  latestVersions: Record<string, string>;
  onSelect: (id: string) => void;
}> = ({ products, selectedProductId, latestVersions, onSelect }) => (
  <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs lg:sticky lg:top-24">
    <div className="border-b border-slate-100 px-2 pb-3">
      <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-800">Products</h2>
      <p className="mt-1 text-[10px] text-slate-400">Takip edilen ürünler</p>
    </div>
    <div className="mt-2 space-y-1">
      {products.map((item) => {
        const active = item.id === selectedProductId;
        return <button key={item.id} type="button" onClick={() => onSelect(item.id)} className={`flex w-full items-start gap-2.5 rounded-xl px-2.5 py-3 text-left transition-colors ${active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-white/10 text-white' : 'bg-red-50 text-red-700'}`}><ShieldCheck className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1"><span className="block text-[11px] font-bold leading-snug">{item.name}</span><span className={`mt-1 block text-[9px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>{latestVersions[item.id] || item.category}</span></span>
        </button>;
      })}
    </div>
  </aside>
);

const ProductOverview: React.FC<{
  product: ReleaseProduct;
  latestStable: ProductRelease | null;
  latestPreview: ProductRelease | null;
  verifiedAt: string | null;
  sources: ReleaseSource[];
}> = ({ product, latestStable, latestPreview, verifiedAt, sources }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700"><ShieldCheck className="h-5 w-5" /></span>
        <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-red-700">{product.vendor} · {product.category}</p><h2 className="mt-1 text-base font-black text-slate-900">{product.name}</h2><p className="mt-1 text-[11px] leading-relaxed text-slate-500">{product.description}</p></div>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[9px] font-bold text-emerald-700"><BadgeCheck className="h-3 w-3" /> Tracking</span>
    </div>
    <div className="mt-4 grid gap-2 sm:grid-cols-3">
      <ReleaseSummary label="Latest stable" value={latestStable?.version || 'Doğrulanmış sürüm yok'} icon={PackageCheck} />
      <ReleaseSummary label="Preview" value={latestPreview?.version || 'Preview kaydı yok'} icon={Clock3} />
      <ReleaseSummary label="Last verified" value={formatDate(verifiedAt)} icon={CalendarDays} />
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-[10px] font-semibold">
      {sources.filter((source) => source.enabled).slice(0, 3).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800">{source.name}<ExternalLink className="h-3 w-3" /></a>)}
      <span className="text-slate-400">Kaynaklar otomatik taranmaz; JSON kayıtları elle güncellenir.</span>
    </div>
  </section>
);

const UpcomingReleases: React.FC<{ releases: ProductRelease[]; onOpen: (release: ProductRelease, tab?: DetailTab) => void }> = ({ releases, onOpen }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><span className="text-[9px] font-bold uppercase tracking-[.16em] text-[#f96332]">Release Calendar</span><h2 className="mt-1 text-base font-black text-slate-900">Yaklaşan Release’ler</h2><p className="mt-1 text-[11px] text-slate-500">Preview sürümleri gösterilir; kaynakta olmayan tarihler tahmin edilmez.</p></div>
      <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-[9px] font-bold text-slate-600">{releases.length} preview kaydı</span>
    </div>
    {releases.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{releases.map((release) => <article key={release.id} className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/50 p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><Clock3 className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{release.version}</p><p className="mt-1 text-[10px] text-slate-500">{formatDate(release.publishedAt)} · {release.status}</p></div>
      <button type="button" onClick={() => onOpen(release, 'overview')} className="rounded-md p-1.5 text-blue-700 hover:bg-white" aria-label={`${release.version} detaylarını aç`}><ArrowUpRight className="h-4 w-4" /></button>
    </article>)}</div> : <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-7 text-center"><CalendarDays className="h-6 w-6 text-slate-300" /><p className="mt-2 text-xs font-bold text-slate-700">Duyurulmuş preview sürümü yok</p><p className="mt-1 max-w-lg text-[10px] leading-relaxed text-slate-500">Yerel JSON verilerinde yaklaşan sürüm veya doğrulanmış yayın tarihi bulunmuyor.</p></div>}
  </section>
);

const ReleaseDetailsDialog: React.FC<{
  release: ProductRelease;
  product: ReleaseProduct;
  compatibility: ReleaseCompatibilityEntry[];
  lifecycle: ReleaseLifecyclePhase[];
  sources: ReleaseSource[];
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  onClose: () => void;
}> = ({ release, product, compatibility, lifecycle, sources, activeTab, onTabChange, onClose }) => {
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="release-detail-title" className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-4 sm:p-5">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 id="release-detail-title" className="text-lg font-black text-slate-900">{release.version}</h2><StatusPill label={release.verificationStatus} className={verificationTone(release.verificationStatus)} /></div><p className="mt-1 text-[11px] text-slate-500">{product.name} · {release.releaseLine} · {release.releaseType}</p></div>
        <button type="button" onClick={onClose} aria-label="Detayları kapat" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
      </header>
      <nav aria-label="Release detail sections" className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 px-3 sm:px-5">{DETAIL_TABS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => onTabChange(id)} className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-3 text-[10px] font-semibold transition-colors ${activeTab === id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</nav>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        {activeTab === 'overview' && <ReleaseOverviewDetails release={release} />}
        {activeTab === 'notes' && <ReleaseNotesDetails release={release} />}
        {activeTab === 'downloads' && <ReleaseDownloadsDetails release={release} sources={sources} />}
        {activeTab === 'compatibility' && <CompatibilityDetails release={release} entries={compatibility} />}
        {activeTab === 'lifecycle' && <LifecycleDetails lifecycle={lifecycle} sources={sources} />}
        {activeTab === 'sources' && <SourcesDetails release={release} sources={sources} />}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-[9px] text-slate-500 sm:px-5">
        <span>Son doğrulama: {formatDate(release.lastVerifiedAt, true)}</span>
        <div className="flex gap-3">{release.releaseNotesUrl && <a href={release.releaseNotesUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-blue-700">Release Notes <ExternalLink className="h-3 w-3" /></a>}{release.sourceUrl && <a href={release.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-blue-700">Source <ExternalLink className="h-3 w-3" /></a>}</div>
      </footer>
    </section>
  </div>;
};

const ReleaseOverviewDetails: React.FC<{ release: ProductRelease }> = ({ release }) => {
  const rows: [string, string][] = [
    ['Version', release.version],
    ['Release line', release.releaseLine],
    ['Release type', release.releaseType],
    ['Release channel', release.releaseChannel || 'Kaynakta belirtilmemiş'],
    ['Published at', formatDate(release.publishedAt)],
    ['Directory modified at', formatDate(release.directoryModifiedAt)],
    ['Status', release.status],
    ['Prerelease', release.prerelease ? 'Yes' : 'No'],
    ['Verification', release.verificationStatus],
    ['First seen', formatDate(release.firstSeenAt)],
    ['Last verified', formatDate(release.lastVerifiedAt, true)],
  ];
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
    <section className="rounded-xl border border-slate-200 p-4"><h3 className="text-xs font-black text-slate-800">Release information</h3><dl className="mt-3 grid gap-x-5 gap-y-3 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="border-b border-slate-100 pb-2"><dt className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 break-words text-[11px] font-semibold text-slate-700">{value}</dd></div>)}</dl></section>
    <section className="space-y-3"><InfoCard icon={CalendarDays} title="Yayın tarihi" value={formatDate(release.publishedAt)} detail="Resmî yayın tarihi; bilinmiyorsa tahmin edilmez." /><InfoCard icon={Clock3} title="Downloads dizin zamanı" value={formatDate(release.directoryModifiedAt)} detail="Dizin değişiklik zamanı yayın tarihi yerine kullanılmaz." /><InfoCard icon={ShieldCheck} title="Destek durumu" value="Sürüm özelinde tarih doğrulanmadı" detail="Ürün yaşam döngüsü politikasını ayrı sekmede inceleyin." /></section>
  </div>;
};

const ReleaseNotesDetails: React.FC<{ release: ProductRelease }> = ({ release }) => <div>
  <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-black text-slate-900">Release Notes · {release.version}</h3><p className="mt-1 text-[10px] text-slate-500">Özet alanları doğrulanmış kaynak içeriğiyle doldurulur; boş alanlar için içerik üretilmez.</p></div>{release.releaseNotesUrl && <a href={release.releaseNotesUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-blue-700 hover:bg-blue-50">Orijinal kaynak <ExternalLink className="h-3 w-3" /></a>}</div>
  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{NOTE_SECTIONS.map(({ key, label }) => {
    const notes = release.releaseNotes[key] || [];
    return <article key={key} className="rounded-xl border border-slate-200 p-3.5"><h4 className="text-[11px] font-bold text-slate-800">{label}</h4>{notes.length ? <ul className="mt-2 list-disc space-y-1 pl-4 text-[10px] leading-relaxed text-slate-600">{notes.map((note, index) => <li key={`${key}-${index}`}>{note}</li>)}</ul> : <p className="mt-2 text-[10px] leading-relaxed text-slate-400">Kaynakta belirtilmemiş. Resmî dokümana bağlantı korunmuştur.</p>}</article>;
  })}</div>
</div>;

const ReleaseDownloadsDetails: React.FC<{ release: ProductRelease; sources: ReleaseSource[] }> = ({ release, sources }) => {
  const downloadsSource = sources.find((source) => source.id === 'jboss-eap-downloads');
  return <div>
  <h3 className="text-sm font-black text-slate-900">Download artifacts</h3><p className="mt-1 text-[10px] text-slate-500">Sürüm, işletim sistemi, mimari ve paket türüyle eşleşen doğrulanmış indirmeler.</p>
  {release.downloadUrl && <a href={release.downloadUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-[10px] font-bold text-white hover:bg-blue-700"><ArrowDownToLine className="h-3.5 w-3.5" />Resmî indirme sayfası <ExternalLink className="h-3 w-3" /></a>}
  {!release.downloadUrl && downloadsSource && <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 p-3"><p className="text-[10px] leading-relaxed text-amber-900">Bu sürüm için doğrulanmış dosya bağlantısı yok. Genel indirme dizini sürümle birebir eşleştirilmedi.</p><a href={downloadsSource.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-700">Red Hat Downloads dizini <ExternalLink className="h-3 w-3" /></a></div>}
  {release.artifacts.length ? <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[620px] text-left text-[10px]"><thead className="bg-slate-50 text-[9px] uppercase text-slate-500"><tr><th className="px-3 py-2.5">Filename</th><th className="px-3 py-2.5">Package</th><th className="px-3 py-2.5">Platform</th><th className="px-3 py-2.5">Architecture</th><th className="px-3 py-2.5">Checksum</th><th className="px-3 py-2.5">Download</th></tr></thead><tbody>{release.artifacts.map((artifact, index) => <tr key={`${artifact.filename}-${index}`} className="border-t border-slate-100"><td className="px-3 py-2.5 font-semibold text-slate-700">{artifact.filename}</td><td className="px-3 py-2.5">{artifact.packageType}</td><td className="px-3 py-2.5">{artifact.platform}</td><td className="px-3 py-2.5">{artifact.architecture}</td><td className="px-3 py-2.5">{artifact.checksum || 'Kaynakta belirtilmemiş'}</td><td className="px-3 py-2.5">{artifact.downloadUrl ? <a href={artifact.downloadUrl} target="_blank" rel="noreferrer" className="text-blue-700">İndir</a> : 'Kaynakta belirtilmemiş'}</td></tr>)}</tbody></table></div> : <EmptyState title="Doğrulanmış artifact yok" description="Bu yerel veri setinde sürüme ait dosya, platform, mimari veya checksum eşlemesi henüz bulunmuyor. İndirme kaynağı dosyaya eklendiğinde burada görünür." />}
</div>;
};

const CompatibilityDetails: React.FC<{ release: ProductRelease; entries: ReleaseCompatibilityEntry[] }> = ({ release, entries }) => <div>
  <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-[10px] leading-relaxed text-blue-900"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span><strong>Kapsam:</strong> {release.compatibilityScope || 'Uyumluluk kapsamı belirtilmemiş.'} Değerler EAP 8.1 ürün serisi seviyesindedir; her update için ayrı ayrı doğrulanmış sayılmaz.</span></div>
  <div className="mt-4 space-y-4">{COMPATIBILITY_CATEGORIES.map((category) => {
    const categoryEntries = entries.filter((entry) => entry.category === category);
    if (!categoryEntries.length) return <div key={category} className="rounded-xl border border-dashed border-slate-200 p-4"><h4 className="text-[11px] font-bold text-slate-700">{category}</h4><p className="mt-1 text-[10px] text-slate-400">Kaynakta belirtilmemiş.</p></div>;
    return <section key={category}><h4 className="mb-2 text-[11px] font-black text-slate-800">{category}</h4><div className="grid gap-2 sm:grid-cols-2">{categoryEntries.map((entry) => <article key={entry.id} className="rounded-xl border border-slate-200 p-3"><div className="flex flex-wrap items-start justify-between gap-2"><p className="text-[11px] font-bold text-slate-800">{entry.name}</p><StatusPill label={entry.verificationStatus} className={verificationTone(entry.verificationStatus)} /></div>{entry.details && <p className="mt-1.5 text-[10px] leading-relaxed text-slate-600">{entry.details}</p>}<p className="mt-2 text-[9px] text-slate-400">Kapsam: {entry.scope}</p></article>)}</div></section>;
  })}</div>
</div>;

const LifecycleDetails: React.FC<{ lifecycle: ReleaseLifecyclePhase[]; sources: ReleaseSource[] }> = ({ lifecycle, sources }) => <div>
  <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-[10px] leading-relaxed text-amber-900"><CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>Red Hat politikası ürün yaşam döngüsü sürelerini açıklar; EAP 8.1 için doğrulanmış takvim tarihleri kaynakta listelenmediğinden başlangıç/bitiş tarihleri boş bırakılmıştır.</span></div>
  <div className="mt-4 grid gap-3 sm:grid-cols-2">{lifecycle.map((phase, index) => <LifecycleCard key={`${phase.phase}-${index}`} phase={phase} source={sources.find((item) => item.id === phase.sourceId)} />)}</div>
  {!lifecycle.length && <EmptyState title="Yaşam döngüsü bilgisi yok" description="Doğrulanmış destek politikası eklenmemiş." />}
</div>;

const SourcesDetails: React.FC<{ release: ProductRelease; sources: ReleaseSource[] }> = ({ release, sources }) => <div>
  <h3 className="text-sm font-black text-slate-900">Official sources</h3><p className="mt-1 text-[10px] text-slate-500">Kaynak bağlantıları ürün verisinden gelir; her birinin doğrulama durumu görünür.</p>
  <div className="mt-4 grid gap-3 sm:grid-cols-2">{sources.map((source) => <SourceCard key={source.id} source={source} />)}</div>
  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[10px] text-slate-600"><span className="font-bold">Seçili release kaynağı:</span> <a href={release.sourceUrl} target="_blank" rel="noreferrer" className="ml-1 break-all font-semibold text-blue-700">{release.sourceUrl}</a></div>
</div>;

const LifecycleCard: React.FC<{ phase: ReleaseLifecyclePhase; source?: ReleaseSource }> = ({ phase, source }) => <article className="relative rounded-xl border border-slate-200 p-4">
  <div className="flex items-start justify-between gap-2"><div><p className="text-[11px] font-black text-slate-800">{phase.phase}</p><p className="mt-1 text-[10px] text-slate-500">{phase.duration || 'Süre kaynakta belirtilmemiş'}</p></div><StatusPill label={phase.verificationStatus} className={verificationTone(phase.verificationStatus)} /></div>
  <dl className="mt-3 grid grid-cols-2 gap-3"><div><dt className="text-[9px] font-bold uppercase text-slate-400">Başlangıç</dt><dd className="mt-1 text-[10px] font-semibold text-slate-700">{formatDate(phase.startDate)}</dd></div><div><dt className="text-[9px] font-bold uppercase text-slate-400">Bitiş</dt><dd className="mt-1 text-[10px] font-semibold text-slate-700">{formatDate(phase.endDate)}</dd></div></dl>
  {source && <a href={source.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[9px] font-bold text-blue-700">{source.name}<ExternalLink className="h-3 w-3" /></a>}
</article>;

const SourceCard: React.FC<{ source: ReleaseSource }> = ({ source }) => <article className="rounded-xl border border-slate-200 p-3.5">
  <div className="flex items-start justify-between gap-2"><h4 className="text-[11px] font-bold text-slate-800">{source.name}</h4><StatusPill label={source.verificationStatus} className={verificationTone(source.verificationStatus)} /></div>
  <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">{source.purpose}</p>
  <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-[9px] text-slate-400">{source.sourceType} · Son doğrulama {formatDate(source.lastVerifiedAt)}</span><a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-700">Kaynağı aç <ExternalLink className="h-3 w-3" /></a></div>
</article>;

const InfoCard: React.FC<{ icon: React.ElementType; title: string; value: string; detail: string }> = ({ icon: Icon, title, value, detail }) => <article className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"><div className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-blue-600" /><span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{title}</span></div><p className="mt-2 text-[11px] font-bold text-slate-800">{value}</p><p className="mt-1 text-[9px] leading-relaxed text-slate-500">{detail}</p></article>;

const ReleaseSummary: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-xs"><Icon className="h-3.5 w-3.5" /></span><div className="min-w-0"><p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 truncate text-[10px] font-bold text-slate-800" title={value}>{value}</p></div></div>;

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string; hint: string; accent: string }> = ({ icon: Icon, label, value, hint, accent }) => {
  const accents: Record<string, string> = { blue: 'bg-blue-50 text-blue-600', violet: 'bg-violet-50 text-violet-600', cyan: 'bg-cyan-50 text-cyan-700', emerald: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700' };
  return <article className="flex min-h-[88px] items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-xs"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accents[accent] || accents.blue}`}><Icon className="h-3.5 w-3.5" /></span><div className="min-w-0"><p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-[11px] font-black leading-snug text-slate-800">{value}</p><p className="mt-1 text-[8px] leading-snug text-slate-400">{hint}</p></div></article>;
};

const FilterSelect: React.FC<{ label: string; value: string; options: string[]; onChange: (value: string) => void }> = ({ label, value, options, onChange }) => <label className="relative min-w-[116px]"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 py-2 pr-7 text-[10px] text-slate-600 outline-none focus:border-blue-300"><option value="">{label}: All</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" /></label>;

const StatusPill: React.FC<{ label: string; className: string }> = ({ label, className }) => <span className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[8px] font-bold ${className}`}>{label}</span>;

const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => <div className="mt-3 flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center"><Info className="h-5 w-5 text-slate-300" /><p className="mt-2 text-[11px] font-bold text-slate-700">{title}</p><p className="mt-1 max-w-xl text-[10px] leading-relaxed text-slate-500">{description}</p></div>;
