import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  UploadCloud, 
  BookmarkCheck, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Key, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  HardDrive,
  RefreshCw,
  Server,
  Layers,
  Cpu,
  Globe,
  Workflow,
  Activity,
  Zap,
  FileSpreadsheet,
  Database,
  FileCheck,
  GitFork,
  Check,
  Link,
  Tag,
  ChevronDown,
  BookOpen,
  FolderOpen,
  Save,
  FilePlus2
} from 'lucide-react';
import { AdminTab, BookmarkItem, NfsMountItem } from '../../types';
import {
  CATEGORY_ICON_OPTIONS,
  DEFAULT_BOOKMARK_CATEGORIES,
  getCategoryIcon,
  readBookmarkCategories,
  saveBookmarkCategories,
  WorkspaceCategory,
} from '../../data/categories';
import {
  backupAndReplaceTable,
  ImportedTableBackup,
  parseSpreadsheetFile,
  readImportBackups,
} from '../../data/spreadsheets';
import {
  BLOG_CATEGORIES,
  BlogArticle,
  getBlogCategoryLabel,
  readBlogPosts,
  readOneNoteConfig,
  saveBlogPosts,
  saveOneNoteConfig,
} from '../../data/knowledge';
import { connectLocalNotesFolder } from '../../data/localNotes';
import { ProjectManagementAdmin } from './ProjectManagementAdmin';

interface AdminPageProps {
  initialTab?: AdminTab;
}

type UploadCategory = 'envanter' | 'project-management';
type EnvanterSubTab = 'sunucu' | 'uygulama' | 'openshift' | 'reverse-proxy' | 'provenir' | 'evam' | 'powercurve';
type ProjectSubTab = 'bulgu-takip' | 'jboss-migration' | 'provenir-migration';

interface TabSchema {
  title: string;
  headers: string[];
  rows: string[][];
}

const makeBookmarkIconDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    const scale = Math.min(1, 128 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('İkon görseli işlenemedi.'));
      return;
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/webp', 0.82);
    URL.revokeObjectURL(objectUrl);
    resolve(dataUrl);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('Seçilen dosya bir görsel olarak açılamadı.'));
  };
  image.src = objectUrl;
});

const ENVANTER_TABS: { id: EnvanterSubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'sunucu', label: 'Sunucu', icon: Server },
  { id: 'uygulama', label: 'Uygulama', icon: Layers },
  { id: 'openshift', label: 'Openshift', icon: Cpu },
  { id: 'reverse-proxy', label: 'Reverse Proxy', icon: Globe },
  { id: 'provenir', label: 'Provenir', icon: Workflow },
  { id: 'evam', label: 'Evam', icon: Activity },
  { id: 'powercurve', label: 'PowerCurve', icon: Zap },
];

const PROJECT_TABS: { id: ProjectSubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'bulgu-takip', label: 'Bulgu Takip', icon: FileCheck },
  { id: 'jboss-migration', label: 'JBOSS 8 Migration', icon: RefreshCw },
  { id: 'provenir-migration', label: 'Provenir Migration', icon: GitFork },
];

const TAB_SCHEMAS: Record<string, TabSchema> = {
  sunucu: {
    title: 'Sunucu Envanteri',
    headers: ['Hostname', 'IP Adresi', 'İşletim Sistemi', 'CPU', 'RAM', 'Durum', 'Veri Merkezi'],
    rows: [
      ['srv-prd-app01', '10.200.10.15', 'RHEL 8.8', '16 Core', '64 GB', 'Aktif', 'İstanbul DC'],
      ['srv-prd-app02', '10.200.10.16', 'RHEL 8.8', '16 Core', '64 GB', 'Aktif', 'İstanbul DC'],
      ['srv-dr-app01', '10.201.10.15', 'RHEL 8.8', '16 Core', '64 GB', 'Standby', 'Ankara DR'],
    ],
  },
  uygulama: {
    title: 'Uygulama Envanteri',
    headers: ['Uygulama Adı', 'Sunucu / Endpoint', 'Port', 'Versiyon', 'Teknoloji', 'Sorumlu Ekip', 'Durum'],
    rows: [
      ['Customer-Portal-API', 'srv-prd-app01', '8080', 'v2.4.1', 'Spring Boot 3', 'Core Banking', 'Aktif'],
      ['Payment-Gateway-Service', 'srv-prd-app02', '8443', 'v3.1.0', 'Java 17', 'Payments', 'Aktif'],
      ['Notification-Engine', 'srv-prd-app01', '9090', 'v1.8.2', 'Node.js', 'Digital Channel', 'Aktif'],
    ],
  },
  openshift: {
    title: 'OpenShift Envanteri',
    headers: ['Cluster / Namespace', 'Pod Adı', 'Replicas', 'CPU Limit', 'Memory Limit', 'Restart', 'Durum'],
    rows: [
      ['prd-core / payments', 'payment-api-7b8f9c-4x2kl', '3/3', '2000m', '4Gi', '0', 'Running'],
      ['prd-core / auth', 'keycloak-sso-9d4e1a-8p9qm', '2/2', '1500m', '3Gi', '1', 'Running'],
      ['prd-core / gateway', 'ingress-router-4c2a1-1z5xy', '4/4', '3000m', '8Gi', '0', 'Running'],
    ],
  },
  'reverse-proxy': {
    title: 'Reverse Proxy Envanteri',
    headers: ['Virtual Host / Domain', 'Backend Adresi', 'SSL / TLS', 'Protokol', 'Upstream Pool', 'Durum'],
    rows: [
      ['api.internal.bank', '10.200.10.15:8080', 'TLSv1.3 Valid', 'HTTPS', 'pool_app_backend', 'Aktif'],
      ['auth.internal.bank', '10.200.10.20:8443', 'TLSv1.3 Valid', 'HTTPS', 'pool_sso_backend', 'Aktif'],
      ['portal.internal.bank', '10.200.10.25:443', 'TLSv1.3 Valid', 'HTTPS', 'pool_portal_backend', 'Aktif'],
    ],
  },
  provenir: {
    title: 'Provenir Karar Motoru Envanteri',
    headers: ['Kredi Karar Akışı', 'Ortam', 'Entegrasyon Sürümü', 'Son Dağıtım Tarihi', 'Tetikleyici', 'Durum'],
    rows: [
      ['Bireysel_Kredi_Onay_v4', 'Production', 'v4.12.0', '2026-10-15', 'REST API', 'Production'],
      ['Kredi_Karti_Limit_Artis', 'UAT', 'v3.2.1', '2026-10-22', 'Kafka Stream', 'Testing'],
      ['Musteri_Skorlama_Batch', 'Production', 'v2.0.4', '2026-10-01', 'Nightly Job', 'Production'],
    ],
  },
  evam: {
    title: 'Evam Complex Event Envanteri',
    headers: ['Senaryo / Kural Adı', 'Event Tipi', 'Gecikme (ms)', 'Filtre / Koşul', 'Çıktı Kanalı', 'Durum'],
    rows: [
      ['Fraud_Süpheli_Islem_Kurali', 'TRANSACTION_EVENT', '12ms', 'Amount > 50000 && NewDevice', 'SMS + Block', 'Aktif'],
      ['Hosgeldin_Kampanya_Tetikleyici', 'LOGIN_EVENT', '8ms', 'FirstLoginOfMonth', 'Push Notification', 'Aktif'],
      ['Limit_Asim_Uyari_Senaryosu', 'BALANCE_CHECK', '15ms', 'Balance < 500', 'E-Posta', 'Aktif'],
    ],
  },
  powercurve: {
    title: 'PowerCurve Risk & Skorlama Envanteri',
    headers: ['Skor Modeli Adı', 'Model Sürümü', 'Hedef Kitle', 'Doğruluk Oranı (AUC)', 'Ort. Yanıt Süresi', 'Durum'],
    rows: [
      ['Scorecard_Retail_2026', 'v2.4', 'Bireysel Müşteriler', '0.892', '45ms', 'Champion'],
      ['SME_Risk_Rating_Model', 'v1.9', 'KOBİ / Ticari', '0.865', '60ms', 'Challenger'],
      ['Micro_Credit_Instant', 'v3.1', 'Dijital Başvuru', '0.914', '30ms', 'Champion'],
    ],
  },
  'bulgu-takip': {
    title: 'Bulgu Takip',
    headers: ['Bulgu No', 'Bulgu Başlığı', 'İlgili Sistem', 'Risk Seviyesi', 'Sorumlu Kişi', 'Termin Tarihi', 'Durum'],
    rows: [
      ['BLG-2026-081', 'SSLv3 ve TLS 1.0/1.1 Eski Şifreleme Protokolleri Devre Dışı Bırakılmalı', 'Reverse Proxy', 'Kritik', 'Murat Karahaliloğlu', '2026-11-15', 'Açık'],
      ['BLG-2026-082', 'JBOSS EAP 7.4 Destek Sonu ve Güvenlik Yaması Güncellemesi', 'Uygulama Sunucuları', 'Yüksek', 'Ahmet Yılmaz', '2026-12-01', 'İncelemede'],
      ['BLG-2026-083', 'NFS Paylaşım İzinlerinin Kerberos (sec=krb5) Seviyesine Yükseltilmesi', 'Storage NFS', 'Orta', 'Mehmet Can', '2026-11-30', 'Devam Ediyor'],
    ],
  },
  'jboss-migration': {
    title: 'JBOSS 8 Migration',
    headers: ['Uygulama Adı', 'Mevcut Sürüm', 'Hedef Sürüm', 'Java Sürümü', 'Elytron Güvenlik Uyumluluğu', 'Test Durumu', 'İlerleme'],
    rows: [
      ['Billing-Core-Service', 'JBOSS 7.4', 'JBOSS EAP 8.0', 'Java 17', 'Tamamlandı', 'Test Ediliyor', '%75'],
      ['CRM-Backend-EJB', 'JBOSS 7.2', 'JBOSS EAP 8.0', 'Java 17', 'Uyarlandı', 'Başarılı', '%100'],
      ['Integration-Gateway', 'JBOSS 7.4', 'JBOSS EAP 8.0', 'Java 17', 'Bekliyor', 'Planlandı', '%25'],
    ],
  },
  'provenir-migration': {
    title: 'Provenir Migration',
    headers: ['Karar Paketi Adı', 'Kaynak Ortam (Provenir v7)', 'Hedef Ortam (Provenir Cloud/v9)', 'Test Skoru', 'Migration Aşaması', 'Onay Durumu'],
    rows: [
      ['Retail-Credit-Decisioning', 'On-Premises v7.8', 'Cloud EAP 9.1', '%99.8 Eşleşme', 'UAT Paralel Koşu', 'Onaylandı'],
      ['Fraud-Detection-Rules', 'On-Premises v7.8', 'Cloud EAP 9.1', '%100 Eşleşme', 'Canlıya Geçiş Hazır', 'Onaylandı'],
      ['Corporate-Limits-Engine', 'On-Premises v7.5', 'Cloud EAP 9.1', '%98.4 Eşleşme', 'Geliştirme', 'Beklemede'],
    ],
  },
};

export const AdminPage: React.FC<AdminPageProps> = ({ initialTab = 'user-management' }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Master Vault State (Default: LOCKED)
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [vaultPassphrase, setVaultPassphrase] = useState('');
  const [vaultError, setVaultError] = useState<string | null>(null);

  // Upload Category & Sub-tab State
  const [uploadCategory, setUploadCategory] = useState<UploadCategory>('envanter');
  const [envanterSubTab, setEnvanterSubTab] = useState<EnvanterSubTab>('uygulama');
  const [projectSubTab, setProjectSubTab] = useState<ProjectSubTab>('bulgu-takip');
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface PreviewData {
    fileName: string;
    fileSize: string;
    target: string;
    targetLabel: string;
    headers: string[];
    rows: string[][];
    allRows: string[][];
    rowCount: number;
  }
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(null);
  const [lastImportBackup, setLastImportBackup] = useState<ImportedTableBackup | null>(null);
  const [importBackupHistory, setImportBackupHistory] = useState<ImportedTableBackup[]>([]);

  useEffect(() => {
    let isCurrent = true;
    readImportBackups()
      .then((backups) => { if (isCurrent) setImportBackupHistory(backups); })
      .catch((error) => {
        if (isCurrent) setImportErrorMessage(error instanceof Error ? error.message : 'Yedek geçmişi okunamadı.');
      });
    return () => { isCurrent = false; };
  }, []);

  // Users Directory State
  const [users, setUsers] = useState([
    {
      id: 'USR-001',
      username: 'Admin',
      fullName: 'System Administrator',
      email: 'admin@workspace.internal',
      role: 'Super Admin',
      status: 'Active',
      lastLogin: 'Az önce',
    },
    {
      id: 'USR-002',
      username: 'murat.k',
      fullName: 'Murat Karahaliloğlu',
      email: 'murat@corp.internal',
      role: 'Lead Architect',
      status: 'Active',
      lastLogin: '10 dk önce',
    },
    {
      id: 'USR-003',
      username: 'sa-jenkins',
      fullName: 'Jenkins Pipeline Agent',
      email: 'ci-pipeline@internal',
      role: 'Service Account',
      status: 'Active',
      lastLogin: '1 saat önce',
    },
    {
      id: 'USR-004',
      username: 'audit.guest',
      fullName: 'External IT Auditor',
      email: 'auditor@external.audit',
      role: 'Read Only',
      status: 'Suspended',
      lastLogin: '3 gün önce',
    },
  ]);

  // Uploaded Files State
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: '1',
      name: 'openshift-cluster-topology.yaml',
      size: '58 KB',
      uploadedBy: 'Admin',
      uploadDate: '2026-10-28',
      type: 'YAML Config',
    },
    {
      id: '2',
      name: 'jboss-eap8-standalone-elytron.xml',
      size: '124 KB',
      uploadedBy: 'Admin',
      uploadDate: '2026-10-26',
      type: 'XML Config',
    },
    {
      id: '3',
      name: 'reverse-proxy-nginx-ssl-bundle.crt',
      size: '16 KB',
      uploadedBy: 'murat.k',
      uploadDate: '2026-10-22',
      type: 'SSL Certificate',
    },
    {
      id: '4',
      name: 'provenir-risk-decision-rules-v4.zip',
      size: '2.4 MB',
      uploadedBy: 'Admin',
      uploadDate: '2026-10-15',
      type: 'Binary Package',
    },
  ]);

  const [uploadDragOver, setUploadDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Quick Access Management Sub-Tabs & Forms State
  type QaManagementSubTab = 'url-ekleme' | 'kategori-ekleme' | 'nfs-ekleme';
  const [qaSubTab, setQaSubTab] = useState<QaManagementSubTab>('url-ekleme');

  // URL Ekleme Form State
  const [newUrlTitle, setNewUrlTitle] = useState('');
  const [newUrlAddress, setNewUrlAddress] = useState('');
  const [newUrlCategory, setNewUrlCategory] = useState('Dev Tools');
  const [newUrlIcon, setNewUrlIcon] = useState('');
  const [urlSuccessMsg, setUrlSuccessMsg] = useState<string | null>(null);

  // Kategori Ekleme Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#0ea5e9');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Globe2');
  const [categoriesList, setCategoriesList] = useState<WorkspaceCategory[]>(readBookmarkCategories);
  const [catSuccessMsg, setCatSuccessMsg] = useState<string | null>(null);

  // Knowledge Hub Admin State
  const [blogPosts, setBlogPosts] = useState<BlogArticle[]>(readBlogPosts);
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleCategory, setNewArticleCategory] = useState(BLOG_CATEGORIES[0].id);
  const [newArticleSummary, setNewArticleSummary] = useState('');
  const [newArticleContent, setNewArticleContent] = useState('');
  const [blogSuccessMsg, setBlogSuccessMsg] = useState<string | null>(null);
  const [oneNoteConfig, setOneNoteConfig] = useState(readOneNoteConfig);
  const [oneNoteConfigMsg, setOneNoteConfigMsg] = useState<string | null>(null);
  const [oneNoteConfigError, setOneNoteConfigError] = useState<string | null>(null);

  // NFS Ekleme Form State
  const [nfsShareName, setNfsShareName] = useState('');
  const [nfsServerHost, setNfsServerHost] = useState('');
  const [nfsSharePath, setNfsSharePath] = useState('');
  const [nfsMountDir, setNfsMountDir] = useState('');
  const [nfsSuccessMsg, setNfsSuccessMsg] = useState<string | null>(null);

  // Quick Access Management Bookmarks
  const [manageBookmarks, setManageBookmarks] = useState<BookmarkItem[]>([
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
  ]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('murat_bookmarks');
      if (saved) setManageBookmarks(JSON.parse(saved) as BookmarkItem[]);
    } catch {
      // Keep the starter bookmark list if saved data is malformed.
    }
  }, []);

  const [manageNfs, setManageNfs] = useState<NfsMountItem[]>([
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
  ]);

  // Confetti helper
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

  // Vault Unlock Handler
  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    setVaultError(null);
    if (vaultPassphrase.trim() === 'Admin1981***' || vaultPassphrase.trim().toLowerCase() === 'admin') {
      setIsVaultLocked(false);
      setVaultPassphrase('');
    } else {
      setVaultError('Hatalı Master Vault şifresi!');
    }
  };

  const activeTargetKey = uploadCategory === 'envanter' ? envanterSubTab : projectSubTab;
  const activeTargetObj = uploadCategory === 'envanter'
    ? ENVANTER_TABS.find((t) => t.id === envanterSubTab)
    : PROJECT_TABS.find((t) => t.id === projectSubTab);

  // Download Sample Excel/CSV Template
  const handleDownloadTemplate = (targetKey: string) => {
    const schema = TAB_SCHEMAS[targetKey];
    if (!schema) return;
    const csvRows = [
      schema.headers.join(','),
      ...schema.rows.map(row => row.map(val => `"${val}"`).join(','))
    ];
    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ornek_sablon_${targetKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void processUpload(e.target.files[0]);
    }
    e.target.value = '';
  };

  const processUpload = async (file: File) => {
    setUploadProgress(10);
    setImportSuccessMessage(null);
    setImportErrorMessage(null);
    setPreviewData(null);
    if (file.size > 10 * 1024 * 1024) {
      setUploadProgress(null);
      setImportErrorMessage('Dosya boyutu 10 MB sınırını aşıyor.');
      return;
    }

    try {
      setUploadProgress(35);
      const parsed = await parseSpreadsheetFile(file);
      setUploadProgress(100);
      setPreviewData({
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        target: activeTargetKey,
        targetLabel: activeTargetObj?.label || 'Veri Tablosu',
        headers: parsed.headers,
        rows: parsed.rows.slice(0, 100),
        allRows: parsed.rows,
        rowCount: parsed.rows.length,
      });
    } catch (error) {
      setImportErrorMessage(error instanceof Error ? error.message : 'Dosya okunamadı.');
    } finally {
      setTimeout(() => setUploadProgress(null), 500);
    }
  };

  const handleConfirmImport = async (e: React.MouseEvent<HTMLElement>) => {
    if (!previewData) return;
    const origin = e.currentTarget;
    try {
      const schema = TAB_SCHEMAS[previewData.target] || TAB_SCHEMAS['uygulama'];
      const backup = await backupAndReplaceTable(
        previewData.target,
        previewData.targetLabel,
        {
          headers: previewData.headers,
          rows: previewData.allRows,
          sourceFile: previewData.fileName,
          importedAt: new Date().toISOString(),
        },
        schema,
      );
      triggerConfetti(origin);
      const newFile = {
        id: Date.now().toString(),
        name: previewData.fileName,
        size: previewData.fileSize,
        uploadedBy: 'Admin',
        uploadDate: new Date().toISOString().split('T')[0],
        type: `${previewData.targetLabel} Excel / CSV`,
      };
      setUploadedFiles((prev) => [newFile, ...prev]);
      setLastImportBackup(backup);
      setImportBackupHistory((previous) => [backup, ...previous.filter((item) => item.id !== backup.id)].slice(0, 40));
      setImportSuccessMessage(`"${previewData.fileName}" yüklendi: mevcut ${previewData.targetLabel} verisi yedeklendi ve ${previewData.rowCount} kayıtla değiştirildi.`);
      setImportErrorMessage(null);
      setPreviewData(null);
    } catch (error) {
      setImportErrorMessage(error instanceof Error ? error.message : 'Yedek oluşturulamadı; mevcut veri değiştirilmedi.');
    }
  };

  const downloadImportBackup = (backup: ImportedTableBackup) => {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${backup.target}-backup-${backup.createdAt.slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-6">
      {/* Sub-Tabs Switcher (Centered Hopewell structure without scale) */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-2.5 p-1.5 bg-slate-50/80 rounded-full border border-slate-200/60 shadow-xs">
          {/* 1. User Management Tab */}
          <button
            onClick={(e) => {
              setActiveTab('user-management');
              triggerConfetti(e.currentTarget);
            }}
            className={`group px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-2.5 shrink-0 cursor-pointer border ${
              activeTab === 'user-management'
                ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white border-transparent shadow-[0_8px_20px_-6px_rgba(249,99,50,0.5)]'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border-slate-200/90 hover:border-orange-300 shadow-xs'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'user-management' ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
            <span>User Management</span>
            {isVaultLocked && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-600 dark:text-rose-200 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Kilitli</span>
              </span>
            )}
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {/* 2. Upload Tab */}
          <button
            onClick={(e) => {
              setActiveTab('upload');
              triggerConfetti(e.currentTarget);
            }}
            className={`group px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-2.5 shrink-0 cursor-pointer border ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white border-transparent shadow-[0_8px_20px_-6px_rgba(249,99,50,0.5)]'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border-slate-200/90 hover:border-orange-300 shadow-xs'
            }`}
          >
            <UploadCloud className={`w-4 h-4 ${activeTab === 'upload' ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
            <span>Upload</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {/* 3. Quick Access Management Tab */}
          <button
            onClick={(e) => {
              setActiveTab('quick-access-management');
              triggerConfetti(e.currentTarget);
            }}
            className={`group px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-2.5 shrink-0 cursor-pointer border ${
              activeTab === 'quick-access-management'
                ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white border-transparent shadow-[0_8px_20px_-6px_rgba(249,99,50,0.5)]'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border-slate-200/90 hover:border-orange-300 shadow-xs'
            }`}
          >
            <BookmarkCheck className={`w-4 h-4 ${activeTab === 'quick-access-management' ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
            <span>Quick Access Management</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {/* 4. Knowledge Hub Settings and Blog */}
          <button
            onClick={(e) => {
              setActiveTab('knowledge-hub');
              triggerConfetti(e.currentTarget);
            }}
            className={`group px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-2.5 shrink-0 cursor-pointer border ${
              activeTab === 'knowledge-hub'
                ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white border-transparent shadow-[0_8px_20px_-6px_rgba(249,99,50,0.5)]'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border-slate-200/90 hover:border-orange-300 shadow-xs'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'knowledge-hub' ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
            <span>Knowledge Hub</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <button
            onClick={(e) => {
              setActiveTab('project-management');
              triggerConfetti(e.currentTarget);
            }}
            className={`group px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-2.5 shrink-0 cursor-pointer border ${
              activeTab === 'project-management'
                ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white border-transparent shadow-[0_8px_20px_-6px_rgba(249,99,50,0.5)]'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border-slate-200/90 hover:border-orange-300 shadow-xs'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === 'project-management' ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
            <span>Project Management</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* =========================================================
          TAB 1: USER MANAGEMENT (MASTER VAULT KİLİTLİ)
      ========================================================= */}
      {activeTab === 'user-management' && (
        <div className="space-y-6 animate-in fade-in">
          {isVaultLocked ? (
            /* MASTER VAULT IS LOCKED SCREEN */
            <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 mx-auto mb-4 flex items-center justify-center border-4 border-rose-100 shadow-sm relative">
                <Lock className="w-10 h-10 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                  !
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-rose-100 text-rose-800 mb-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Master Vault Kilitli</span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Kullanıcı Yönetimi Güvenlik Kasası
              </h2>
              <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                Kullanıcı rolleri, hassas kimlik bilgileri ve sistem erişim anahtarları Master Vault şifrelemesi ile korunmaktadır. Kasayı açmak için yönetici parolasını giriniz.
              </p>

              {vaultError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{vaultError}</span>
                </div>
              )}

              <form onSubmit={handleUnlockVault} className="mt-6 space-y-4 max-w-sm mx-auto">
                <div className="relative">
                  <input
                    type="password"
                    value={vaultPassphrase}
                    onChange={(e) => setVaultPassphrase(e.target.value)}
                    placeholder="Master Vault Şifresi"
                    className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-[#f96332] outline-none transition-all placeholder:text-slate-400"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] hover:from-[#e04e20] hover:to-[#c83c0c] rounded-full shadow-now-primary hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Master Vault Kilidini Aç</span>
                </button>
              </form>
            </div>
          ) : (
            /* MASTER VAULT UNLOCKED: USER MANAGEMENT DASHBOARD */
            <div className="space-y-6">
              {/* Vault Status Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                        Master Vault Kilidi Açıldı (Unlocked)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                        AES-256 Oturumu Aktif
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Kullanıcı rolleri ve kimlik bilgileri düzenlenebilir durumda.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsVaultLocked(true)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
                >
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Vault'u Kilitle</span>
                </button>
              </div>

              {/* Users Table Header & Action */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      Sistem Kullanıcıları ve Yetkilendirme
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Toplam {users.length} aktif kullanıcı hesabı tanımlı
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const newUsername = prompt('Yeni kullanıcı adı giriniz:');
                      const newFullName = prompt('Kullanıcı Adı ve Soyadı:');
                      if (newUsername && newFullName) {
                        setUsers([
                          ...users,
                          {
                            id: `USR-00${users.length + 1}`,
                            username: newUsername,
                            fullName: newFullName,
                            email: `${newUsername.toLowerCase()}@workspace.internal`,
                            role: 'Operator',
                            status: 'Active',
                            lastLogin: 'Yeni oluşturuldu',
                          },
                        ]);
                      }
                    }}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#f96332] to-[#ea4c10] hover:from-[#e04e20] hover:to-[#c83c0c] rounded-full shadow-now-primary flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Kullanıcı Ekle</span>
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-3 font-bold">Kullanıcı</th>
                        <th className="px-6 py-3 font-bold">Rol</th>
                        <th className="px-6 py-3 font-bold">E-Posta</th>
                        <th className="px-6 py-3 font-bold">Durum</th>
                        <th className="px-6 py-3 font-bold">Son Giriş</th>
                        <th className="px-6 py-3 font-bold text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-orange-100 text-[#f96332] font-bold flex items-center justify-center text-xs">
                                {u.username.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{u.fullName}</span>
                                <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-600">{u.email}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{u.lastLogin}</td>
                          <td className="px-6 py-4 text-right">
                            {u.username !== 'Admin' && (
                              <button
                                onClick={() => setUsers(users.filter((item) => item.id !== u.id))}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Kullanıcıyı Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 2: UPLOAD (ENVANTER UPLOAD & PROJECT MANAGEMENT UPLOAD)
      ========================================================= */}
      {activeTab === 'upload' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Level 1 Category Tabs: Envanter Upload vs Project Management Upload */}
          <div className="flex items-center justify-center border-b border-slate-200 gap-8 sm:gap-14 pb-px">
            {/* Envanter Upload */}
            <button
              onClick={(e) => {
                setUploadCategory('envanter');
                setPreviewData(null);
                setImportSuccessMessage(null);
                triggerConfetti(e.currentTarget);
              }}
              className={`pb-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors relative ${
                uploadCategory === 'envanter'
                  ? 'text-slate-900 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              <Database className={`w-4 h-4 ${uploadCategory === 'envanter' ? 'text-[#f96332]' : 'text-slate-400'}`} />
              <span>Envanter Upload</span>
              {uploadCategory === 'envanter' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f96332] rounded-full" />
              )}
            </button>

            {/* Project Management Upload */}
            <button
              onClick={(e) => {
                setUploadCategory('project-management');
                setPreviewData(null);
                setImportSuccessMessage(null);
                triggerConfetti(e.currentTarget);
              }}
              className={`pb-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors relative ${
                uploadCategory === 'project-management'
                  ? 'text-slate-900 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 ${uploadCategory === 'project-management' ? 'text-[#f96332]' : 'text-slate-400'}`} />
              <span>Project Management Upload</span>
              {uploadCategory === 'project-management' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f96332] rounded-full" />
              )}
            </button>
          </div>

          {/* Level 2 Sub-Tabs Bar: Enclosed in a rounded white card container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-1.5 flex items-center justify-start sm:justify-center gap-1 sm:gap-2 overflow-x-auto">
            {uploadCategory === 'envanter' ? (
              ENVANTER_TABS.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = envanterSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      setEnvanterSubTab(tab.id);
                      setPreviewData(null);
                      setImportSuccessMessage(null);
                      triggerConfetti(e.currentTarget);
                    }}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                      isActive
                        ? 'border-b-2 border-b-[#f96332] border-t-transparent border-x-transparent text-slate-900 font-extrabold bg-slate-50'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-[#f96332]' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })
            ) : (
              PROJECT_TABS.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = projectSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      setProjectSubTab(tab.id);
                      setPreviewData(null);
                      setImportSuccessMessage(null);
                      triggerConfetti(e.currentTarget);
                    }}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                      isActive
                        ? 'border-b-2 border-b-[#f96332] border-t-transparent border-x-transparent text-slate-900 font-extrabold bg-slate-50'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-[#f96332]' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Upload Main Card Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
            {/* Card Header (Matches Image 1 and Image 2) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                {uploadCategory === 'envanter' ? (
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Excel / CSV Dosyası Yükle
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Desteklenen formatlar: .xlsx, .csv
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {activeTargetObj?.label} için Excel yükle
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        İlk satır sütun başlığı, alt satırlar kayıt olarak alınır.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Meta info + Download Template Button */}
              <div className="flex items-center gap-3 shrink-0">
                {uploadCategory === 'project-management' && (
                  <span className="hidden md:inline-block text-[11px] text-slate-400 font-medium font-mono">
                    .xlsx veya .csv · En fazla 10 MB
                  </span>
                )}
                <button
                  onClick={() => handleDownloadTemplate(activeTargetKey)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-slate-200/70 shadow-2xs"
                  title="Örnek Şablonu İndir"
                >
                  <Download className="w-3.5 h-3.5 text-[#f96332]" />
                  <span>Örnek Excel Şablonu İndir ({activeTargetObj?.label})</span>
                </button>
              </div>
            </div>

            {/* Success Message Banner if recently imported */}
            {importSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />{importSuccessMessage}</span>
                {lastImportBackup && <button onClick={() => downloadImportBackup(lastImportBackup)} className="px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100">Önceki veriyi indir</button>}
              </div>
            )}
            {importErrorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importErrorMessage}</span>
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setUploadDragOver(true);
              }}
              onDragLeave={() => setUploadDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all cursor-pointer ${
                uploadDragOver
                  ? 'border-[#f96332] bg-orange-50/50'
                  : 'border-slate-300/80 bg-slate-50/30 hover:bg-orange-50/15 hover:border-[#f96332]/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              
              <p className="text-sm font-bold text-slate-800">
                {uploadCategory === 'envanter'
                  ? 'Excel veya CSV dosyasını seçmek için tıklayın ya da buraya sürükleyin'
                  : 'Excel veya CSV dosyası seçmek için tıklayın'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {uploadCategory === 'envanter'
                  ? 'Desteklenen: .xlsx, .csv · Maksimum 10 MB'
                  : 'Yüklemeden önce dosya önizlemesi gösterilir · .xlsx veya .csv'}
              </p>

              {uploadProgress !== null && (
                <div className="mt-5 max-w-xs mx-auto space-y-1.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Dosya Analiz Ediliyor...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#f96332] to-[#ea4c10] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live Table Preview (Tablo Önizlemesi) */}
            {previewData && (
              <div className="space-y-3 pt-2 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-[#f96332]" />
                      <span>{previewData.fileName}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">({previewData.fileSize})</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                      {previewData.rowCount} Kayıt Okundu
                    </span>
                    {previewData.rowCount > previewData.rows.length && <span className="text-[10px] text-slate-400">Önizleme ilk {previewData.rows.length} satır</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConfirmImport}
                      className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Yedekle ve Mevcut Veriyi Değiştir</span>
                    </button>
                    <button
                      onClick={() => setPreviewData(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      İptal
                    </button>
                  </div>
                </div>

                {/* Table Render */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                        {previewData.headers.map((h, i) => (
                          <th key={i} className="px-4 py-2.5 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {previewData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-4 py-2.5 font-medium text-slate-700 whitespace-nowrap font-mono">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Files History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Yüklenen Sistem ve Envanter Dosyaları
                </h3>
                <p className="text-xs text-slate-400">Depolanan yapılandırma, envanter ve takip varlıkları</p>
              </div>
              <span className="text-xs font-bold text-slate-500 font-mono">
                {uploadedFiles.length} Dosya
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-orange-50 text-[#f96332]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 font-mono block">
                        {file.name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {file.size} · {file.type} · Yükleyen: {file.uploadedBy} · {file.uploadDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`${file.name} indirme simülasyonu başlatıldı.`)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="İndir"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setUploadedFiles(uploadedFiles.filter((f) => f.id !== file.id))}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {importBackupHistory.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Veri Yedekleri</h3>
                <p className="text-xs text-slate-400">Her içe aktarma öncesinde değiştirilen mevcut veri burada yedeklenir.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {importBackupHistory.slice(0, 8).map((backup) => (
                  <div key={backup.id} className="px-6 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-800">{backup.targetLabel}</span>
                      <span className="block text-[11px] text-slate-400 truncate">{new Date(backup.createdAt).toLocaleString()} · {backup.previous.sourceFile} · {backup.previous.rows.length} kayıt</span>
                    </div>
                    <button onClick={() => downloadImportBackup(backup)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                      <Download className="w-3.5 h-3.5" /> İndir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 3: QUICK ACCESS MANAGEMENT (URL Ekleme, Kategori Ekleme, NFS Ekleme)
      ========================================================= */}
      {activeTab === 'quick-access-management' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Sub-Tabs Navigation matching user screenshot */}
          <div className="flex items-center justify-center gap-8 border-b border-slate-200/80 mb-6">
            <button
              onClick={() => setQaSubTab('url-ekleme')}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all border-b-2 -mb-[1px] ${
                qaSubTab === 'url-ekleme'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Link className="w-4 h-4" />
              <span>URL Ekleme</span>
            </button>

            <button
              onClick={() => setQaSubTab('kategori-ekleme')}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all border-b-2 -mb-[1px] ${
                qaSubTab === 'kategori-ekleme'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Kategori Ekleme</span>
            </button>

            <button
              onClick={() => setQaSubTab('nfs-ekleme')}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all border-b-2 -mb-[1px] ${
                qaSubTab === 'nfs-ekleme'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>NFS (Network File System) Ekleme</span>
            </button>
          </div>

          {/* 1. URL Ekleme Tab */}
          {qaSubTab === 'url-ekleme' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                <div className="flex items-start gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Link className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">URL Ekleme</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bookmarks alanında görünecek bağlantıyı oluşturun.
                    </p>
                  </div>
                </div>

                {urlSuccessMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{urlSuccessMsg}</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newUrlTitle.trim() || !newUrlAddress.trim()) return;

                    const newBookmark: BookmarkItem = {
                      id: `custom-${Date.now()}`,
                      title: newUrlTitle.trim(),
                      url: newUrlAddress.trim(),
                      category: newUrlCategory,
                      description: 'Admin Quick Access Management tarafından eklendi.',
                      icon: newUrlIcon.trim() || undefined,
                      favorite: true,
                    };

                    const updated = [...manageBookmarks, newBookmark];
                    setManageBookmarks(updated);
                    localStorage.setItem('murat_bookmarks', JSON.stringify(updated));
                    setUrlSuccessMsg(`"${newUrlTitle}" bağlantısı başarıyla Bookmarks alanına kaydedildi.`);
                    setNewUrlTitle('');
                    setNewUrlAddress('');
                    setNewUrlIcon('');
                    setTimeout(() => setUrlSuccessMsg(null), 3500);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Başlık */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">Başlık</label>
                      <input
                        type="text"
                        placeholder="Öm: GitHub"
                        value={newUrlTitle}
                        onChange={(e) => setNewUrlTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                        required
                      />
                    </div>

                    {/* URL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">URL</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={newUrlAddress}
                        onChange={(e) => setNewUrlAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                        required
                      />
                    </div>

                    {/* Kategori Seçimi */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">Kategori Seçimi</label>
                      <div className="relative">
                        <select
                          value={newUrlCategory}
                          onChange={(e) => setNewUrlCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none cursor-pointer text-slate-800 font-medium"
                        >
                          {categoriesList.filter((cat) => cat.id !== 'all').map((cat) => (
                            <option key={cat.id} value={cat.label}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    {/* İkon URL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">İkon URL'si</label>
                      <input
                        type="text"
                        placeholder="https://ornek.com/favicon.ico"
                        value={newUrlIcon}
                        onChange={(e) => setNewUrlIcon(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                      />
                      <label className="block text-xs font-bold text-slate-800 mt-3 mb-1.5">veya görsel yükle</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            alert('İkon görseli 10 MB sınırını aşıyor.');
                            e.target.value = '';
                            return;
                          }
                          try {
                            setNewUrlIcon(await makeBookmarkIconDataUrl(file));
                          } catch (error) {
                            alert(error instanceof Error ? error.message : 'İkon görseli yüklenemedi.');
                          }
                        }}
                        className="w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>

                  {/* Form Footer */}
                  <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <Link className="w-4 h-4 text-slate-400" />
                      <span>İkon önizlemesi</span>
                      {newUrlIcon && (
                        <img
                          src={newUrlIcon}
                          alt="Önizleme"
                          className="w-4 h-4 object-contain ml-1"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      )}
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>URL Kaydet</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing URLs list */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Kayıtlı Bookmarks ({manageBookmarks.length})</h4>
                    <p className="text-xs text-slate-400">Aktif kısayollar ve hedef bağlantılar</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {manageBookmarks.map((b) => (
                    <div key={b.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {b.icon && <img src={b.icon} alt="" className="w-4 h-4 object-contain" />}
                          <span className="text-xs sm:text-sm font-bold text-slate-900">{b.title}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {b.category}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-blue-600 truncate block max-w-md">{b.url}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Yeni Sekmede Aç"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => {
                            const filtered = manageBookmarks.filter((item) => item.id !== b.id);
                            setManageBookmarks(filtered);
                            localStorage.setItem('murat_bookmarks', JSON.stringify(filtered));
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Kategori Ekleme Tab matching user screenshot */}
          {qaSubTab === 'kategori-ekleme' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Add Category Form Box */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                <div className="flex items-start gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Kategori Ekleme</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bookmarks için yeni kategori oluşturun.
                    </p>
                  </div>
                </div>

                {catSuccessMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{catSuccessMsg}</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = newCategoryName.trim();
                    if (!trimmed) return;
                    if (categoriesList.some((category) => category.label.toLowerCase() === trimmed.toLowerCase())) {
                      alert('Bu kategori adı zaten mevcut.');
                      return;
                    }
                    const newCategory: WorkspaceCategory = {
                      id: trimmed,
                      label: trimmed,
                      color: newCategoryColor,
                      icon: newCategoryIcon,
                    };
                    const updated = [...categoriesList, newCategory];
                    setCategoriesList(updated);
                    saveBookmarkCategories(updated);
                    setCatSuccessMsg(`"${trimmed}" kategorisi başarıyla eklendi.`);
                    setNewCategoryName('');
                    setTimeout(() => setCatSuccessMsg(null), 3000);
                  }}
                  className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_150px_190px_auto] items-end gap-3"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">Kategori adı</label>
                    <input
                      type="text"
                      placeholder="Yeni kategori adı"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">Renk</label>
                    <div className="flex items-center gap-2 px-2 py-1.5 border border-slate-200 rounded-xl">
                      <input
                        type="color"
                        value={newCategoryColor}
                        onChange={(e) => setNewCategoryColor(e.target.value)}
                        className="h-7 w-8 cursor-pointer border-0 bg-transparent"
                        aria-label="Kategori rengi"
                      />
                      <span className="text-[11px] font-mono text-slate-500">{newCategoryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">İkon</label>
                    <select
                      value={newCategoryIcon}
                      onChange={(e) => setNewCategoryIcon(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl"
                    >
                      {CATEGORY_ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Kategori Ekle</span>
                  </button>
                </form>
              </div>

              {/* Existing Categories Box matching screenshot */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-white">
                  <h4 className="text-sm font-bold text-slate-900">Mevcut Kategoriler</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{categoriesList.length} kategori tanımlı</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {categoriesList.map((category) => {
                    const CategoryIcon = getCategoryIcon(category.icon);
                    const bookmarkCount = manageBookmarks.filter(
                      (b) => b.category.toLowerCase() === category.label.toLowerCase()
                    ).length;

                    return (
                      <div
                        key={category.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: category.color, backgroundColor: `${category.color}18` }}>
                            <CategoryIcon className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-slate-800 block">{category.label}</span>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">{bookmarkCount} yer imi · {category.color}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {bookmarkCount > 0 ? (
                            <>
                              <span className="text-xs text-slate-400 hidden sm:inline">
                                Önce yer imlerini URL Ekleme sekmesinden silin
                              </span>
                              <Trash2 className="w-4 h-4 text-slate-300 cursor-not-allowed" />
                            </>
                          ) : !DEFAULT_BOOKMARK_CATEGORIES.some((defaultCategory) => defaultCategory.id === category.id) ? (
                            <button
                              onClick={() => {
                                const updated = categoriesList.filter((item) => item.id !== category.id);
                                setCategoriesList(updated);
                                saveBookmarkCategories(updated);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Kategoriyi Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : <span className="text-[11px] text-slate-400">Varsayılan kategori</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. NFS Ekleme Tab matching user screenshot */}
          {qaSubTab === 'nfs-ekleme' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                <div className="flex items-start gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">NFS (Network File System) Ekleme</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      NFS paylaşımını kaydedin; Quick Access'ten içindeki dosyalara göz atın.
                    </p>
                  </div>
                </div>

                {nfsSuccessMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{nfsSuccessMsg}</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!nfsShareName.trim() || !nfsServerHost.trim()) return;

                    const newNfs: NfsMountItem = {
                      mountPoint: nfsSharePath.trim() || `/mnt/nfs/${nfsShareName.toLowerCase().replace(/\s+/g, '_')}`,
                      server: `${nfsServerHost.trim()}:${nfsMountDir.trim() || '/export/data'}`,
                      capacity: '2.0 TB',
                      used: '120 GB',
                      percent: 6,
                      status: 'Online',
                      protocols: 'NFSv4.2, sec=sys, rw',
                    };

                    setManageNfs([...manageNfs, newNfs]);
                    setNfsSuccessMsg(`"${nfsShareName}" NFS paylaşımı başarıyla kaydedildi.`);
                    setNfsShareName('');
                    setNfsServerHost('');
                    setNfsSharePath('');
                    setNfsMountDir('');
                    setTimeout(() => setNfsSuccessMsg(null), 3500);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Paylaşım Adı */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">Paylaşım Adı</label>
                      <input
                        type="text"
                        placeholder="Öm: Proje Dosyaları"
                        value={nfsShareName}
                        onChange={(e) => setNfsShareName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                        required
                      />
                    </div>

                    {/* NFS Sunucusu */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">NFS Sunucusu</label>
                      <input
                        type="text"
                        placeholder="192.168.1.20 veya nfs.example.local"
                        value={nfsServerHost}
                        onChange={(e) => setNfsServerHost(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                        required
                      />
                    </div>

                    {/* NFS Paylaşım Yolu */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">NFS Paylaşım Yolu</label>
                      <input
                        type="text"
                        placeholder="/exports/shared"
                        value={nfsSharePath}
                        onChange={(e) => setNfsSharePath(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                        required
                      />
                    </div>

                    {/* Sunucudaki Bağlı Dizin */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">Sunucudaki Bağlı Dizin</label>
                      <input
                        type="text"
                        placeholder="projeler/paylasim"
                        value={nfsMountDir}
                        onChange={(e) => setNfsMountDir(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                        required
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        NFS_ROOT altında mount edilmiş göreli yol.
                      </p>
                    </div>
                  </div>

                  {/* Form Submit Button */}
                  <div className="flex justify-end pt-4 mt-6">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>NFS Paylaşımını Kaydet</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Registered NFS Shares Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Tanımlı NFS Paylaşımları ({manageNfs.length})</h4>
                    <p className="text-xs text-slate-400">Aktif NFS export noktaları ve bağlantı durumları</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {manageNfs.map((nfs, idx) => (
                    <div key={idx} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                          <HardDrive className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold font-mono text-slate-900">{nfs.mountPoint}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                              {nfs.status}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            Hedef: {nfs.server} · Kapasite: {nfs.capacity}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setManageNfs(manageNfs.filter((_, i) => i !== idx))}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'knowledge-hub' && (
        <div className="space-y-6 animate-in fade-in">
          <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex items-start gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">OneNote Kaynağı</h3>
                <p className="text-xs text-slate-500 mt-0.5">Knowledge Hub içindeki OneNote sekmesinde açılacak adresi veya yerel not klasörünü ayarlayın.</p>
              </div>
            </div>

            {oneNoteConfigMsg && <p className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">{oneNoteConfigMsg}</p>}
            {oneNoteConfigError && <p className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">{oneNoteConfigError}</p>}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const sourceUrl = oneNoteConfig.sourceUrl.trim();
                if (sourceUrl && !/^https:\/\//i.test(sourceUrl)) {
                  setOneNoteConfigError('OneNote web adresi https:// ile başlamalıdır.');
                  setOneNoteConfigMsg(null);
                  return;
                }
                saveOneNoteConfig({ ...oneNoteConfig, sourceUrl });
                setOneNoteConfig({ ...oneNoteConfig, sourceUrl });
                setOneNoteConfigError(null);
                setOneNoteConfigMsg('OneNote kaynağı kaydedildi.');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">OneNote / web notebook https adresi</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={oneNoteConfig.sourceUrl}
                  onChange={(e) => setOneNoteConfig({ ...oneNoteConfig, sourceUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Windows klasör yolu (isteğe bağlı)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="C:\\Users\\Murat\\Documents\\OneNote"
                    value={oneNoteConfig.windowsPath}
                    onChange={(e) => setOneNoteConfig({ ...oneNoteConfig, windowsPath: e.target.value, localFolderName: '' })}
                    className="w-full flex-1 px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      setOneNoteConfigError(null);
                      try {
                        const localFolderName = await connectLocalNotesFolder();
                        const updatedConfig = { ...oneNoteConfig, localFolderName };
                        setOneNoteConfig(updatedConfig);
                        saveOneNoteConfig(updatedConfig);
                        setOneNoteConfigMsg(`Yerel klasör bağlandı: ${localFolderName}`);
                      } catch (error) {
                        setOneNoteConfigError(error instanceof Error ? error.message : 'Klasör bağlantısı kurulamadı.');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Klasör Seç
                  </button>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  Tarayıcı Windows yolunu tek başına açamaz. Klasör Seç ile izin verin; bu klasördeki .md, .txt ve .html sayfaları düzenlenip aynı dosyalara kaydedilebilir.
                </p>
                {oneNoteConfig.localFolderName && <p className="mt-1 text-[11px] font-semibold text-emerald-700">Bağlı klasör: {oneNoteConfig.localFolderName}</p>}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  OneNote Ayarlarını Kaydet
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex items-start gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f96332] flex items-center justify-center shrink-0">
                <FilePlus2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Blog Makalesi Ekle</h3>
                <p className="text-xs text-slate-500 mt-0.5">Yayınlanan makaleler Blog sekmesinde ve ana ekrandaki son beş yazıda görünür.</p>
              </div>
            </div>

            {blogSuccessMsg && <p className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">{blogSuccessMsg}</p>}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const article: BlogArticle = {
                  id: `article-${Date.now()}`,
                  title: newArticleTitle.trim(),
                  category: newArticleCategory,
                  publishedAt: new Date().toISOString().slice(0, 10),
                  readTime: `${Math.max(1, Math.ceil(newArticleContent.trim().split(/\s+/).length / 180))} min read`,
                  summary: newArticleSummary.trim(),
                  content: newArticleContent.trim(),
                };
                const updated = [article, ...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
                setBlogPosts(updated);
                saveBlogPosts(updated);
                setNewArticleTitle('');
                setNewArticleSummary('');
                setNewArticleContent('');
                setBlogSuccessMsg('Makale Blog ve ana sayfadaki son yazılar bölümüne eklendi.');
                setTimeout(() => setBlogSuccessMsg(null), 3500);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Makale başlığı</label>
                  <input required value={newArticleTitle} onChange={(e) => setNewArticleTitle(e.target.value)} className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl" placeholder="Makale başlığı" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Kategori</label>
                  <select value={newArticleCategory} onChange={(e) => setNewArticleCategory(e.target.value)} className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl">
                    {BLOG_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Özet</label>
                <textarea required rows={2} value={newArticleSummary} onChange={(e) => setNewArticleSummary(e.target.value)} className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl resize-y" placeholder="Kartlarda ve ana sayfada gösterilecek kısa özet" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Makale içeriği</label>
                <textarea required rows={8} value={newArticleContent} onChange={(e) => setNewArticleContent(e.target.value)} className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl resize-y" placeholder="Makale metni" />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Makaleyi Yayınla
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Yayınlanan makaleler</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ana sayfada en yeni beş makale gösterilir.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {[...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).map((article) => (
                <div key={article.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: BLOG_CATEGORIES.find((category) => category.id === article.category)?.color || '#f96332' }}>{getBlogCategoryLabel(article.category)}</span>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{article.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{article.summary}</p>
                  </div>
                  <button
                    onClick={() => {
                      const updated = blogPosts.filter((post) => post.id !== article.id);
                      setBlogPosts(updated);
                      saveBlogPosts(updated);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Makaleyi sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'project-management' && <ProjectManagementAdmin />}
    </div>
  );
};
