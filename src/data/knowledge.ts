export interface BlogArticle {
  id: string;
  title: string;
  publishedAt: string;
  category: string;
  summary: string;
  content: string;
  readTime: string;
}

export interface OneNotePage {
  id: string;
  section: string;
  title: string;
  content: string;
  updatedAt: string;
  sourceFile?: string;
}

export interface OneNoteConfig {
  sourceUrl: string;
  windowsPath: string;
  localFolderName: string;
}

export const BLOG_POSTS_KEY = 'murat_blog_posts';
export const ONENOTE_PAGES_KEY = 'murat_onenote_pages';
export const ONENOTE_CONFIG_KEY = 'murat_onenote_config';

export const BLOG_CATEGORIES = [
  { id: 'JBOSS', label: 'JBOSS', color: '#2563eb', icon: 'Server' },
  { id: 'Nginx', label: 'Nginx', color: '#16a34a', icon: 'Globe2' },
  { id: 'PowerCurve', label: 'PowerCurve', color: '#7c3aed', icon: 'Activity' },
  { id: 'Evam', label: 'Evam', color: '#ea580c', icon: 'Zap' },
  { id: 'Provenir', label: 'Provenir', color: '#0891b2', icon: 'Workflow' },
  { id: 'Apache', label: 'Apache', color: '#dc2626', icon: 'Network' },
  { id: 'OpenShift', label: 'Openshift', color: '#d946ef', icon: 'Boxes' },
  { id: 'Istio', label: 'İstio', color: '#4f46e5', icon: 'GitBranch' },
  { id: 'Troubleshooting', label: 'Troubleshooting', color: '#64748b', icon: 'Wrench' },
];

export const getBlogCategoryLabel = (categoryId: string) =>
  BLOG_CATEGORIES.find((category) => category.id === categoryId)?.label || categoryId;

export const PRODUCT_HUB_CATEGORIES = [
  { id: 'jboss-eap', label: 'JBoss EAP', color: '#2563eb', icon: 'Server' },
  { id: 'apache-http-server', label: 'Apache HTTP Server', color: '#dc2626', icon: 'Network' },
  { id: 'nginx', label: 'NGINX', color: '#16a34a', icon: 'Globe2' },
  { id: 'apache-tomcat', label: 'Apache Tomcat', color: '#ea580c', icon: 'Boxes' },
  { id: 'azul-zulu', label: 'Azul Zulu', color: '#0891b2', icon: 'Cpu' },
  { id: 'node-js', label: 'Node.js', color: '#65a30d', icon: 'Code2' },
];

export const DEFAULT_BLOG_POSTS: BlogArticle[] = [
  {
    id: 'jboss-eap-8-migration',
    title: 'JBOSS EAP 8 Migration: From javax to jakarta Namespace',
    publishedAt: '2026-10-27',
    readTime: '6 min read',
    category: 'JBOSS',
    summary: 'An engineering walkthrough of the namespace migration, dependency cleanup, and Elytron security changes behind the EAP 8 upgrade.',
    content: `Moving from JBOSS EAP 7.4 to EAP 8 requires coordinated updates across application code, dependencies, and server configuration.\n\nThe main work is replacing legacy javax APIs with jakarta APIs, auditing transitive dependencies, and migrating security configuration to Elytron. A staged rollout with repeatable smoke tests helps catch compatibility issues before production traffic moves.`,
  },
  {
    id: 'provenir-cloud-clustering',
    title: 'Provenir Decision Engine Performance and Cloud Clustering',
    publishedAt: '2026-10-24',
    readTime: '8 min read',
    category: 'Provenir',
    summary: 'Patterns for worker sizing, Kafka communication, and resilient decisioning across availability zones.',
    content: `Decision engine latency is shaped by queue depth, adapter concurrency, and network round trips. Start with measured baselines, then tune worker pools and connection reuse against representative traffic.\n\nKeep cluster health checks independent from long-running decision requests, and make failover behavior visible in operational dashboards.`,
  },
  {
    id: 'evam-kafka-streaming',
    title: 'Real-Time Streaming Journeys with Evam and Kafka',
    publishedAt: '2026-10-21',
    readTime: '5 min read',
    category: 'Evam',
    summary: 'A practical look at event handling, consumer lag, and delivery guarantees in streaming integrations.',
    content: `Reliable event processing starts with clear delivery semantics and observable consumer lag. Partition keys should preserve the ordering your rules depend on, while retry queues keep malformed events from blocking healthy traffic.\n\nTrack end-to-end latency alongside throughput so capacity changes can be made before backlogs grow.`,
  },
  {
    id: 'nginx-tls-rollover',
    title: 'Zero-Downtime TLS Certificate Rollover with NGINX',
    publishedAt: '2026-10-18',
    readTime: '4 min read',
    category: 'Nginx',
    summary: 'A repeatable certificate update process that validates configuration before gracefully reloading traffic.',
    content: `Prepare the replacement certificate and key, validate the NGINX configuration, and confirm the full certificate chain before reloading. Keep the previous files available until the new listener has passed an external health check.\n\nA graceful reload lets existing workers finish active connections while new workers use the updated TLS material.`,
  },
  {
    id: 'openshift-pod-triage',
    title: 'A Fast Troubleshooting Checklist for OpenShift Pods',
    publishedAt: '2026-10-15',
    readTime: '7 min read',
    category: 'Troubleshooting',
    summary: 'A concise flow for checking events, previous container logs, probes, and resource limits when a workload fails.',
    content: `Begin with pod events and the deployment rollout status. If a container restarted, inspect its previous logs before changing the workload. Then compare readiness and liveness probes with the actual startup behavior.\n\nCheck CPU and memory limits, image pull events, and service account permissions. Change one cause at a time and record the result so the fix is easy to reproduce.`,
  },
];

export const DEFAULT_ONENOTE_PAGES: OneNotePage[] = [
  {
    id: 'jboss-eap-runbook',
    section: 'JBOSS',
    title: 'JBOSS EAP 8 JVM Runbook',
    updatedAt: '2026-10-28',
    content: `JBOSS EAP 8 JVM and garbage collection runbook\n\nThread dump:\njcmd $(pgrep -f jboss) Thread.print > /tmp/threads.tdump\n\nHeap summary:\njcmd $(pgrep -f jboss) GC.heap_info\n\nBefore restarting a production node, confirm the cluster has enough healthy members to serve traffic.`,
  },
  {
    id: 'nginx-certificates',
    section: 'NGINX',
    title: 'NGINX SSL Certificate Reload',
    updatedAt: '2026-10-24',
    content: `Validate the new configuration before reloading:\n\nsudo nginx -t\n\nIf validation passes, gracefully reload workers:\n\nsudo nginx -s reload\n\nConfirm the served certificate chain and expiry date from a client outside the proxy.`,
  },
  {
    id: 'openshift-triage',
    section: 'OPENSHIFT',
    title: 'OpenShift Emergency Triage',
    updatedAt: '2026-10-20',
    content: `Inspect pods that are not running:\n\noc get pods -n prod --field-selector=status.phase!=Running\n\nRead the previous container log:\n\noc logs --previous <pod-name> -n prod\n\nDescribe the deployment to review recent events:\n\noc describe deployment/<deployment-name> -n prod`,
  },
];

export const readBlogPosts = (): BlogArticle[] => {
  try {
    const saved = localStorage.getItem(BLOG_POSTS_KEY);
    if (!saved) return DEFAULT_BLOG_POSTS.map((post) => ({ ...post }));
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed as BlogArticle[] : DEFAULT_BLOG_POSTS.map((post) => ({ ...post }));
  } catch {
    return DEFAULT_BLOG_POSTS.map((post) => ({ ...post }));
  }
};

export const saveBlogPosts = (posts: BlogArticle[]) => {
  localStorage.setItem(BLOG_POSTS_KEY, JSON.stringify(posts));
};

export const readOneNotePages = (): OneNotePage[] => {
  try {
    const saved = localStorage.getItem(ONENOTE_PAGES_KEY);
    if (!saved) return DEFAULT_ONENOTE_PAGES.map((page) => ({ ...page }));
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed as OneNotePage[] : DEFAULT_ONENOTE_PAGES.map((page) => ({ ...page }));
  } catch {
    return DEFAULT_ONENOTE_PAGES.map((page) => ({ ...page }));
  }
};

export const saveOneNotePages = (pages: OneNotePage[]) => {
  localStorage.setItem(ONENOTE_PAGES_KEY, JSON.stringify(pages));
};

export const readOneNoteConfig = (): OneNoteConfig => {
  try {
    const saved = localStorage.getItem(ONENOTE_CONFIG_KEY);
    return saved
      ? { sourceUrl: '', windowsPath: '', localFolderName: '', ...JSON.parse(saved) }
      : { sourceUrl: '', windowsPath: '', localFolderName: '' };
  } catch {
    return { sourceUrl: '', windowsPath: '', localFolderName: '' };
  }
};

export const saveOneNoteConfig = (config: OneNoteConfig) => {
  localStorage.setItem(ONENOTE_CONFIG_KEY, JSON.stringify(config));
};
