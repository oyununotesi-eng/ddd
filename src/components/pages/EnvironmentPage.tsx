import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Cpu, 
  Boxes, 
  ArrowLeftRight, 
  Zap, 
  Activity, 
  Layers, 
  Search, 
  CheckCircle2, 
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { EnvironmentTab } from '../../types';
import { ImportedTableView } from '../ImportedTableView';
import { readImportedTable, type ImportedTable } from '../../data/spreadsheets';

interface EnvironmentPageProps {
  initialTab?: EnvironmentTab;
}

export const EnvironmentPage: React.FC<EnvironmentPageProps> = ({ initialTab = 'sunucu' }) => {
  const [activeTab, setActiveTab] = useState<EnvironmentTab>(initialTab);
  const [importedTable, setImportedTable] = useState<ImportedTable | null>(null);
  const [checkedImportTab, setCheckedImportTab] = useState<EnvironmentTab | null>(null);
  const [envFilter, setEnvFilter] = useState<'ALL' | 'PROD' | 'PREPROD' | 'TEST' | 'DEV'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    let isCurrent = true;
    setCheckedImportTab(null);
    readImportedTable(activeTab)
      .then((table) => {
        if (!isCurrent) return;
        setImportedTable(table);
        setCheckedImportTab(activeTab);
      })
      .catch(() => {
        if (!isCurrent) return;
        setImportedTable(null);
        setCheckedImportTab(activeTab);
      });
    return () => { isCurrent = false; };
  }, [activeTab]);

  const triggerConfetti = (originEl: HTMLElement) => {
    const colors = ['#f96332', '#ea4c10', '#ffb236', '#2ca8ff', '#18ce0f', '#ff3636'];
    const rect = originEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 24; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      const size = Math.random() * 8 + 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.4;
      const dist = Math.random() * 110 + 50;
      const vx = Math.cos(angle) * dist;
      const vy = Math.sin(angle) * dist - 30;
      const rotation = Math.random() * 720 - 360;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * (Math.random() > 0.5 ? 1 : 0.5)}px`;
      piece.style.backgroundColor = color;
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.left = `${cx}px`;
      piece.style.top = `${cy}px`;
      document.body.appendChild(piece);
      piece.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          { transform: `translate(${vx}px, ${vy + 220}px) rotate(${rotation}deg)`, opacity: 0 },
        ],
        { duration: 1100 + Math.random() * 400, easing: 'cubic-bezier(.22,.61,.36,1)' }
      );
      setTimeout(() => piece.remove(), 1600);
    }
  };

  const tabs: { id: EnvironmentTab; label: string; icon: any }[] = [
    { id: 'sunucu', label: 'Sunucu', icon: Server },
    { id: 'uygulama', label: 'Uygulama', icon: Cpu },
    { id: 'openshift', label: 'Openshift', icon: Boxes },
    { id: 'reverse-proxy', label: 'Reverse Proxy', icon: ArrowLeftRight },
    { id: 'provenir', label: 'Provenir', icon: Zap },
    { id: 'evam', label: 'Evam', icon: Activity },
    { id: 'powercurve', label: 'PowerCurve', icon: Layers },
  ];

  const servers = [
    { hostname: 'prd-app-srv01.corp', ip: '10.150.10.21', env: 'PROD', os: 'RHEL 9.2', cpu: '16 Cores', ram: '64 GB', disk: '48%', status: 'Active', uptime: '142 days' },
    { hostname: 'prd-app-srv02.corp', ip: '10.150.10.22', env: 'PROD', os: 'RHEL 9.2', cpu: '16 Cores', ram: '64 GB', disk: '52%', status: 'Active', uptime: '142 days' },
    { hostname: 'prd-prov-srv01.corp', ip: '10.150.20.15', env: 'PROD', os: 'RHEL 8.8', cpu: '32 Cores', ram: '128 GB', disk: '64%', status: 'Active', uptime: '98 days' },
    { hostname: 'prd-evam-srv01.corp', ip: '10.150.30.11', env: 'PROD', os: 'RHEL 8.8', cpu: '32 Cores', ram: '128 GB', disk: '41%', status: 'Active', uptime: '110 days' },
    { hostname: 'pre-app-srv01.corp', ip: '10.140.10.11', env: 'PREPROD', os: 'RHEL 9.2', cpu: '8 Cores', ram: '32 GB', disk: '38%', status: 'Active', uptime: '45 days' },
    { hostname: 'tst-app-srv01.corp', ip: '10.130.10.15', env: 'TEST', os: 'RHEL 9.0', cpu: '8 Cores', ram: '32 GB', disk: '61%', status: 'Active', uptime: '12 days' },
    { hostname: 'dev-app-srv01.corp', ip: '10.120.10.18', env: 'DEV', os: 'RHEL 9.2', cpu: '8 Cores', ram: '32 GB', disk: '29%', status: 'Active', uptime: '5 days' },
  ];

  const applications = [
    { name: 'Core Decision Gateway', port: 8443, jvm: '-Xms4g -Xmx8g', java: 'OpenJDK 17.0.9', path: '/opt/deploy/decision-gw', health: 'UP (200 OK)', status: 'Running' },
    { name: 'JBOSS EAP Service Bus', port: 8080, jvm: '-Xms8g -Xmx16g', java: 'OpenJDK 17.0.9', path: '/opt/jboss-eap-7.4', health: 'UP (200 OK)', status: 'Running' },
    { name: 'Provenir Adapter Service', port: 9090, jvm: '-Xms6g -Xmx12g', java: 'OpenJDK 11.0.21', path: '/opt/provenir/adapters', health: 'UP (200 OK)', status: 'Running' },
    { name: 'Evam Stream Ingestor', port: 7070, jvm: '-Xms8g -Xmx16g', java: 'OpenJDK 17.0.9', path: '/opt/evam/engine', health: 'UP (200 OK)', status: 'Running' },
    { name: 'PowerCurve Strategy Executor', port: 9443, jvm: '-Xms4g -Xmx8g', java: 'Oracle JDK 11', path: '/opt/powercurve/runtime', health: 'UP (200 OK)', status: 'Running' },
  ];

  const filteredServers = servers.filter((s) => {
    const matchesEnv = envFilter === 'ALL' || s.env === envFilter;
    const matchesSearch = s.hostname.toLowerCase().includes(searchQuery.toLowerCase()) || s.ip.includes(searchQuery);
    return matchesEnv && matchesSearch;
  });
  const importCheckComplete = checkedImportTab === activeTab;

  return (
    <div className="py-10 max-w-7xl mx-auto px-6">
      {/* Centered Sub-Tabs Bar (Hopewell Donate Now structure) */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-2.5 p-1.5 bg-slate-50/80 rounded-full border border-slate-200/60 shadow-xs">
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  setActiveTab(tab.id);
                  triggerConfetti(e.currentTarget);
                }}
                className={`group px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white border-transparent shadow-[0_8px_20px_-6px_rgba(249,99,50,0.5)]'
                    : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border-slate-200/90 hover:border-orange-300 shadow-xs'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
                <span>{tab.label}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            );
          })}
        </div>
      </div>

      {importedTable && importCheckComplete && <ImportedTableView title={tabs.find((tab) => tab.id === activeTab)?.label || 'Envanter'} table={importedTable} />}
      {!importCheckComplete && <p className="py-16 text-center text-sm text-slate-400">Yüklenen tablo kontrol ediliyor…</p>}

      {/* TAB 1: SUNUCU */}
      {activeTab === 'sunucu' && importCheckComplete && !importedTable && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-bold uppercase text-slate-500 mr-1">Env:</span>
              {(['ALL', 'PROD', 'PREPROD', 'TEST', 'DEV'] as const).map((env) => (
                <button
                  key={env}
                  onClick={() => setEnvFilter(env)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    envFilter === env
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search hostname or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#f96332] outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-5">Hostname & IP</th>
                  <th className="py-3 px-4">Environment</th>
                  <th className="py-3 px-4">Operating System</th>
                  <th className="py-3 px-4">Resources (CPU/RAM)</th>
                  <th className="py-3 px-4">Disk Util</th>
                  <th className="py-3 px-4">Uptime</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 font-sans">
                {filteredServers.map((srv, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-900 font-mono block">{srv.hostname}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{srv.ip}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        srv.env === 'PROD' ? 'bg-rose-50 text-rose-700' :
                        srv.env === 'PREPROD' ? 'bg-amber-50 text-amber-700' :
                        srv.env === 'TEST' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {srv.env}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{srv.os}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{srv.cpu} · {srv.ram}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">{srv.disk}</td>
                    <td className="py-3.5 px-4 text-slate-500">{srv.uptime}</td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{srv.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: UYGULAMA */}
      {activeTab === 'uygulama' && importCheckComplete && !importedTable && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-[#f96332] bg-orange-50 px-2.5 py-1 rounded-lg">
                      Port :{app.port}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{app.status}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{app.name}</h3>
                  <p className="text-xs font-mono text-slate-400 mb-4">{app.path}</p>

                  <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Java Runtime:</span>
                      <span className="font-mono text-slate-800">{app.java}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">JVM Heap Config:</span>
                      <span className="font-mono text-[#f96332] font-semibold">{app.jvm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Health Status:</span>
                      <span className="font-mono text-emerald-700">{app.health}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button 
                    onClick={() => alert(`Triggering heap trace for ${app.name}`)}
                    className="text-xs font-bold text-slate-600 hover:text-[#f96332] transition-colors cursor-pointer"
                  >
                    View Heap Metrics
                  </button>
                  <button 
                    onClick={() => alert(`Restarting ${app.name}... Service gracefully refreshed.`)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                  >
                    Restart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OPENSHIFT */}
      {activeTab === 'openshift' && importCheckComplete && !importedTable && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/80 block">Cluster: ocp4.prod.corp.local</span>
              <h3 className="text-xl font-extrabold tracking-tight mt-1">Red Hat OpenShift Container Platform v4.14</h3>
              <p className="text-xs text-white/90 mt-1">12 Worker Nodes · 3 Control Plane Masters · 128 Deployments</p>
            </div>
            <a 
              href="https://console.apps.prod.cluster.local" 
              target="_blank" 
              rel="noreferrer"
              className="px-5 py-2.5 bg-white text-red-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <span>Open Web Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Namespaces</span>
              <div className="text-2xl font-black text-slate-900">24 Projects</div>
              <span className="text-xs text-slate-500 mt-1 block">dev, test, uat, staging, prod</span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Active Pods</span>
              <div className="text-2xl font-black text-emerald-600">342 Running</div>
              <span className="text-xs text-slate-500 mt-1 block">0 Pending · 0 CrashLoopBackOff</span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">CPU Cluster Allocation</span>
              <div className="text-2xl font-black text-[#f96332]">46.8% Used</div>
              <span className="text-xs text-slate-500 mt-1 block">96 / 192 Cores allocated</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REVERSE PROXY */}
      {activeTab === 'reverse-proxy' && importCheckComplete && !importedTable && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
              NGINX & HAProxy Routing Ingress Rules
            </h3>
            <div className="space-y-3">
              {[
                { domain: 'decision.company.internal', backend: '10.150.10.21:8443, 10.150.10.22:8443', ssl: 'Valid (240 days left)', cert: 'DigiCert Wildcard' },
                { domain: 'provenir-api.company.internal', backend: '10.150.20.15:9090', ssl: 'Valid (180 days left)', cert: 'DigiCert Enterprise' },
                { domain: 'evam-stream.company.internal', backend: '10.150.30.11:7070', ssl: 'Valid (310 days left)', cert: 'Internal CA Root' },
                { domain: 'powercurve.company.internal', backend: '10.150.40.18:9443', ssl: 'Valid (95 days left)', cert: 'DigiCert Wildcard' },
              ].map((route, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 font-mono block text-sm">{route.domain}</span>
                    <span className="text-slate-500 font-mono">Upstream: {route.backend}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      {route.ssl}
                    </span>
                    <span className="text-slate-400 font-mono">{route.cert}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PROVENIR */}
      {activeTab === 'provenir' && importCheckComplete && !importedTable && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
              Provenir Decision Engine Engine Pool
            </h3>
            <p className="text-xs text-slate-500 mb-6">Real-time risk scoring, decision orchestration, and external credit bureau adapters.</p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                <span className="text-[10px] font-bold uppercase text-slate-500">Active Workflows</span>
                <div className="text-xl font-bold text-slate-900 mt-1">18 Strategies</div>
              </div>
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                <span className="text-[10px] font-bold uppercase text-slate-500">Avg Execution Latency</span>
                <div className="text-xl font-bold text-[#f96332] mt-1">42 ms</div>
              </div>
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                <span className="text-[10px] font-bold uppercase text-slate-500">Kafka MQ Queue Depth</span>
                <div className="text-xl font-bold text-slate-900 mt-1">0 Pending</div>
              </div>
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                <span className="text-[10px] font-bold uppercase text-slate-500">Cluster Status</span>
                <div className="text-xl font-bold text-emerald-600 mt-1">Healthy</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: EVAM */}
      {activeTab === 'evam' && importCheckComplete && !importedTable && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
              Evam Real-Time Event Processing Engine
            </h3>
            <p className="text-xs text-slate-500 mb-6">Complex Event Processing (CEP), real-time customer journeys, and transactional triggers.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-bold uppercase">Event Ingestion Throughput</span>
                <div className="text-2xl font-black text-slate-900 mt-1">14,250 events/sec</div>
                <span className="text-xs text-emerald-600 mt-1 block">0 dropped packets</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-bold uppercase">Active Scenarios</span>
                <div className="text-2xl font-black text-[#2ca8ff] mt-1">64 Scenarios</div>
                <span className="text-xs text-slate-500 mt-1 block">Fraud, Offers, Alerts</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-bold uppercase">In-Memory State Store</span>
                <div className="text-2xl font-black text-slate-900 mt-1">38.4 GB / 64 GB</div>
                <span className="text-xs text-slate-500 mt-1 block">RocksDB persistent cache</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: POWERCURVE */}
      {activeTab === 'powercurve' && importCheckComplete && !importedTable && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
              Experian PowerCurve Strategy Management
            </h3>
            <p className="text-xs text-slate-500 mb-6">Decision trees, champion/challenger allocation models, and credit policy scorecards.</p>

            <div className="space-y-3">
              {[
                { model: 'Retail Loan Underwriting Model v4.2', split: '90% Champion / 10% Challenger', version: 'Prod-Release-2026.04', status: 'Deployed' },
                { model: 'Credit Card Limit Increase Strategy v2.1', split: '100% Champion', version: 'Prod-Release-2026.03', status: 'Deployed' },
                { model: 'SME Overdraft Evaluation Model v3.0', split: '80% Champion / 20% Challenger', version: 'Prod-Release-2026.02', status: 'Deployed' },
              ].map((pc, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">{pc.model}</span>
                    <span className="text-slate-500 font-mono">Split: {pc.split} · Build: {pc.version}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full">
                    {pc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
