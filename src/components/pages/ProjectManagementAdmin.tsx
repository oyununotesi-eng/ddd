import React, { useState } from 'react';
import { BriefcaseBusiness, CheckSquare, ClipboardList, FolderKanban, Plus, Trash2 } from 'lucide-react';
import type { KanbanBoard, KanbanTask, ProjectRecord, ProjectTodo } from '../../types';
import {
  readKanbanBoards,
  readProjectTodos,
  readProjects,
  saveKanbanBoards,
  saveProjectTodos,
  saveProjects,
} from '../../data/projectManagement';

type AdminSection = 'todo' | 'projects' | 'kanban';

const inputClass = 'w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelClass = 'block text-xs font-bold text-slate-700 mb-1.5';

const statusLabel: Record<ProjectTodo['status'], string> = {
  ACTIVE: 'Active', WAITING: 'Waiting', COMPLETED: 'Completed',
};

export const ProjectManagementAdmin: React.FC = () => {
  const [section, setSection] = useState<AdminSection>('todo');
  const [todos, setTodos] = useState(readProjectTodos);
  const [projects, setProjects] = useState(readProjects);
  const [boards, setBoards] = useState(readKanbanBoards);
  const [selectedBoardId, setSelectedBoardId] = useState(() => readKanbanBoards()[0]?.id || '');
  const [message, setMessage] = useState('');

  const [todoTitle, setTodoTitle] = useState('');
  const [todoDescription, setTodoDescription] = useState('');
  const [todoCategory, setTodoCategory] = useState('Workspace');
  const [todoStatus, setTodoStatus] = useState<ProjectTodo['status']>('ACTIVE');
  const [todoPriority, setTodoPriority] = useState<ProjectTodo['priority']>('Medium');
  const [todoDueDate, setTodoDueDate] = useState('');

  const [projectTitle, setProjectTitle] = useState('');
  const [projectClient, setProjectClient] = useState('');
  const [projectLead, setProjectLead] = useState('');
  const [projectTeam, setProjectTeam] = useState('');
  const [projectStatus, setProjectStatus] = useState<ProjectRecord['status']>('ONGOING');
  const [projectStart, setProjectStart] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');
  const [projectBudget, setProjectBudget] = useState('');
  const [projectOverview, setProjectOverview] = useState('');
  const [projectTags, setProjectTags] = useState('');

  const [boardTitle, setBoardTitle] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [boardColumns, setBoardColumns] = useState('To do, Doing, Review, Release');
  const [cardTitle, setCardTitle] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const [cardColumnId, setCardColumnId] = useState('');
  const [cardCategory, setCardCategory] = useState<KanbanTask['category']>('TASK');
  const [cardPriority, setCardPriority] = useState<KanbanTask['priority']>('Medium');
  const [cardDueDate, setCardDueDate] = useState('');

  const selectedBoard = boards.find((board) => board.id === selectedBoardId) || boards[0];

  const persistTodos = (updated: ProjectTodo[]) => {
    setTodos(updated);
    saveProjectTodos(updated);
  };
  const persistProjects = (updated: ProjectRecord[]) => {
    setProjects(updated);
    saveProjects(updated);
  };
  const persistBoards = (updated: KanbanBoard[]) => {
    setBoards(updated);
    saveKanbanBoards(updated);
  };

  const addTodo = (event: React.FormEvent) => {
    event.preventDefault();
    const title = todoTitle.trim();
    if (!title) return;
    const item: ProjectTodo = {
      id: `todo-${Date.now()}`,
      title,
      description: todoDescription.trim(),
      category: todoCategory.trim() || 'Workspace',
      status: todoStatus,
      priority: todoPriority,
      dueDate: todoDueDate,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    persistTodos([item, ...todos]);
    setTodoTitle('');
    setTodoDescription('');
    setTodoDueDate('');
    setMessage('Görev To do listesine eklendi.');
  };

  const addProject = (event: React.FormEvent) => {
    event.preventDefault();
    const title = projectTitle.trim();
    if (!title) return;
    const project: ProjectRecord = {
      id: `project-${Date.now()}`,
      title,
      client: projectClient.trim() || 'Workspace',
      projectLead: projectLead.trim() || 'Atanmamış',
      team: projectTeam.split(',').map((member) => member.trim()).filter(Boolean),
      startDate: projectStart,
      deadline: projectDeadline,
      status: projectStatus,
      budget: projectBudget.trim() || 'Belirtilmedi',
      privacy: 'Internal',
      taskCount: 0,
      completedTaskCount: 0,
      overview: projectOverview.trim(),
      tags: projectTags.split(',').map((tag) => tag.trim()).filter(Boolean),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    persistProjects([project, ...projects]);
    setProjectTitle('');
    setProjectClient('');
    setProjectLead('');
    setProjectTeam('');
    setProjectStart('');
    setProjectDeadline('');
    setProjectBudget('');
    setProjectOverview('');
    setProjectTags('');
    setMessage('Proje oluşturuldu ve Projects sekmesine eklendi.');
  };

  const addBoard = (event: React.FormEvent) => {
    event.preventDefault();
    const title = boardTitle.trim();
    const columns = boardColumns.split(',').map((column) => column.trim()).filter(Boolean);
    if (!title || !columns.length) return;
    const board: KanbanBoard = {
      id: `board-${Date.now()}`,
      title,
      description: boardDescription.trim(),
      updatedAt: new Date().toISOString().slice(0, 10),
      columns: columns.map((columnTitle, index) => ({
        id: `column-${Date.now()}-${index}`,
        title: columnTitle,
        color: ['#f97316', '#3874ff', '#08a9e6', '#18a558', '#8b5cf6'][index % 5],
        tasks: [],
      })),
    };
    const updated = [board, ...boards];
    persistBoards(updated);
    setSelectedBoardId(board.id);
    setBoardTitle('');
    setBoardDescription('');
    setMessage('Kanban panosu oluşturuldu.');
  };

  const addKanbanTask = (event: React.FormEvent) => {
    event.preventDefault();
    const title = cardTitle.trim();
    if (!title || !selectedBoard) return;
    const columnId = cardColumnId || selectedBoard.columns[0]?.id;
    if (!columnId) return;
    const task: KanbanTask = {
      id: `card-${Date.now()}`,
      title,
      description: cardDescription.trim(),
      category: cardCategory,
      priority: cardPriority,
      dueDate: cardDueDate,
      assignees: [],
      attachmentCount: 0,
      checklistDone: 0,
      checklistTotal: 0,
    };
    const updated = boards.map((board) => board.id !== selectedBoard.id ? board : {
      ...board,
      updatedAt: new Date().toISOString().slice(0, 10),
      columns: board.columns.map((column) => column.id === columnId ? { ...column, tasks: [...column.tasks, task] } : column),
    });
    persistBoards(updated);
    setCardTitle('');
    setCardDescription('');
    setCardDueDate('');
    setMessage('Kart seçilen Kanban panosuna eklendi.');
  };

  const sectionTabs: { id: AdminSection; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'todo', label: 'To do tasks', icon: CheckSquare, count: todos.length },
    { id: 'projects', label: 'Projects', icon: BriefcaseBusiness, count: projects.length },
    { id: 'kanban', label: 'Kanban', icon: FolderKanban, count: boards.length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-600">Admin workspace</span>
        <h2 className="text-xl font-black text-slate-900 mt-1">Project Management</h2>
        <p className="text-sm text-slate-500 mt-1">To do görevlerini, projeleri ve Kanban panolarını buradan yönetin.</p>
        <div className="flex flex-wrap gap-2 mt-5">
          {sectionTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} type="button" onClick={() => { setSection(tab.id); setMessage(''); }} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${section === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                <Icon className="w-4 h-4" /> {tab.label} <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${section === tab.id ? 'bg-white/20' : 'bg-white'}`}>{tab.count}</span>
              </button>
            );
          })}
        </div>
      </header>

      {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p>}

      {section === 'todo' && (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-start">
          <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><ClipboardList className="w-5 h-5" /></span>
              <div><h3 className="font-bold text-slate-900">To do listesine görev ekle</h3><p className="text-xs text-slate-500 mt-0.5">Görevler Project Management içindeki To do sekmesinde görünür.</p></div>
            </div>
            <form onSubmit={addTodo} className="space-y-4">
              <div><label className={labelClass}>Görev başlığı</label><input required value={todoTitle} onChange={(event) => setTodoTitle(event.target.value)} className={inputClass} placeholder="Örn. UAT regresyon testlerini tamamla" /></div>
              <div><label className={labelClass}>Açıklama</label><textarea rows={3} value={todoDescription} onChange={(event) => setTodoDescription(event.target.value)} className={inputClass} placeholder="Görevin detayları" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className={labelClass}>Kategori / proje</label><input value={todoCategory} onChange={(event) => setTodoCategory(event.target.value)} className={inputClass} placeholder="Workspace" /></div>
                <div><label className={labelClass}>Termin tarihi</label><input type="date" value={todoDueDate} onChange={(event) => setTodoDueDate(event.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Durum</label><select value={todoStatus} onChange={(event) => setTodoStatus(event.target.value as ProjectTodo['status'])} className={inputClass}><option value="ACTIVE">Active</option><option value="WAITING">Waiting</option><option value="COMPLETED">Completed</option></select></div>
                <div><label className={labelClass}>Öncelik</label><select value={todoPriority} onChange={(event) => setTodoPriority(event.target.value as ProjectTodo['priority'])} className={inputClass}><option>High</option><option>Medium</option><option>Low</option></select></div>
              </div>
              <div className="flex justify-end pt-2"><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700"><Plus className="w-4 h-4" />Görev Ekle</button></div>
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900">Mevcut görevler</h3><p className="text-xs text-slate-500 mt-1">{todos.length} görev</p></div>
            <div className="divide-y divide-slate-100 max-h-[690px] overflow-auto">
              {todos.map((todo) => (
                <div key={todo.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{todo.title}</p><p className="text-xs text-slate-500 mt-1">{todo.category} · {statusLabel[todo.status]} · {todo.priority}</p></div>
                  <button type="button" onClick={() => { persistTodos(todos.filter((item) => item.id !== todo.id)); setMessage('Görev silindi.'); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" aria-label={`${todo.title} görevini sil`}><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {section === 'projects' && (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-start">
          <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><BriefcaseBusiness className="w-5 h-5" /></span>
              <div><h3 className="font-bold text-slate-900">Create Project</h3><p className="text-xs text-slate-500 mt-0.5">Yeni proje Projects listesinde ve detay ekranında görünür.</p></div>
            </div>
            <form onSubmit={addProject} className="space-y-4">
              <div><label className={labelClass}>Project title</label><input required value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} className={inputClass} placeholder="Proje adı" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className={labelClass}>Client / team</label><input value={projectClient} onChange={(event) => setProjectClient(event.target.value)} className={inputClass} placeholder="Core Platform" /></div>
                <div><label className={labelClass}>Project lead</label><input value={projectLead} onChange={(event) => setProjectLead(event.target.value)} className={inputClass} placeholder="Sorumlu kişi" /></div>
                <div><label className={labelClass}>Start date</label><input type="date" value={projectStart} onChange={(event) => setProjectStart(event.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Deadline</label><input type="date" value={projectDeadline} onChange={(event) => setProjectDeadline(event.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Status</label><select value={projectStatus} onChange={(event) => setProjectStatus(event.target.value as ProjectRecord['status'])} className={inputClass}><option value="ONGOING">Ongoing</option><option value="POSTPONED">Postponed</option><option value="FINISHED">Finished</option><option value="CANCELLED">Cancelled</option><option value="INACTIVE">Inactive</option></select></div>
                <div><label className={labelClass}>Budget</label><input value={projectBudget} onChange={(event) => setProjectBudget(event.target.value)} className={inputClass} placeholder="₺0" /></div>
              </div>
              <div><label className={labelClass}>Team members (virgülle ayırın)</label><input value={projectTeam} onChange={(event) => setProjectTeam(event.target.value)} className={inputClass} placeholder="Murat K., Platform Team" /></div>
              <div><label className={labelClass}>Overview</label><textarea rows={3} value={projectOverview} onChange={(event) => setProjectOverview(event.target.value)} className={inputClass} placeholder="Projenin amacı ve kapsamı" /></div>
              <div><label className={labelClass}>Tags (virgülle ayırın)</label><input value={projectTags} onChange={(event) => setProjectTags(event.target.value)} className={inputClass} placeholder="JBOSS EAP, Migration" /></div>
              <div className="flex justify-end pt-2"><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700"><Plus className="w-4 h-4" />Create Project</button></div>
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900">Projects</h3><p className="text-xs text-slate-500 mt-1">{projects.length} proje</p></div>
            <div className="divide-y divide-slate-100 max-h-[760px] overflow-auto">
              {projects.map((project) => (
                <div key={project.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{project.title}</p><p className="text-xs text-slate-500 mt-1">{project.client} · {project.status} · {project.completedTaskCount}/{project.taskCount} tasks</p></div>
                  <button type="button" onClick={() => { persistProjects(projects.filter((item) => item.id !== project.id)); setMessage('Proje silindi.'); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" aria-label={`${project.title} projesini sil`}><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {section === 'kanban' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-5"><span className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center"><FolderKanban className="w-5 h-5" /></span><div><h3 className="font-bold text-slate-900">Create Kanban</h3><p className="text-xs text-slate-500 mt-0.5">Pano adı ve virgülle ayrılmış kolonları belirleyin.</p></div></div>
              <form onSubmit={addBoard} className="space-y-4">
                <div><label className={labelClass}>Board name</label><input required value={boardTitle} onChange={(event) => setBoardTitle(event.target.value)} className={inputClass} placeholder="Örn. Platform Delivery" /></div>
                <div><label className={labelClass}>Description</label><textarea rows={2} value={boardDescription} onChange={(event) => setBoardDescription(event.target.value)} className={inputClass} placeholder="Pano açıklaması" /></div>
                <div><label className={labelClass}>Columns</label><input required value={boardColumns} onChange={(event) => setBoardColumns(event.target.value)} className={inputClass} placeholder="To do, Doing, Review, Release" /></div>
                <div className="flex justify-end"><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700"><Plus className="w-4 h-4" />Create Kanban</button></div>
              </form>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900">Kanban panoları</h3><p className="text-xs text-slate-500 mt-1">{boards.length} pano</p></div>
              <div className="divide-y divide-slate-100 max-h-[410px] overflow-auto">
                {boards.map((board) => (
                  <div key={board.id} className="flex items-start gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{board.title}</p><p className="text-xs text-slate-500 mt-1">{board.columns.length} kolon · {board.columns.reduce((total, column) => total + column.tasks.length, 0)} kart</p></div>
                    <button type="button" onClick={() => { persistBoards(boards.filter((item) => item.id !== board.id)); if (selectedBoardId === board.id) setSelectedBoardId(boards.find((item) => item.id !== board.id)?.id || ''); setMessage('Kanban panosu silindi.'); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" aria-label={`${board.title} panosunu sil`}><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
              <div><h3 className="font-bold text-slate-900">Kanban kartı ekle</h3><p className="text-xs text-slate-500 mt-1">Kartlar seçilen panonun kolonunda görünür.</p></div>
              <select value={selectedBoard?.id || ''} onChange={(event) => { setSelectedBoardId(event.target.value); setCardColumnId(''); }} className={`${inputClass} sm:max-w-xs`}><option value="" disabled>Pano seçin</option>{boards.map((board) => <option key={board.id} value={board.id}>{board.title}</option>)}</select>
            </div>
            {selectedBoard ? (
              <form onSubmit={addKanbanTask} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-end">
                <div className="xl:col-span-2"><label className={labelClass}>Kart başlığı</label><input required value={cardTitle} onChange={(event) => setCardTitle(event.target.value)} className={inputClass} placeholder="İş başlığı" /></div>
                <div><label className={labelClass}>Kolon</label><select value={cardColumnId || selectedBoard.columns[0]?.id || ''} onChange={(event) => setCardColumnId(event.target.value)} className={inputClass}>{selectedBoard.columns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}</select></div>
                <div><label className={labelClass}>Kategori</label><select value={cardCategory} onChange={(event) => setCardCategory(event.target.value as KanbanTask['category'])} className={inputClass}><option value="TASK">Task</option><option value="BUG">Bug</option><option value="ISSUE">Issue</option><option value="FEATURE">Feature</option></select></div>
                <div><label className={labelClass}>Öncelik</label><select value={cardPriority} onChange={(event) => setCardPriority(event.target.value as KanbanTask['priority'])} className={inputClass}><option>High</option><option>Medium</option><option>Low</option></select></div>
                <div><label className={labelClass}>Termin tarihi</label><input type="date" value={cardDueDate} onChange={(event) => setCardDueDate(event.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Açıklama</label><input value={cardDescription} onChange={(event) => setCardDescription(event.target.value)} className={inputClass} placeholder="Kısa açıklama" /></div>
                <div className="md:col-span-2 xl:col-span-4 flex justify-end"><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700"><Plus className="w-4 h-4" />Kart Ekle</button></div>
              </form>
            ) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Önce bir Kanban panosu oluşturun.</p>}
          </section>
        </div>
      )}
    </div>
  );
};
