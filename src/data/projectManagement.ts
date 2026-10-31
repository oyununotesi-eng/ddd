import type { KanbanBoard, ProjectRecord, ProjectTodo } from '../types';

export const PROJECT_TODOS_KEY = 'murat_project_todos';
export const PROJECTS_KEY = 'murat_projects';
export const KANBAN_BOARDS_KEY = 'murat_kanban_boards';

const today = new Date().toISOString().slice(0, 10);

export const DEFAULT_PROJECT_TODOS: ProjectTodo[] = [
  {
    id: 'todo-jboss-keystore',
    title: 'Verify JBOSS 8 Elytron SSL keystore compatibility',
    description: 'Check the shared keystore format against the target EAP configuration.',
    status: 'COMPLETED',
    priority: 'High',
    category: 'JBOSS 8',
    dueDate: '2026-10-28',
    createdAt: '2026-10-20',
  },
  {
    id: 'todo-provenir-uat',
    title: 'Test Provenir regression scenarios on UAT cluster',
    description: 'Run the approved decisioning regression suite and attach the test report.',
    status: 'ACTIVE',
    priority: 'High',
    category: 'Provenir',
    dueDate: '2026-11-03',
    createdAt: today,
  },
  {
    id: 'todo-evam-proxy',
    title: 'Update reverse proxy upstream timeouts for Evam streaming',
    description: 'Confirm target timeout values with the platform team before deployment.',
    status: 'WAITING',
    priority: 'Medium',
    category: 'Evam',
    dueDate: '2026-11-06',
    createdAt: today,
  },
  {
    id: 'todo-audit-report',
    title: 'Review quarterly IT audit findings report',
    description: 'Review owners and due dates for all high priority findings.',
    status: 'COMPLETED',
    priority: 'Medium',
    category: 'Audit',
    dueDate: '2026-10-25',
    createdAt: '2026-10-18',
  },
  {
    id: 'todo-nfs-cleanup',
    title: 'Clean up stale NFS mount volume dumps older than 90 days',
    description: 'Check retention policy and remove only approved archive files.',
    status: 'ACTIVE',
    priority: 'Low',
    category: 'NFS Storage',
    dueDate: '2026-11-12',
    createdAt: today,
  },
];

export const DEFAULT_PROJECTS: ProjectRecord[] = [
  {
    id: 'project-jboss-eap-8',
    title: 'JBoss EAP 8 Migration',
    client: 'Core Platform',
    projectLead: 'Murat Karahaliloğlu',
    team: ['Murat K.', 'Ahmet Y.', 'Platform Team', 'Security Team'],
    startDate: '2026-08-01',
    deadline: '2026-12-15',
    status: 'ONGOING',
    budget: '₺1.240.000',
    privacy: 'Internal',
    taskCount: 42,
    completedTaskCount: 29,
    overview: 'Uygulamaların JBOSS EAP 8 platformuna taşınması, Jakarta namespace uyumluluğu ve güvenlik yapılandırmasının güncellenmesi.',
    tags: ['JBOSS EAP', 'Migration', 'Jakarta EE', 'Security'],
    updatedAt: today,
  },
  {
    id: 'project-provenir-cloud',
    title: 'Provenir Cloud Migration',
    client: 'Decisioning Platform',
    projectLead: 'Murat Karahaliloğlu',
    team: ['Murat K.', 'Decisioning Team', 'Cloud Platform'],
    startDate: '2026-07-15',
    deadline: '2027-01-30',
    status: 'ONGOING',
    budget: '₺2.850.000',
    privacy: 'Internal',
    taskCount: 56,
    completedTaskCount: 38,
    overview: 'Provenir karar akışlarının bulut ortamına taşınması ve paralel test sürecinin tamamlanması.',
    tags: ['Provenir', 'Cloud', 'Migration'],
    updatedAt: today,
  },
  {
    id: 'project-openshift-upgrade',
    title: 'OpenShift Platform Upgrade',
    client: 'Infrastructure',
    projectLead: 'DevOps Lead',
    team: ['Platform Team', 'SRE Team'],
    startDate: '2026-10-10',
    deadline: '2027-02-15',
    status: 'POSTPONED',
    budget: '₺920.000',
    privacy: 'Internal',
    taskCount: 24,
    completedTaskCount: 5,
    overview: 'OpenShift cluster sürüm yükseltmesi için uygulama uyumluluğu ve bakım planı.',
    tags: ['OpenShift', 'Infrastructure'],
    updatedAt: today,
  },
  {
    id: 'project-nfs-capacity',
    title: 'NFS Storage Capacity Plan',
    client: 'Infrastructure',
    projectLead: 'Storage Team',
    team: ['Storage Team', 'Operations'],
    startDate: '2026-06-01',
    deadline: '2026-09-30',
    status: 'FINISHED',
    budget: '₺410.000',
    privacy: 'Internal',
    taskCount: 18,
    completedTaskCount: 18,
    overview: 'NFS paylaşım büyüme tahminleri ve kapasite iyileştirmelerinin tamamlanması.',
    tags: ['NFS', 'Storage', 'Capacity'],
    updatedAt: today,
  },
];

export const DEFAULT_KANBAN_BOARDS: KanbanBoard[] = [
  {
    id: 'board-platform-delivery',
    title: 'Platform Delivery',
    description: 'Platform ekibinin sprint işleri ve sürüm hazırlıkları.',
    updatedAt: today,
    columns: [
      {
        id: 'column-todo', title: 'To do', color: '#f97316', tasks: [
          { id: 'card-checkout-bug', title: 'Test and debug code for the e-commerce website checkout process', description: 'Ödeme akışındaki hatayı yeniden üret, düzeltmeyi doğrula.', category: 'BUG', priority: 'High', dueDate: '2026-11-04', assignees: ['Murat K.', 'Ahmet Y.'], attachmentCount: 2, checklistDone: 0, checklistTotal: 0 },
          { id: 'card-industry-blog', title: 'Write a blog post on industry trends and best practices', description: 'Teknik blog taslağını gözden geçirip yayın takvimine ekle.', category: 'ISSUE', priority: 'Medium', dueDate: '2026-11-10', assignees: ['Murat K.'], attachmentCount: 0, checklistDone: 0, checklistTotal: 0 },
        ],
      },
      {
        id: 'column-doing', title: 'Doing', color: '#3874ff', tasks: [
          { id: 'card-wireframes', title: 'Create wireframes for a new workspace portal', description: 'Yeni portala ait ana ekran ve gezinme taslaklarını oluştur.', category: 'BUG', priority: 'High', dueDate: '2026-11-02', assignees: ['Murat K.'], attachmentCount: 1, checklistDone: 0, checklistTotal: 0 },
          { id: 'card-tool-setup', title: 'Set up and configure a new software tool for the platform team', description: 'UAT ortamında kurulum ve erişim kontrollerini tamamla.', category: 'TASK', priority: 'Low', dueDate: '', assignees: ['Ahmet Y.'], attachmentCount: 0, checklistDone: 5, checklistTotal: 34 },
          { id: 'card-release-note', title: 'Draft and send a press release to announce a new partnership', description: 'İç duyuru metnini paydaşlarla son kez gözden geçir.', category: 'FEATURE', priority: 'Medium', dueDate: '2026-11-01', assignees: [], attachmentCount: 1, checklistDone: 0, checklistTotal: 0 },
        ],
      },
      {
        id: 'column-review', title: 'Review', color: '#08a9e6', tasks: [
          { id: 'card-security-review', title: 'Conduct a security audit of the platform services', description: 'Servis erişimleri ve güvenlik bulgularını kontrol et.', category: 'ISSUE', priority: 'High', dueDate: '2026-11-07', assignees: ['Security Team', 'Murat K.'], attachmentCount: 3, checklistDone: 5, checklistTotal: 34 },
          { id: 'card-vendor-research', title: 'Identify and evaluate platform software vendors', description: 'Teknik ve operasyonel gereksinimlere göre kısa liste hazırla.', category: 'TASK', priority: 'Low', dueDate: '', assignees: ['Platform Team'], attachmentCount: 0, checklistDone: 0, checklistTotal: 0 },
        ],
      },
      {
        id: 'column-release', title: 'Release', color: '#18a558', tasks: [
          { id: 'card-usability', title: 'Improve portal usability through user testing', description: 'Kullanıcı testlerinden gelen önerileri sürüm notlarına ekle.', category: 'FEATURE', priority: 'Medium', dueDate: '2026-11-12', assignees: ['Murat K.', 'UX Team'], attachmentCount: 1, checklistDone: 0, checklistTotal: 0 },
        ],
      },
    ],
  },
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function readCollection<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return clone(fallback);
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return clone(fallback);
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed as T[] : clone(fallback);
  } catch {
    return clone(fallback);
  }
}

function saveCollection<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Keep the UI usable in private browsing modes where storage may be unavailable.
  }
}

export const readProjectTodos = () => readCollection(PROJECT_TODOS_KEY, DEFAULT_PROJECT_TODOS);
export const saveProjectTodos = (items: ProjectTodo[]) => saveCollection(PROJECT_TODOS_KEY, items);
export const readProjects = () => readCollection(PROJECTS_KEY, DEFAULT_PROJECTS);
export const saveProjects = (items: ProjectRecord[]) => saveCollection(PROJECTS_KEY, items);
export const readKanbanBoards = () => readCollection(KANBAN_BOARDS_KEY, DEFAULT_KANBAN_BOARDS);
export const saveKanbanBoards = (items: KanbanBoard[]) => saveCollection(KANBAN_BOARDS_KEY, items);
