export type PageView = 
  | 'home' 
  | 'quick-access' 
  | 'environment' 
  | 'project-management' 
  | 'tools' 
  | 'knowledge-hub'
  | 'json-studio'
  | 'chmod-calculator'
  | 'ssl-certificate-checker'
  | 'login'
  | 'admin';

export type AdminTab = 'user-management' | 'upload' | 'quick-access-management' | 'knowledge-hub' | 'project-management';

export interface UserSession {
  username: string;
  fullName: string;
  role: 'Admin' | 'User';
  email: string;
  isLoggedIn: boolean;
}

export type QuickAccessTab = 'bookmarks' | 'nfs';

export type EnvironmentTab = 
  | 'sunucu' 
  | 'uygulama' 
  | 'openshift' 
  | 'reverse-proxy' 
  | 'provenir' 
  | 'evam' 
  | 'powercurve';

export type ProjectManagementTab = 
  | 'bulgu-takip' 
  | 'jboss-migration' 
  | 'provenir-migration' 
  | 'todo'
  | 'projects'
  | 'kanban';

export type ProjectTodoStatus = 'ACTIVE' | 'WAITING' | 'COMPLETED';
export type ProjectStatus = 'ONGOING' | 'CANCELLED' | 'FINISHED' | 'POSTPONED' | 'INACTIVE';

export interface ProjectTodo {
  id: string;
  title: string;
  description: string;
  status: ProjectTodoStatus;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  dueDate: string;
  createdAt: string;
}

export interface ProjectRecord {
  id: string;
  title: string;
  client: string;
  projectLead: string;
  team: string[];
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  budget: string;
  privacy: 'Public' | 'Internal' | 'Private';
  taskCount: number;
  completedTaskCount: number;
  overview: string;
  tags: string[];
  updatedAt: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  category: 'BUG' | 'ISSUE' | 'FEATURE' | 'TASK';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  assignees: string[];
  attachmentCount: number;
  checklistDone: number;
  checklistTotal: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  tasks: KanbanTask[];
}

export interface KanbanBoard {
  id: string;
  title: string;
  description: string;
  columns: KanbanColumn[];
  updatedAt: string;
}

export type KnowledgeHubTab = 'onenote' | 'blog' | 'release' | 'education';

export type ReleaseVerificationStatus = 'Verified' | 'Unverified' | 'Needs Review';

export interface ReleaseProduct {
  id: string;
  name: string;
  vendor: string;
  category: string;
  description: string;
  logo: string | null;
  dataFile: string;
  trackingEnabled: boolean;
  installedVersion: string | null;
}

export interface ReleaseNotesSummary {
  newFeatures?: string[];
  improvements?: string[];
  bugFixes?: string[];
  securityFixes?: string[];
  breakingChanges?: string[];
  knownIssues?: string[];
  upgradeNotes?: string[];
}

export interface ReleaseSource {
  id: string;
  productId: string;
  name: string;
  url: string;
  sourceType: 'HTML' | 'PDF' | 'JSON' | 'RSS' | 'API';
  purpose: string;
  enabled: boolean;
  lastCheckedAt: string | null;
  lastVerifiedAt: string | null;
  verificationStatus: ReleaseVerificationStatus;
}

export interface ReleaseArtifact {
  filename: string;
  packageType: string;
  platform: string;
  architecture: string;
  downloadUrl: string | null;
  checksum: string | null;
}

export interface ReleaseCompatibilityEntry {
  id: string;
  category: 'Java' | 'Operating Systems' | 'Architecture' | 'Database' | 'JMS';
  name: string;
  details: string | null;
  scope: string;
  sourceId: string;
  verificationStatus: ReleaseVerificationStatus;
}

export interface ReleaseLifecyclePhase {
  phase: string;
  startDate: string | null;
  endDate: string | null;
  duration: string | null;
  sourceId: string;
  verificationStatus: ReleaseVerificationStatus;
}

export interface ProductRelease {
  id: string;
  productId: string;
  version: string;
  releaseLine: string;
  releaseType: string;
  releaseChannel: string | null;
  publishedAt: string | null;
  directoryModifiedAt: string | null;
  status: string;
  prerelease: boolean;
  releaseNotesUrl: string | null;
  downloadUrl: string | null;
  documentationUrl: string | null;
  sourceUrl: string;
  verificationStatus: ReleaseVerificationStatus;
  firstSeenAt: string | null;
  lastVerifiedAt: string | null;
  artifacts: ReleaseArtifact[];
  compatibilityScope: string | null;
  compatibilitySourceIds: string[];
  lifecycleSourceId: string | null;
  releaseNotes: ReleaseNotesSummary;
}

export interface ProductReleaseData {
  productId: string;
  lastVerifiedAt: string | null;
  releases: ProductRelease[];
  compatibility: ReleaseCompatibilityEntry[];
  lifecycle: ReleaseLifecyclePhase[];
}

export type SSLCheckStatus =
  | 'Valid'
  | 'Expiring Soon'
  | 'Expired'
  | 'Hostname Mismatch'
  | 'Untrusted / Chain Error'
  | 'Connection Error';

export interface CertificateChainEntry {
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  fingerprintSha256: string;
}

export interface CertificateDetails {
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  subjectAltNames: string[];
  fingerprintSha256: string;
  signatureAlgorithm: string | null;
  publicKeyAlgorithm: string | null;
  publicKeySizeBits: number | null;
  publicKeyCurve: string | null;
  chain: CertificateChainEntry[];
}

export interface SSLCheckResponse {
  target: { host: string; port: number; protocol: 'https:' };
  checkedAt: string;
  status: SSLCheckStatus;
  tls: {
    handshakeEstablished: boolean;
    verificationPassed: boolean;
    protocol: string | null;
    cipher: string | null;
  };
  checks: {
    hostnameMatches: boolean | null;
    hostnameMessage: string;
    chainTrusted: boolean | null;
    chainMessage: string;
    validityPassed: boolean | null;
    validityMessage: string;
    daysUntilExpiry: number | null;
  };
  certificate: CertificateDetails | null;
  error: { code: string; message: string } | null;
}

export interface CertificateHistoryRecord {
  id: string;
  commonName: string;
  names: string[];
  issuer: string;
  notBefore: string | null;
  notAfter: string | null;
  loggedAt: string | null;
  serialNumber: string;
}

export interface CertificateHistoryResponse {
  domain: string;
  sourceUrl: string;
  checkedAt: string;
  records: CertificateHistoryRecord[];
}

export interface CodeSnippet {
  title: string;
  category: string;
  code: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
  icon?: string;
  favorite?: boolean;
}

export interface NfsMountItem {
  mountPoint: string;
  server: string;
  capacity: string;
  used: string;
  percent: number;
  status: 'Online' | 'Degraded' | 'Mounted';
  protocols: string;
}

export interface FindingItem {
  id: string;
  title: string;
  system: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Under Review';
  assignee: string;
  dueDate: string;
  description: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  dueDate?: string;
}
