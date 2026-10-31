import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  HardDrive, 
  Search, 
  Plus,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  LayoutGrid,
  Terminal,
  Briefcase,
  BookOpen,
  Server,
  Activity,
  FileText,
  GitBranch,
  ShieldCheck,
  Box
} from 'lucide-react';
import { QuickAccessTab, BookmarkItem, NfsMountItem } from '../../types';
import { getCategoryIcon, readBookmarkCategories } from '../../data/categories';

interface QuickAccessPageProps {
  initialTab?: QuickAccessTab;
}

export const QuickAccessPage: React.FC<QuickAccessPageProps> = ({ initialTab = 'bookmarks' }) => {
  const [activeTab, setActiveTab] = useState<QuickAccessTab>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const triggerConfetti = (originEl: HTMLElement) => {
    const colors = ['#f96332', '#ea4c10', '#ffb236', '#2ca8ff', '#18ce0f', '#ff3636'];
    const rect = originEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 26; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      const size = Math.random() * 8 + 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = (Math.PI * 2 * i) / 26 + (Math.random() - 0.5) * 0.4;
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

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('murat_bookmarks');
      if (saved) return JSON.parse(saved) as BookmarkItem[];
    } catch {
      // Fall back to the starter bookmarks if saved data cannot be read.
    }

    return [
    {
      id: 'github',
      title: 'GitHub',
      category: 'Dev Tools',
      url: 'https://github.com',
      description: 'Cloud repository hosting, code reviews, and CI/CD workflows.',
    },
    {
      id: 'gitlab',
      title: 'GitLab Self-Hosted',
      category: 'Dev Tools',
      url: 'https://gitlab.company.internal',
      description: 'Enterprise internal Git repositories, CI pipelines, and deployments.',
    },
    {
      id: 'jira',
      title: 'Jira Software',
      category: 'Project Management',
      url: 'https://jira.company.internal',
      description: 'Sprint planning, project tracking, issue backlogs, and agile boards.',
    },
    {
      id: 'confluence',
      title: 'Confluence',
      category: 'Documentation',
      url: 'https://confluence.company.internal',
      description: 'Technical runbooks, architecture diagrams, and company knowledge base.',
    },
    {
      id: 'vcenter',
      title: 'vCenter Web Client',
      category: 'Infrastructure',
      url: 'https://vcenter.internal.infra.net',
      description: 'VMware ESXi clusters, virtual machines, and datastore management.',
    },
    {
      id: 'proxmox',
      title: 'Proxmox VE',
      category: 'Infrastructure',
      url: 'https://proxmox.internal.infra.net:8006',
      description: 'Virtualization platform for VMs, LXC containers, and software-defined storage.',
    },
    {
      id: 'grafana',
      title: 'Grafana Dashboards',
      category: 'Monitoring',
      url: 'https://grafana.internal.infra.net',
      description: 'Real-time telemetry, JVM memory heap, CPU usage, and network graphs.',
    },
    {
      id: 'prometheus',
      title: 'Prometheus',
      category: 'Monitoring',
      url: 'https://prometheus.internal.infra.net:9090',
      description: 'Time-series metrics scraping, target alerts, and PromQL analyzer.',
    },
    {
      id: 'kibana',
      title: 'Kibana / Elasticsearch',
      category: 'Logs',
      url: 'https://kibana.internal.infra.net:5601',
      description: 'Centralized log aggregation, trace indexes, and cluster search queries.',
    },
    {
      id: 'argocd',
      title: 'ArgoCD',
      category: 'DevOps',
      url: 'https://argocd.apps.cluster.local',
      description: 'Declarative GitOps deployment and application synchronization engine.',
    },
    {
      id: 'vault',
      title: 'HashiCorp Vault',
      category: 'Security',
      url: 'https://vault.security.internal:8200',
      description: 'Secret storage, identity management, certificates, and encryption keys.',
    },
    {
      id: 'portainer',
      title: 'Portainer',
      category: 'Containers',
      url: 'https://portainer.internal.infra.net:9443',
      description: 'Docker container, image registry, and volume management dashboard.',
    },
    ];
  });
  const [categories] = useState(readBookmarkCategories);

  const getBookmarkVisuals = (id: string) => {
    switch (id) {
      case 'github':
        return {
          bg: 'bg-slate-100 text-slate-900',
          icon: (
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          ),
        };
      case 'gitlab':
        return {
          bg: 'bg-orange-50 text-[#fc6d26]',
          icon: <GitBranch className="w-4 h-4 text-[#fc6d26]" />,
        };
      case 'jira':
        return {
          bg: 'bg-indigo-50 text-[#6366f1]',
          icon: <Briefcase className="w-4 h-4 text-[#6366f1]" />,
        };
      case 'confluence':
        return {
          bg: 'bg-sky-50 text-[#0284c7]',
          icon: <BookOpen className="w-4 h-4 text-[#0284c7]" />,
        };
      case 'vcenter':
        return {
          bg: 'bg-blue-50 text-[#0ea5e9]',
          icon: <Server className="w-4 h-4 text-[#0ea5e9]" />,
        };
      case 'proxmox':
        return {
          bg: 'bg-slate-100 text-[#64748b]',
          icon: <Server className="w-4 h-4 text-[#64748b]" />,
        };
      case 'grafana':
        return {
          bg: 'bg-purple-50 text-[#8b5cf6]',
          icon: <Activity className="w-4 h-4 text-[#8b5cf6]" />,
        };
      case 'prometheus':
        return {
          bg: 'bg-emerald-50 text-[#10b981]',
          icon: <Activity className="w-4 h-4 text-[#10b981]" />,
        };
      case 'kibana':
        return {
          bg: 'bg-amber-50 text-[#f59e0b]',
          icon: <FileText className="w-4 h-4 text-[#f59e0b]" />,
        };
      case 'argocd':
        return {
          bg: 'bg-orange-50 text-[#f97316]',
          icon: <GitBranch className="w-4 h-4 text-[#f97316]" />,
        };
      case 'vault':
        return {
          bg: 'bg-rose-50 text-[#ef4444]',
          icon: <ShieldCheck className="w-4 h-4 text-[#ef4444]" />,
        };
      case 'portainer':
        return {
          bg: 'bg-cyan-50 text-[#06b6d4]',
          icon: <Box className="w-4 h-4 text-[#06b6d4]" />,
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-600',
          icon: <Bookmark className="w-4 h-4" />,
        };
    }
  };

  const getConnectLabel = (id: string, title: string) => {
    switch (id.toLowerCase()) {
      case 'github':
        return 'Connect with GitHub';
      case 'gitlab':
        return 'Connect with GitLab';
      case 'jira':
        return 'Connect with Jira';
      case 'confluence':
        return 'Connect with Confluence';
      case 'vcenter':
        return 'Connect with vCenter';
      case 'proxmox':
        return 'Connect with Proxmox';
      case 'grafana':
        return 'Connect with Grafana';
      case 'prometheus':
        return 'Connect with Prometheus';
      case 'kibana':
        return 'Connect with Kibana';
      case 'argocd':
        return 'Connect with GitOps';
      case 'vault':
        return 'Connect with Vault';
      case 'portainer':
        return 'Connect with Portainer';
      default:
        if (title.toLowerCase().startsWith('connect with')) {
          return title;
        }
        return `Connect with ${title}`;
    }
  };

  const nfsMounts: NfsMountItem[] = [
    {
      mountPoint: '/mnt/nfs/shared_app_data',
      server: '10.200.40.12:/export/shared_data',
      capacity: '2.0 TB',
      used: '1.42 TB',
      percent: 71,
      status: 'Online',
      protocols: 'NFSv4.2, sec=sys, rw',
    },
    {
      mountPoint: '/mnt/nfs/provenir_runtime_logs',
      server: '10.200.40.15:/export/provenir_logs',
      capacity: '1.5 TB',
      used: '820 GB',
      percent: 54,
      status: 'Mounted',
      protocols: 'NFSv4.1, sec=krb5, rw',
    },
    {
      mountPoint: '/mnt/nfs/jboss_deployments_sync',
      server: '10.200.40.18:/export/jboss_artifacts',
      capacity: '500 GB',
      used: '185 GB',
      percent: 37,
      status: 'Online',
      protocols: 'NFSv4, sec=sys, rw',
    },
    {
      mountPoint: '/mnt/nfs/database_backups_cold',
      server: '10.200.40.22:/export/cold_dumps',
      capacity: '8.0 TB',
      used: '6.9 TB',
      percent: 86,
      status: 'Degraded',
      protocols: 'NFSv3, sec=sys, ro',
    },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const displayedBookmarks = bookmarks.filter((b) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      b.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery =
      searchQuery.trim() === '' ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="py-10 max-w-7xl mx-auto px-6">
      {/* Centered Sub-Tabs Switcher (Hopewell Donate Now structure) */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-3 p-1.5 bg-slate-50/80 rounded-full border border-slate-200/60 shadow-xs">
          <button
            onClick={(e) => {
              setActiveTab('bookmarks');
              triggerConfetti(e.currentTarget);
            }}
            className={`group px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 cursor-pointer border ${
              activeTab === 'bookmarks'
                ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white border-transparent shadow-[0_8px_20px_-6px_rgba(249,99,50,0.5)]'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border-slate-200/90 hover:border-orange-300 shadow-xs'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${activeTab === 'bookmarks' ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
            <span>Bookmarks</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <button
            onClick={(e) => {
              setActiveTab('nfs');
              triggerConfetti(e.currentTarget);
            }}
            className={`group px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 cursor-pointer border ${
              activeTab === 'nfs'
                ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white border-transparent shadow-[0_8px_20px_-6px_rgba(249,99,50,0.5)]'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border-slate-200/90 hover:border-orange-300 shadow-xs'
            }`}
          >
            <HardDrive className={`w-4 h-4 ${activeTab === 'nfs' ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
            <span>NFS (Network File System)</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* TAB 1: BOOKMARKS - Updated Layout matching user screenshot */}
      {activeTab === 'bookmarks' && (
        <div className="flex flex-col lg:flex-row gap-6 items-start animate-in fade-in">
          {/* Left Sidebar: Kategoriler */}
          <div className="w-full lg:w-60 shrink-0 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <div className="px-2 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Kategoriler
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {bookmarks.length}
              </span>
            </div>

            <div className="space-y-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const IconComponent = getCategoryIcon(cat.icon);

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0d1424] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/10' : ''}`}
                        style={isSelected ? undefined : { backgroundColor: `${cat.color}18` }}
                      >
                        <IconComponent
                          className="w-3.5 h-3.5"
                          style={isSelected ? undefined : { color: cat.color }}
                        />
                      </div>
                      <span className="truncate">{cat.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Bookmarks Grid in Rounded Container */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs min-h-[460px] flex flex-col">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-slate-900">
                  {selectedCategory === 'all'
                    ? 'Tüm Kısayollar'
                    : categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {displayedBookmarks.length} Bağlantı
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <input
                    type="text"
                    placeholder="Kısayollarda ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-[#f96332] focus:bg-white outline-none transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>

                <button
                  onClick={() => {
                    const title = prompt('Bookmark Başlığı:');
                    const url = prompt('URL: (e.g. https://...)');
                    const category =
                      prompt(
                        'Kategori (Dev Tools, Project Management, Documentation, Infrastructure, Monitoring, Logs, DevOps, Security, Containers):'
                      ) || 'Dev Tools';
                    if (title && url) {
                      setBookmarks((prev) => [
                        ...prev,
                        {
                          id: `custom-${Date.now()}`,
                          title,
                          url,
                          category,
                          description: 'Kullanıcı tarafından eklendi.',
                        },
                      ]);
                    }
                  }}
                  className="p-1.5 px-3 rounded-lg bg-orange-50 text-[#f96332] hover:bg-[#f96332] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  title="Yeni Kısayol Ekle"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ekle</span>
                </button>
              </div>
            </div>

            {/* Bookmarks List ("Connect with ..." text links like Hero) */}
            {displayedBookmarks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <Bookmark className="w-10 h-10 mb-2 stroke-[1.5] text-slate-300" />
                <p className="text-xs font-semibold">Bu kategoride kısayol bulunamadı.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-5 gap-x-6 py-4 px-2">
                {displayedBookmarks.map((item) => {
                  const visuals = getBookmarkVisuals(item.id);
                  const connectLabel = getConnectLabel(item.id, item.title);
                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#f96332] hover:underline transition-colors cursor-pointer group py-1.5"
                      title={`${connectLabel}\n${item.description}\nURL: ${item.url}`}
                    >
                      <span className="w-4 h-4 shrink-0 flex items-center justify-center text-slate-600 group-hover:text-[#f96332] transition-colors">
                        {item.icon ? (
                          <img src={item.icon} alt="" className="w-4 h-4 object-contain" />
                        ) : visuals.icon}
                      </span>
                      <span className="truncate">{connectLabel}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: NFS */}
      {activeTab === 'nfs' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Storage Provisioned
              </span>
              <div className="text-2xl font-black text-slate-900 tabular-nums">12.0 TB</div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">4 Mounts Active</span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Used Capacity
              </span>
              <div className="text-2xl font-black text-slate-900 tabular-nums">9.32 TB (77%)</div>
              <span className="text-xs text-slate-500 mt-1 block">2.68 TB Available</span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Network Protocol Health
              </span>
              <div className="text-2xl font-black text-[#18ce0f]">Optimal</div>
              <span className="text-xs text-slate-500 mt-1 block">Avg latency &lt; 1.2ms</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Active NFS Mount Points
                </h3>
                <p className="text-xs text-slate-400">Export targets, storage allocations, and mount commands</p>
              </div>
              <button
                onClick={() => alert('Refreshing NFS status... All volumes mounted.')}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Refresh mount states"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {nfsMounts.map((nfs, idx) => (
                <div key={idx} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-[#f96332]">
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 font-mono">
                            {nfs.mountPoint}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              nfs.status === 'Online'
                                ? 'bg-emerald-50 text-emerald-600'
                                : nfs.status === 'Mounted'
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {nfs.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                          Target: {nfs.server} · Options: {nfs.protocols}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleCopy(`sudo mount -t nfs ${nfs.server} ${nfs.mountPoint}`, `nfs-${idx}`)
                        }
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedCmd === `nfs-${idx}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Mount Cmd</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Usage: {nfs.used} of {nfs.capacity}</span>
                      <span className={nfs.percent > 80 ? 'text-rose-600' : 'text-slate-700'}>
                        {nfs.percent}% Used
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          nfs.percent > 80 ? 'bg-rose-500' : nfs.percent > 60 ? 'bg-[#f96332]' : 'bg-[#18ce0f]'
                        }`}
                        style={{ width: `${nfs.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
