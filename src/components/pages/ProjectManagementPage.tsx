import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  GitBranch, 
  Layers, 
  CheckSquare, 
  CheckCircle2, 
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Search,
  ArrowLeft,
  CircleDot,
  X,
  Clock3,
  FolderKanban,
  Paperclip as AttachmentIcon,
  ListChecks,
} from 'lucide-react';
import type { ProjectManagementTab, FindingItem, ProjectTodo, ProjectRecord, ProjectStatus, KanbanBoard, KanbanTask } from '../../types';
import { ImportedTableView } from '../ImportedTableView';
import { readImportedTable, type ImportedTable } from '../../data/spreadsheets';
import {
  readKanbanBoards,
  readProjectTodos,
  readProjects,
  saveKanbanBoards,
  saveProjectTodos,
} from '../../data/projectManagement';

interface ProjectManagementPageProps {
  initialTab?: ProjectManagementTab;
}

export const ProjectManagementPage: React.FC<ProjectManagementPageProps> = ({
  initialTab = 'bulgu-takip',
}) => {
  const [activeTab, setActiveTab] = useState<ProjectManagementTab>(initialTab);
  const [importedTable, setImportedTable] = useState<ImportedTable | null>(null);
  const [checkedImportTab, setCheckedImportTab] = useState<ProjectManagementTab | null>(null);
  const [todos, setTodos] = useState<ProjectTodo[]>(readProjectTodos);
  const [projects, setProjects] = useState<ProjectRecord[]>(readProjects);
  const [boards, setBoards] = useState<KanbanBoard[]>(readKanbanBoards);
  const [todoFilter, setTodoFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'WAITING'>('ALL');
  const [todoSearch, setTodoSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<'ALL' | ProjectStatus>('ALL');
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState(() => readKanbanBoards()[0]?.id || '');
  const [selectedKanbanTask, setSelectedKanbanTask] = useState<KanbanTask | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (activeTab !== 'kanban') {
      setSelectedKanbanTask(null);
      setDraggedTaskId(null);
    }
  }, [activeTab]);

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

  const [findings, setFindings] = useState<FindingItem[]>([
    {
      id: 'SEC-2026-104',
      title: 'TLS 1.0 & 1.1 protocol deprecation on Reverse Proxy',
      system: 'Reverse Proxy (NGINX)',
      severity: 'Critical',
      status: 'In Progress',
      assignee: 'Murat K.',
      dueDate: '2026-11-15',
      description: 'Disable legacy TLS cipher suites in /etc/nginx/nginx.conf and enforce TLSv1.2 and TLSv1.3 only.',
    },
    {
      id: 'AUD-2026-088',
      title: 'JBOSS EAP Management console weak password policy',
      system: 'JBOSS Server',
      severity: 'High',
      status: 'Open',
      assignee: 'Security Team',
      dueDate: '2026-11-20',
      description: 'Enforce Elytron realm LDAP integration and 16-character minimum complexity requirements.',
    },
    {
      id: 'SEC-2026-072',
      title: 'Unauthenticated Metrics endpoint exposed on port 9090',
      system: 'Provenir Adapter',
      severity: 'Medium',
      status: 'Resolved',
      assignee: 'Murat K.',
      dueDate: '2026-10-18',
      description: 'Wrapped actuator endpoints with internal network security group restrictions.',
    },
    {
      id: 'AUD-2026-049',
      title: 'OpenShift ServiceAccount excessive cluster-admin rolebinding',
      system: 'OpenShift',
      severity: 'High',
      status: 'Under Review',
      assignee: 'DevOps Lead',
      dueDate: '2026-11-05',
      description: 'Refactor deployment pipelines to use granular namespace scoped RBAC service accounts.',
    },
  ]);

  const toggleTodo = (id: string) => {
    const updated = todos.map((todo) => todo.id === id
      ? { ...todo, status: todo.status === 'COMPLETED' ? 'ACTIVE' as const : 'COMPLETED' as const }
      : todo);
    setTodos(updated);
    saveProjectTodos(updated);
  };

  const filteredTodos = todos
    .filter((todo) => todoFilter === 'ALL' || todo.status === todoFilter)
    .filter((todo) => `${todo.title} ${todo.description} ${todo.category}`.toLowerCase().includes(todoSearch.toLowerCase()))
    .sort((a, b) => (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31'));

  const filteredProjects = projects
    .filter((project) => projectFilter === 'ALL' || project.status === projectFilter)
    .filter((project) => `${project.title} ${project.client} ${project.projectLead}`.toLowerCase().includes(projectSearch.toLowerCase()));

  const selectedBoard = boards.find((board) => board.id === selectedBoardId) || boards[0];
  const selectedProject = projects.find((project) => project.id === selectedProjectId) || null;

  const moveKanbanTask = (taskId: string, targetColumnId: string) => {
    if (!selectedBoard) return;
    const task = selectedBoard.columns.flatMap((column) => column.tasks).find((item) => item.id === taskId);
    if (!task) return;
    const updated = boards.map((board) => board.id !== selectedBoard.id ? board : {
      ...board,
      updatedAt: new Date().toISOString().slice(0, 10),
      columns: board.columns.map((column) => {
        const remaining = column.tasks.filter((item) => item.id !== taskId);
        return column.id === targetColumnId ? { ...column, tasks: [...remaining, task] } : { ...column, tasks: remaining };
      }),
    });
    setBoards(updated);
    saveKanbanBoards(updated);
  };

  const projectFilterTabs: { id: 'ALL' | ProjectStatus; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'ONGOING', label: 'Ongoing' },
    { id: 'CANCELLED', label: 'Cancelled' },
    { id: 'FINISHED', label: 'Finished' },
    { id: 'POSTPONED', label: 'Postponed' },
  ];

  const projectStatusClass: Record<ProjectStatus, string> = {
    ONGOING: 'bg-blue-50 text-blue-700 border-blue-200',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
    FINISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    POSTPONED: 'bg-amber-50 text-amber-700 border-amber-200',
    INACTIVE: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const statusLabel: Record<ProjectStatus, string> = {
    ONGOING: 'Ongoing', CANCELLED: 'Cancelled', FINISHED: 'Finished', POSTPONED: 'Postponed', INACTIVE: 'Inactive',
  };

  const formatDate = (value: string) => {
    if (!value) return '—';
    const date = new Date(`${value.slice(0, 10)}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const importCheckComplete = checkedImportTab === activeTab;

  return (
    <div className="py-10 max-w-7xl mx-auto px-6">
      {/* Centered Sub-Tabs Bar (Hopewell Donate Now structure) */}
      {!(activeTab === 'projects' && selectedProject) && <div className="mb-10 flex justify-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-2.5 p-1.5 bg-slate-50/80 rounded-full border border-slate-200/60 shadow-xs">
          <button
            onClick={(e) => {
              setActiveTab('bulgu-takip');
              triggerConfetti(e.currentTarget);
            }}
            className={`group px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'bulgu-takip'
                ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white shadow-[0_10px_22px_-6px_rgba(249,99,50,0.5)] -translate-y-0.5'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border border-slate-200/90 hover:border-orange-300 shadow-xs hover:-translate-y-0.5 hover:shadow-md'
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${activeTab === 'bulgu-takip' ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
            <span>Bulgu Takip</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <button
            onClick={(e) => {
              setActiveTab('jboss-migration');
              triggerConfetti(e.currentTarget);
            }}
            className={`group px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'jboss-migration'
                ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white shadow-[0_10px_22px_-6px_rgba(249,99,50,0.5)] -translate-y-0.5'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border border-slate-200/90 hover:border-orange-300 shadow-xs hover:-translate-y-0.5 hover:shadow-md'
            }`}
          >
            <GitBranch className={`w-4 h-4 ${activeTab === 'jboss-migration' ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
            <span>JBOSS 8 Migration</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <button
            onClick={(e) => {
              setActiveTab('provenir-migration');
              triggerConfetti(e.currentTarget);
            }}
            className={`group px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'provenir-migration'
                ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white shadow-[0_10px_22px_-6px_rgba(249,99,50,0.5)] -translate-y-0.5'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border border-slate-200/90 hover:border-orange-300 shadow-xs hover:-translate-y-0.5 hover:shadow-md'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === 'provenir-migration' ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
            <span>Provenir Migration</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <button
            onClick={(e) => {
              setActiveTab('todo');
              triggerConfetti(e.currentTarget);
            }}
            className={`group px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'todo'
                ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white shadow-[0_10px_22px_-6px_rgba(249,99,50,0.5)] -translate-y-0.5'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border border-slate-200/90 hover:border-orange-300 shadow-xs hover:-translate-y-0.5 hover:shadow-md'
            }`}
          >
            <CheckSquare className={`w-4 h-4 ${activeTab === 'todo' ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
            <span>To Do List</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <button
            onClick={(e) => {
              setSelectedProjectId(null);
              setActiveTab('projects');
              triggerConfetti(e.currentTarget);
            }}
            className={`group px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white shadow-[0_10px_22px_-6px_rgba(249,99,50,0.5)] -translate-y-0.5'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border border-slate-200/90 hover:border-orange-300 shadow-xs hover:-translate-y-0.5 hover:shadow-md'
            }`}
          >
            <BriefcaseBusiness className={`w-4 h-4 ${activeTab === 'projects' ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
            <span>Projects</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <button
            onClick={(e) => {
              setActiveTab('kanban');
              triggerConfetti(e.currentTarget);
            }}
            className={`group px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'kanban'
                ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white shadow-[0_10px_22px_-6px_rgba(249,99,50,0.5)] -translate-y-0.5'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border border-slate-200/90 hover:border-orange-300 shadow-xs hover:-translate-y-0.5 hover:shadow-md'
            }`}
          >
            <FolderKanban className={`w-4 h-4 ${activeTab === 'kanban' ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
            <span>Kanban</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>}

      {importedTable && importCheckComplete && <ImportedTableView title={activeTab === 'bulgu-takip' ? 'Bulgu Takip' : activeTab === 'jboss-migration' ? 'JBOSS 8 Migration' : activeTab === 'provenir-migration' ? 'Provenir Migration' : activeTab === 'todo' ? 'To Do List' : activeTab === 'projects' ? 'Projects' : 'Kanban'} table={importedTable} />}
      {!importCheckComplete && <p className="py-16 text-center text-sm text-slate-400">Yüklenen tablo kontrol ediliyor…</p>}

      {/* TAB 1: BULGU TAKIP */}
      {activeTab === 'bulgu-takip' && importCheckComplete && !importedTable && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase text-slate-400">Total Findings</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{findings.length}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase text-rose-500">Critical / High</span>
              <div className="text-2xl font-black text-rose-600 mt-1">3</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase text-amber-500">In Progress</span>
              <div className="text-2xl font-black text-amber-600 mt-1">1</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase text-emerald-500">Resolved</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">1</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-5">ID & Title</th>
                  <th className="py-3 px-4">System</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {findings.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-mono text-[11px] font-bold text-[#f96332] block">{f.id}</span>
                      <span className="font-bold text-slate-900 text-sm block mt-0.5">{f.title}</span>
                      <p className="text-slate-500 text-xs mt-1 max-w-lg">{f.description}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{f.system}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          f.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-700'
                            : f.severity === 'High'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {f.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-medium">{f.assignee}</td>
                    <td className="py-4 px-4 text-slate-500 font-mono">{f.dueDate}</td>
                    <td className="py-4 px-5 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                          f.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : f.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: JBOSS 8 MIGRATION */}
      {activeTab === 'jboss-migration' && importCheckComplete && !importedTable && (
        <div className="space-y-8 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">JBOSS EAP 7.4 to JBOSS EAP 8 (WildFly 28) Migration</h3>
                <p className="text-xs text-slate-500">Jakarta EE 10 namespace overhaul, Java 17/21 LTS runtime upgrade, Elytron security</p>
              </div>
              <span className="text-2xl font-black text-[#f96332]">78% Complete</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-[#f96332] rounded-full" style={{ width: '78%' }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Jakarta EE 10 Namespace Migration', desc: 'Refactor javax.servlet, javax.persistence to jakarta.* in 14 modules.', done: true },
              { title: 'OpenJDK 17 / 21 Target Compatibility', desc: 'Compiler source/target flags updated in Maven pom.xml and verified.', done: true },
              { title: 'Datasource Driver & Connection Pools', desc: 'Oracle & PostgreSQL drivers updated to compliant JDBC 4.3 standards.', done: true },
              { title: 'Elytron Security Realm Configuration', desc: 'Migrated legacy security domains to Elytron filesystem & LDAP realm.', done: true },
              { title: 'Clustering & Infinispan Cache Replication', desc: 'Benchmarking cross-node distributed sessions under simulated failover.', done: false },
              { title: 'Production Cutover & Traffic Switch', desc: 'Scheduled maintenance window for weekend deployment.', done: false },
            ].map((item, idx) => (
              <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  <span className={`inline-block mt-2 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.done ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROVENIR MIGRATION */}
      {activeTab === 'provenir-migration' && importCheckComplete && !importedTable && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Provenir Decisioning System Upgrade & Cloud Migration</h3>
            <p className="text-xs text-slate-500">Migrating risk engine workflows, decision trees, and Kafka broker integration.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                <span className="text-xs text-slate-500 font-bold uppercase">Regression Test Pass Rate</span>
                <div className="text-2xl font-black text-slate-900 mt-1">99.4%</div>
                <span className="text-xs text-emerald-600 mt-1 block">1,820 / 1,831 scenarios matched</span>
              </div>
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                <span className="text-xs text-slate-500 font-bold uppercase">Average Decision Latency</span>
                <div className="text-2xl font-black text-[#f96332] mt-1">38ms</div>
                <span className="text-xs text-slate-500 mt-1 block">Reduced from 62ms</span>
              </div>
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                <span className="text-xs text-slate-500 font-bold uppercase">Target Go-Live</span>
                <div className="text-2xl font-black text-slate-900 mt-1">Q4 2026</div>
                <span className="text-xs text-emerald-600 mt-1 block">On Track</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADMIN-MANAGED TO DO LIST */}
      {activeTab === 'todo' && importCheckComplete && !importedTable && (
        <section className="animate-in fade-in bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 px-5 py-5 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'ACTIVE', 'COMPLETED', 'WAITING'] as const).map((filter) => {
                const count = filter === 'ALL' ? todos.length : todos.filter((todo) => todo.status === filter).length;
                return <button key={filter} onClick={() => setTodoFilter(filter)} className={`px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-colors ${todoFilter === filter ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{filter}<span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${todoFilter === filter ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{count}</span></button>;
              })}
            </div>
            <div className="flex items-center gap-4">
              <label className="relative block w-full sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={todoSearch} onChange={(event) => setTodoSearch(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500" placeholder="Search tasks" /></label>
              <span className="whitespace-nowrap text-xs font-semibold text-slate-500">{filteredTodos.length} tasks</span>
            </div>
          </div>
          <div className="divide-y divide-slate-200">
            {filteredTodos.map((todo) => (
              <div key={todo.id} className={`flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50 ${todo.status === 'COMPLETED' ? 'bg-slate-50/70' : ''}`}>
                <button type="button" aria-label={todo.status === 'COMPLETED' ? 'Mark task active' : 'Complete task'} onClick={() => toggleTodo(todo.id)} className={`h-[18px] w-[18px] shrink-0 rounded border flex items-center justify-center ${todo.status === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white hover:border-blue-500'}`}>{todo.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}</button>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`text-sm font-medium ${todo.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{todo.title}</span><span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${todo.status === 'ACTIVE' ? 'border-sky-300 bg-sky-50 text-sky-700' : todo.status === 'WAITING' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-emerald-300 bg-emerald-50 text-emerald-700'}`}>{todo.status === 'ACTIVE' ? 'Active' : todo.status === 'WAITING' ? 'Waiting' : 'Completed'}</span></div>{todo.description && <p className="mt-1 truncate text-xs text-slate-500">{todo.description}</p>}</div>
                <span className={`hidden sm:inline-flex rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${todo.priority === 'High' ? 'border-orange-300 bg-orange-50 text-orange-700' : todo.priority === 'Medium' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>{todo.priority}</span>
                <div className="hidden md:flex w-28 items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{formatDate(todo.dueDate)}</div>
                <span className="hidden lg:block w-32 truncate text-right text-xs text-slate-500">{todo.category}</span>
              </div>
            ))}
            {filteredTodos.length === 0 && <div className="px-5 py-16 text-center"><CheckSquare className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">Bu filtrede görev yok</p><p className="mt-1 text-xs text-slate-400">Görevler Admin &gt; Project Management bölümünden eklenir.</p></div>}
          </div>
        </section>
      )}

      {/* TAB 5: PROJECT LIST AND PROJECT DETAIL */}
      {activeTab === 'projects' && importCheckComplete && !importedTable && (selectedProject ? (
        <div className="animate-in fade-in -mx-2 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
            <main className="p-6 sm:p-9">
              <button type="button" onClick={() => setSelectedProjectId(null)} className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"><ArrowLeft className="h-4 w-4" />Back to Projects</button>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div><h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{selectedProject.title}</h1><span className={`mt-3 inline-flex rounded border px-2.5 py-1 text-[10px] font-bold uppercase ${projectStatusClass[selectedProject.status]}`}>{statusLabel[selectedProject.status]}</span></div>
                <button type="button" onClick={() => setSelectedProjectId(null)} className="hidden sm:block text-slate-400 hover:text-slate-700" aria-label="Close project details"><X className="w-5 h-5" /></button>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(220px,.8fr)_minmax(0,1.4fr)]">
                <div className="space-y-4 text-sm">
                  <div><span className="block text-xs font-bold uppercase text-slate-400">Client</span><span className="mt-1 block font-semibold text-blue-600">{selectedProject.client}</span></div>
                  <div><span className="block text-xs font-bold uppercase text-slate-400">Project lead</span><span className="mt-1 block font-semibold text-slate-800">{selectedProject.projectLead}</span></div>
                  <div><span className="block text-xs font-bold uppercase text-slate-400">Budget</span><span className="mt-1 block font-semibold text-slate-800">{selectedProject.budget}</span></div>
                  <div><span className="block text-xs font-bold uppercase text-slate-400">Privacy</span><span className="mt-1 block font-semibold text-slate-800">{selectedProject.privacy} project</span></div>
                  <div className="grid grid-cols-2 gap-3 pt-2"><div><span className="block text-xs font-bold text-slate-500">Started</span><span className="mt-1 block text-sm">{formatDate(selectedProject.startDate)}</span></div><div><span className="block text-xs font-bold text-slate-500">Deadline</span><span className="mt-1 block text-sm">{formatDate(selectedProject.deadline)}</span></div></div>
                </div>
                <div>
                  <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-900">Task completed over time</h2><p className="text-sm text-slate-500">Progress across project work</p></div><span className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">Current progress</span></div>
                  <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-5"><div className="flex h-32 items-end gap-2">{[34, 49, 43, 66, 64, 78, 94, 73, 82, 70, 88, Math.max(16, Math.round((selectedProject.completedTaskCount / Math.max(selectedProject.taskCount, 1)) * 100))].map((height, index) => <div key={index} className="relative flex-1 rounded-t bg-blue-500/80" style={{ height: `${height}%` }} />)}</div><div className="mt-3 flex justify-between text-[10px] text-slate-400"><span>Project start</span><span>Today</span></div></div>
                  <div className="mt-4 flex items-center justify-between text-sm"><span className="font-semibold text-slate-700">{selectedProject.completedTaskCount} of {selectedProject.taskCount} tasks completed</span><span className="font-bold text-orange-600">{Math.round(selectedProject.completedTaskCount / Math.max(selectedProject.taskCount, 1) * 100)}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, Math.round(selectedProject.completedTaskCount / Math.max(selectedProject.taskCount, 1) * 100))}%` }} /></div>
                </div>
              </div>
              <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div><h2 className="text-lg font-bold text-slate-900">Work loads</h2><p className="text-xs text-slate-500">Last 7 days</p><div className="mt-5 flex items-center gap-5"><div className="flex h-24 w-24 items-center justify-center rounded-full border-[9px] border-blue-500 text-xl font-bold text-slate-700">72%</div><div className="space-y-2 text-xs text-slate-600"><p><span className="mr-2 text-blue-600">●</span>{selectedProject.projectLead}</p><p><span className="mr-2 text-sky-300">●</span>Platform Team</p><p><span className="mr-2 text-cyan-500">●</span>Security Team</p></div></div></div>
                <div><h2 className="text-lg font-bold text-slate-900">Team members</h2><div className="mt-4 flex flex-wrap gap-2">{selectedProject.team.map((member, index) => <span key={`${member}-${index}`} title={member} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm ${['bg-blue-600', 'bg-teal-600', 'bg-indigo-500', 'bg-orange-500', 'bg-slate-700'][index % 5]}`}>{member.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>)}</div><h3 className="mt-7 text-sm font-bold text-slate-900">Tags</h3><div className="mt-2 flex flex-wrap gap-2">{selectedProject.tags.map((tag) => <span key={tag} className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-700">{tag}</span>)}</div></div>
              </div>
              <div className="mt-10 border-t border-slate-100 pt-7"><h2 className="text-xl font-bold text-slate-900">Project overview</h2><p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">{selectedProject.overview || 'Bu proje için henüz genel bakış eklenmedi.'}</p></div>
            </main>
            <aside className="border-t border-slate-200 bg-slate-50/70 p-6 sm:p-8 xl:border-l xl:border-t-0"><h2 className="text-xl font-bold text-slate-900">Recent activity</h2><div className="mt-6 space-y-7">{[
              { date: selectedProject.updatedAt, title: `${selectedProject.title} updated`, description: 'Project status and delivery details are up to date.' },
              { date: selectedProject.startDate, title: 'Project workspace created', description: `The ${selectedProject.client} team started project planning.` },
              { date: selectedProject.deadline, title: 'Target deadline', description: 'Review milestones and delivery readiness before this date.' },
            ].map((item, index) => <div key={`${item.title}-${index}`} className="relative pl-8"><span className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600"><CircleDot className="h-3 w-3" /></span><p className="text-[10px] font-bold uppercase text-slate-400">{formatDate(item.date)}</p><h3 className="mt-1 text-sm font-bold text-slate-800">{item.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p></div>)}</div><div className="mt-10 border-t border-slate-200 pt-6"><h3 className="text-sm font-bold text-slate-900">Files</h3><p className="mt-2 text-xs text-slate-500">No files have been attached yet.</p></div></aside>
          </div>
        </div>
      ) : (
        <section className="animate-in fade-in space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-black tracking-tight text-slate-900">Projects <span className="ml-2 font-normal text-slate-400">({projects.length})</span></h1><p className="mt-1 text-sm text-slate-500">Proje ekleme ve düzenleme işlemleri Admin ekranından yapılır.</p></div><label className="relative block w-full sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500" placeholder="Search projects" /></label></div>
          <div className="flex flex-wrap gap-5 border-b border-slate-200">{projectFilterTabs.map((tab) => <button key={tab.id} type="button" onClick={() => setProjectFilter(tab.id)} className={`border-b-2 px-0.5 pb-3 text-xs font-bold transition-colors ${projectFilter === tab.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>{tab.label} <span className="ml-1 text-slate-400">({tab.id === 'ALL' ? projects.length : projects.filter((project) => project.status === tab.id).length})</span></button>)}</div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs"><table className="w-full min-w-[900px] border-collapse text-left"><thead><tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600"><th className="px-5 py-4">Project name</th><th className="px-4 py-4">Assignees</th><th className="px-4 py-4">Start date</th><th className="px-4 py-4">Deadline</th><th className="px-4 py-4">Tasks</th><th className="px-4 py-4">Progress</th><th className="px-4 py-4">Status</th></tr></thead><tbody className="divide-y divide-slate-200 text-xs text-slate-700">{filteredProjects.map((project) => { const progress = Math.min(100, Math.round(project.completedTaskCount / Math.max(project.taskCount, 1) * 100)); return <tr key={project.id} className="transition-colors hover:bg-slate-50"><td className="px-5 py-5"><button type="button" onClick={() => setSelectedProjectId(project.id)} className="text-left text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline">{project.title}</button><p className="mt-1 text-[11px] text-slate-400">{project.client}</p></td><td className="px-4 py-5"><div className="flex -space-x-2">{project.team.slice(0, 4).map((member, index) => <span key={`${member}-${index}`} title={member} className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white ${['bg-blue-600', 'bg-teal-600', 'bg-indigo-500', 'bg-orange-500'][index % 4]}`}>{member.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>)}{project.team.length > 4 && <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-50 text-[9px] font-bold text-blue-700">+{project.team.length - 4}</span>}</div></td><td className="px-4 py-5 whitespace-nowrap">{formatDate(project.startDate)}</td><td className="px-4 py-5 whitespace-nowrap">{formatDate(project.deadline)}</td><td className="px-4 py-5">{project.taskCount}</td><td className="px-4 py-5"><div className="w-24"><div className="mb-1 flex justify-between text-[10px]"><span>{project.completedTaskCount}/{project.taskCount}</span><span>{progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-green-500" style={{ width: `${progress}%` }} /></div></div></td><td className="px-4 py-5"><span className={`inline-flex rounded border px-2 py-1 text-[10px] font-bold uppercase ${projectStatusClass[project.status]}`}>{statusLabel[project.status]}</span></td></tr>; })}{filteredProjects.length === 0 && <tr><td colSpan={7} className="px-5 py-14 text-center text-sm text-slate-500">Arama ve filtreye uygun proje yok.</td></tr>}</tbody></table></div>
          <p className="text-xs text-slate-500">{filteredProjects.length} projects shown · Select a project to open its details.</p>
        </section>
      ))}

      {/* TAB 6: KANBAN BOARD */}
      {activeTab === 'kanban' && importCheckComplete && !importedTable && (
        <section className="animate-in fade-in space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-600">Project workspace</span><h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Kanban</h1><p className="mt-1 text-sm text-slate-500">Kartları kolonlar arasında sürükleyerek iş akışını güncelleyin.</p></div>{boards.length > 0 && <select value={selectedBoard?.id || ''} onChange={(event) => setSelectedBoardId(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500">{boards.map((board) => <option key={board.id} value={board.id}>{board.title}</option>)}</select>}</div>
          {!selectedBoard ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><FolderKanban className="mx-auto h-9 w-9 text-slate-300" /><h2 className="mt-3 font-bold text-slate-700">Henüz Kanban panosu yok</h2><p className="mt-1 text-sm text-slate-500">Admin &gt; Project Management bölümünden Create Kanban ile pano oluşturun.</p></div> : <>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"><div><h2 className="text-sm font-bold text-slate-900">{selectedBoard.title}</h2><p className="mt-0.5 text-xs text-slate-500">{selectedBoard.description}</p></div><span className="text-xs text-slate-500">{selectedBoard.columns.reduce((total, column) => total + column.tasks.length, 0)} cards</span></div>
            <div className="flex items-start gap-4 overflow-x-auto pb-4">{selectedBoard.columns.map((column) => <div key={column.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const taskId = event.dataTransfer.getData('text/plain') || draggedTaskId; if (taskId) moveKanbanTask(taskId, column.id); setDraggedTaskId(null); }} className="w-[290px] min-w-[290px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-xs"><div className="flex items-center justify-between border-b-2 bg-white px-4 py-4" style={{ borderBottomColor: column.color }}><h3 className="text-sm font-bold text-slate-800">{column.title}</h3><span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-bold text-slate-600">{column.tasks.length}</span></div><div className="min-h-44 space-y-3 p-3">{column.tasks.map((task) => <button type="button" key={task.id} draggable onDragStart={(event) => { setDraggedTaskId(task.id); event.dataTransfer.setData('text/plain', task.id); }} onClick={() => setSelectedKanbanTask(task)} className="block w-full cursor-grab rounded-lg border border-slate-200 bg-white p-3 text-left shadow-[0_1px_2px_rgba(15,23,42,.05)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md active:cursor-grabbing"><div className="mb-2 flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${task.category === 'BUG' ? 'bg-rose-500' : task.category === 'ISSUE' ? 'bg-orange-500' : task.category === 'FEATURE' ? 'bg-blue-500' : 'bg-slate-500'}`} /><span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${task.category === 'BUG' ? 'border-rose-300 bg-rose-50 text-rose-700' : task.category === 'ISSUE' ? 'border-orange-300 bg-orange-50 text-orange-700' : task.category === 'FEATURE' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-300 bg-slate-50 text-slate-600'}`}>{task.category}</span><span className="ml-auto text-[10px] font-semibold text-slate-400">{task.priority}</span></div><p className="text-sm leading-5 text-slate-800">{task.title}</p><div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">{task.dueDate ? <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(task.dueDate)}</span> : <span />}{task.attachmentCount > 0 && <span className="inline-flex items-center gap-1"><AttachmentIcon className="h-3 w-3" />{task.attachmentCount}</span>}{task.checklistTotal > 0 && <span className="inline-flex items-center gap-1"><ListChecks className="h-3 w-3" />{task.checklistDone}/{task.checklistTotal}</span>}</div>{task.assignees.length > 0 && <div className="mt-3 flex flex-wrap gap-1">{task.assignees.slice(0, 3).map((assignee, index) => <span key={`${assignee}-${index}`} title={assignee} className={`flex h-6 w-6 items-center justify-center rounded-full text-[8px] font-bold text-white ${['bg-blue-600', 'bg-teal-600', 'bg-indigo-500'][index % 3]}`}>{assignee.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>)}</div>}</button>)}{column.tasks.length === 0 && <p className="py-6 text-center text-xs text-slate-400">No tasks yet</p>}</div></div>)}</div>
          </>}
        </section>
      )}

      {selectedKanbanTask && activeTab === 'kanban' && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" onClick={() => setSelectedKanbanTask(null)}><section role="dialog" aria-modal="true" aria-labelledby="kanban-task-title" onClick={(event) => event.stopPropagation()} className="grid max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl md:grid-cols-[minmax(0,1fr)_260px]"><div className="p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">{selectedKanbanTask.category}</span><h2 id="kanban-task-title" className="mt-3 text-xl font-bold text-slate-900">{selectedKanbanTask.title}</h2></div><button type="button" onClick={() => setSelectedKanbanTask(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close task details"><X className="h-5 w-5" /></button></div><div className="mt-7 grid grid-cols-[110px_minmax(0,1fr)] gap-x-4 gap-y-5 text-sm"><span className="text-xs font-bold uppercase text-slate-500">Description</span><p className="leading-6 text-slate-600">{selectedKanbanTask.description || 'No description provided.'}</p><span className="text-xs font-bold uppercase text-slate-500">Board</span><p className="font-medium text-slate-800">{selectedBoard?.title}</p><span className="text-xs font-bold uppercase text-slate-500">Column</span><p className="font-medium text-slate-800">{selectedBoard?.columns.find((column) => column.tasks.some((task) => task.id === selectedKanbanTask.id))?.title || '—'}</p><span className="text-xs font-bold uppercase text-slate-500">Assigned to</span><p className="font-medium text-slate-800">{selectedKanbanTask.assignees.join(', ') || 'Unassigned'}</p><span className="text-xs font-bold uppercase text-slate-500">Priority</span><p className="font-medium text-slate-800">{selectedKanbanTask.priority}</p><span className="text-xs font-bold uppercase text-slate-500">Due date</span><p className="font-medium text-slate-800">{formatDate(selectedKanbanTask.dueDate)}</p></div></div><aside className="border-t border-slate-200 bg-slate-50 p-6 md:border-l md:border-t-0"><h3 className="font-bold text-slate-900">Actions</h3><label className="mt-4 block text-xs font-bold text-slate-500">Move to column</label><select value={selectedBoard?.columns.find((column) => column.tasks.some((task) => task.id === selectedKanbanTask.id))?.id || ''} onChange={(event) => { moveKanbanTask(selectedKanbanTask.id, event.target.value); setSelectedKanbanTask(null); }} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">{selectedBoard?.columns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}</select><div className="mt-7 border-t border-slate-200 pt-5"><h3 className="font-bold text-slate-900">Activities</h3><p className="mt-3 text-xs leading-5 text-slate-500"><Clock3 className="mr-1 inline h-3.5 w-3.5" />Task created in Admin workspace.</p></div></aside></section></div>}
    </div>
  );
};
