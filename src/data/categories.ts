import {
  Activity,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  Code2,
  Cpu,
  FileText,
  FlaskConical,
  GitBranch,
  Globe2,
  GraduationCap,
  LayoutGrid,
  Network,
  Puzzle,
  Server,
  ShieldCheck,
  Terminal,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export interface WorkspaceCategory {
  id: string;
  label: string;
  color: string;
  icon: string;
}

export const BOOKMARK_CATEGORIES_KEY = 'murat_bookmark_categories';

export const DEFAULT_BOOKMARK_CATEGORIES: WorkspaceCategory[] = [
  { id: 'all', label: 'Tümü', color: '#f97316', icon: 'LayoutGrid' },
  { id: 'Dev Tools', label: 'Dev Tools', color: '#6366f1', icon: 'Terminal' },
  { id: 'Project Management', label: 'Project Management', color: '#8b5cf6', icon: 'BriefcaseBusiness' },
  { id: 'Documentation', label: 'Documentation', color: '#0284c7', icon: 'BookOpen' },
  { id: 'Infrastructure', label: 'Infrastructure', color: '#0ea5e9', icon: 'Server' },
  { id: 'Monitoring', label: 'Monitoring', color: '#10b981', icon: 'Activity' },
  { id: 'Logs', label: 'Logs', color: '#f59e0b', icon: 'FileText' },
  { id: 'DevOps', label: 'DevOps', color: '#f97316', icon: 'GitBranch' },
  { id: 'Security', label: 'Security', color: '#ef4444', icon: 'ShieldCheck' },
  { id: 'Containers', label: 'Containers', color: '#06b6d4', icon: 'Boxes' },
  { id: 'Web & Middleware', label: 'Web & Middleware', color: '#0891b2', icon: 'Globe2' },
  { id: '3rd Party', label: '3rd Party', color: '#7c3aed', icon: 'Puzzle' },
  { id: 'Education', label: 'Education', color: '#2563eb', icon: 'GraduationCap' },
  { id: 'LAB', label: 'LAB', color: '#db2777', icon: 'FlaskConical' },
];

export const TOOL_CATEGORIES: WorkspaceCategory[] = [
  { id: 'Text & Data', label: 'Text & Data', color: '#0284c7', icon: 'FileText' },
  { id: 'Linux & System', label: 'Linux & System', color: '#64748b', icon: 'Terminal' },
  { id: 'Web & API', label: 'Web & API', color: '#0891b2', icon: 'Globe2' },
  { id: 'Security & Cryptography', label: 'Security & Cryptography', color: '#e11d48', icon: 'ShieldCheck' },
  { id: 'DevOps & Infrastructure', label: 'DevOps & Infrastructure', color: '#7c3aed', icon: 'Server' },
  { id: 'Developer Utilities', label: 'Developer Utilities', color: '#4f46e5', icon: 'Code2' },
  { id: 'Encoding & Conversion', label: 'Encoding & Conversion', color: '#d97706', icon: 'GitBranch' },
];

export const CATEGORY_ICON_OPTIONS = [
  'LayoutGrid',
  'Terminal',
  'BriefcaseBusiness',
  'BookOpen',
  'Server',
  'Activity',
  'FileText',
  'GitBranch',
  'ShieldCheck',
  'Boxes',
  'Globe2',
  'Puzzle',
  'GraduationCap',
  'FlaskConical',
  'Code2',
];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Activity,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  Code2,
  Cpu,
  FileText,
  FlaskConical,
  GitBranch,
  Globe2,
  GraduationCap,
  LayoutGrid,
  Network,
  Puzzle,
  Server,
  ShieldCheck,
  Terminal,
  Workflow,
  Wrench,
  Zap,
};

export const getCategoryIcon = (iconName: string): LucideIcon =>
  CATEGORY_ICONS[iconName] || LayoutGrid;

export const readBookmarkCategories = (): WorkspaceCategory[] => {
  if (typeof window === 'undefined') return DEFAULT_BOOKMARK_CATEGORIES.map((category) => ({ ...category }));

  try {
    const saved = localStorage.getItem(BOOKMARK_CATEGORIES_KEY);
    if (!saved) return DEFAULT_BOOKMARK_CATEGORIES.map((category) => ({ ...category }));

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return DEFAULT_BOOKMARK_CATEGORIES.map((category) => ({ ...category }));

    const categories = parsed.map((item): WorkspaceCategory | null => {
      if (typeof item === 'string') {
        const defaultCategory = DEFAULT_BOOKMARK_CATEGORIES.find(
          (category) => category.label.toLowerCase() === item.toLowerCase(),
        );
        return defaultCategory || { id: item, label: item, color: '#64748b', icon: 'LayoutGrid' };
      }
      if (!item || typeof item !== 'object') return null;
      const category = item as Partial<WorkspaceCategory>;
      if (typeof category.label !== 'string' || !category.label.trim()) return null;
      return {
        id: typeof category.id === 'string' ? category.id : category.label,
        label: category.label,
        color: typeof category.color === 'string' ? category.color : '#64748b',
        icon: typeof category.icon === 'string' ? category.icon : 'LayoutGrid',
      };
    }).filter((category): category is WorkspaceCategory => category !== null);

    const savedByLabel = new Map(categories.map((category) => [category.label.toLowerCase(), category]));
    const allCategory = {
      ...DEFAULT_BOOKMARK_CATEGORIES[0],
      ...(savedByLabel.get('tümü') || categories.find((category) => category.id === 'all')),
      id: 'all',
      label: 'Tümü',
    };
    const defaults = DEFAULT_BOOKMARK_CATEGORIES.slice(1).map((defaultCategory) => ({
      ...defaultCategory,
      ...(savedByLabel.get(defaultCategory.label.toLowerCase()) || {}),
      id: defaultCategory.id,
      label: defaultCategory.label,
    }));
    const defaultLabels = new Set(DEFAULT_BOOKMARK_CATEGORIES.map((category) => category.label.toLowerCase()));
    const customCategories = categories.filter((category) =>
      category.id !== 'all' && !defaultLabels.has(category.label.toLowerCase()),
    );
    return [allCategory, ...defaults, ...customCategories];
  } catch {
    return DEFAULT_BOOKMARK_CATEGORIES.map((category) => ({ ...category }));
  }
};

export const saveBookmarkCategories = (categories: WorkspaceCategory[]) => {
  localStorage.setItem(BOOKMARK_CATEGORIES_KEY, JSON.stringify(categories));
};
