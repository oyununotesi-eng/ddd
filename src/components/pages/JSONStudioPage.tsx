import React, { useMemo, useRef, useState } from 'react';
import {
  AlignLeft,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Braces,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleX,
  Copy,
  Download,
  GitCompareArrows,
  Minimize2,
  RotateCcw,
  Search,
  Trash2,
  TreeDeciduous,
  X,
} from 'lucide-react';

type StudioView = 'editor' | 'tree' | 'compare';
type CompareDiff = { path: string; kind: 'added' | 'removed' | 'changed'; before?: unknown; after?: unknown };
type ValidationState = { kind: 'success' | 'error'; message: string } | null;
type JsonEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  label: string;
  placeholder?: string;
  onScrollPosition?: (scrollTop: number) => void;
  onShortcut?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  tabIndent?: string;
};

const samples = {
  object: '{\n  "service": "workspace-api",\n  "version": "1.4.2",\n  "enabled": true,\n  "replicas": 3\n}',
  array: '[\n  { "id": 101, "name": "Murat", "active": true },\n  { "id": 102, "name": "Ada", "active": false },\n  { "id": 103, "name": "Deniz", "active": true }\n]',
  nested: '{\n  "environment": "production",\n  "database": {\n    "host": "db.internal",\n    "port": 5432,\n    "options": { "ssl": true, "poolSize": 12 }\n  },\n  "tags": ["api", "platform", "stable"],\n  "metadata": null\n}',
  invalid: '{\n  "service": "workspace-api",\n  "enabled": true,\n}',
};

const getSyntaxErrorLocation = (raw: string, error: unknown) => {
  const message = error instanceof Error ? error.message : 'JSON could not be parsed.';
  const position = message.match(/position\s+(\d+)/i);
  if (!position) return { message, location: null as string | null, index: null as number | null };
  const index = Math.min(Number(position[1]), raw.length);
  const before = raw.slice(0, index);
  const line = before.split('\n').length;
  const column = index - before.lastIndexOf('\n');
  return { message, location: `Line ${line}, column ${column}`, index };
};

const getMatches = (text: string, query: string, caseSensitive: boolean) => {
  if (!query) return [] as number[];
  const source = caseSensitive ? text : text.toLocaleLowerCase();
  const needle = caseSensitive ? query : query.toLocaleLowerCase();
  const matches: number[] = [];
  let index = 0;
  while ((index = source.indexOf(needle, index)) !== -1) {
    matches.push(index);
    index += Math.max(needle.length, 1);
  }
  return matches;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const getStats = (value: unknown, raw: string) => {
  const stats = { objects: 0, arrays: 0, keys: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0, maxDepth: 0, bytes: new TextEncoder().encode(raw).length };
  const pending: { value: unknown; depth: number }[] = [{ value, depth: 0 }];
  while (pending.length) {
    const current = pending.pop()!;
    stats.maxDepth = Math.max(stats.maxDepth, current.depth);
    if (Array.isArray(current.value)) {
      stats.arrays += 1;
      current.value.forEach((child) => pending.push({ value: child, depth: current.depth + 1 }));
    } else if (isRecord(current.value)) {
      stats.objects += 1;
      const entries = Object.entries(current.value);
      stats.keys += entries.length;
      entries.forEach(([, child]) => pending.push({ value: child, depth: current.depth + 1 }));
    } else if (typeof current.value === 'string') stats.strings += 1;
    else if (typeof current.value === 'number') stats.numbers += 1;
    else if (typeof current.value === 'boolean') stats.booleans += 1;
    else if (current.value === null) stats.nulls += 1;
  }
  return stats;
};

const compareValues = (before: unknown, after: unknown): CompareDiff[] => {
  type Work =
    | { kind: 'compare'; path: string; before: unknown; after: unknown }
    | { kind: 'added'; path: string; after: unknown }
    | { kind: 'removed'; path: string; before: unknown };
  const diffs: CompareDiff[] = [];
  const pending: Work[] = [{ kind: 'compare', path: '$', before, after }];
  while (pending.length) {
    const item = pending.pop()!;
    if (item.kind === 'added') { diffs.push({ path: item.path, kind: 'added', after: item.after }); continue; }
    if (item.kind === 'removed') { diffs.push({ path: item.path, kind: 'removed', before: item.before }); continue; }
    if (Object.is(item.before, item.after)) continue;
    if (Array.isArray(item.before) && Array.isArray(item.after)) {
      const length = Math.max(item.before.length, item.after.length);
      for (let index = length - 1; index >= 0; index -= 1) {
        const path = `${item.path}[${index}]`;
        if (index >= item.before.length) pending.push({ kind: 'added', path, after: item.after[index] });
        else if (index >= item.after.length) pending.push({ kind: 'removed', path, before: item.before[index] });
        else pending.push({ kind: 'compare', path, before: item.before[index], after: item.after[index] });
      }
      continue;
    }
    if (isRecord(item.before) && isRecord(item.after)) {
      const keys = [...new Set([...Object.keys(item.before), ...Object.keys(item.after)])].sort();
      for (let index = keys.length - 1; index >= 0; index -= 1) {
        const key = keys[index];
        const path = /^[A-Za-z_$][\w$]*$/.test(key) ? `${item.path}.${key}` : `${item.path}[${JSON.stringify(key)}]`;
        if (!Object.hasOwn(item.before, key)) pending.push({ kind: 'added', path, after: item.after[key] });
        else if (!Object.hasOwn(item.after, key)) pending.push({ kind: 'removed', path, before: item.before[key] });
        else pending.push({ kind: 'compare', path, before: item.before[key], after: item.after[key] });
      }
      continue;
    }
    diffs.push({ path: item.path, kind: 'changed', before: item.before, after: item.after });
  }
  return diffs;
};

const syntaxTokens = (value: string) => {
  const pattern = /"(?:\\.|[^"\\])*"|-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|\b(?:true|false|null)\b|[{}\[\],:]|\s+|./gs;
  return [...value.matchAll(pattern)].map((match) => ({ token: match[0], index: match.index ?? 0 }));
};

const countEditorLines = (value: string) => {
  let lines = 1;
  for (let index = 0; index < value.length && lines < 20_000; index += 1) {
    if (value.charCodeAt(index) === 10) lines += 1;
  }
  return lines;
};

const JsonCodeEditor = React.forwardRef<HTMLTextAreaElement, JsonEditorProps>(
  ({ value, onChange, label, placeholder, onScrollPosition, onShortcut, tabIndent = '  ' }, forwardedRef) => {
    const highlightRef = useRef<HTMLPreElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);
    const tokens = useMemo(() => value.length <= 50_000 ? syntaxTokens(value) : null, [value]);
    const onScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
      const { scrollTop, scrollLeft } = event.currentTarget;
      if (highlightRef.current) {
        highlightRef.current.scrollTop = scrollTop;
        highlightRef.current.scrollLeft = scrollLeft;
      }
      if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
      onScrollPosition?.(scrollTop);
    };

    return (
      <div className="flex h-full min-h-[380px] overflow-hidden rounded-b-xl bg-slate-950 text-[12px] leading-[22px] text-slate-100">
        <div ref={gutterRef} aria-hidden="true" className="w-12 shrink-0 overflow-hidden border-r border-slate-800 bg-slate-900/70 py-3 pr-3 text-right font-mono text-[11px] leading-[22px] text-slate-500">
          {Array.from({ length: countEditorLines(value) }, (_, index) => <div key={index}>{index + 1}</div>)}
        </div>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <pre ref={highlightRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre py-3 pl-4 pr-4 font-mono text-[12px] leading-[22px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {value ? tokens ? tokens.map(({ token, index }) => {
              let color = 'text-slate-200';
              if (token.startsWith('"')) color = /^\s*:/.test(value.slice(index + token.length)) ? 'text-sky-300' : 'text-emerald-300';
              else if (/^-?(?:\d|\.\d)/.test(token)) color = 'text-amber-300';
              else if (token === 'true' || token === 'false') color = 'text-violet-300';
              else if (token === 'null') color = 'text-rose-300';
              else if (/^[{}\[\],:]$/.test(token)) color = 'text-slate-400';
              return <span key={`${index}-${token}`} className={color}>{token}</span>;
            }) : <span className="text-slate-200">{value}</span> : <span className="text-slate-500">{placeholder || 'Paste or type JSON here…'}</span>}
            {'\n'}
          </pre>
          <textarea
            ref={forwardedRef}
            aria-label={label}
            value={value}
            readOnly={!onChange}
            spellCheck={false}
            wrap="off"
            onScroll={onScroll}
            onChange={(event) => onChange?.(event.target.value)}
            onKeyDown={(event) => {
              onShortcut?.(event);
              if (event.key === 'Tab' && onChange) {
                event.preventDefault();
                const target = event.currentTarget;
                const start = target.selectionStart;
                const end = target.selectionEnd;
                const next = `${value.slice(0, start)}${tabIndent}${value.slice(end)}`;
                onChange(next);
                requestAnimationFrame(() => target.setSelectionRange(start + tabIndent.length, start + tabIndent.length));
              }
            }}
            className={`absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent py-3 pl-4 pr-4 font-mono text-[12px] leading-[22px] text-transparent caret-sky-300 outline-none selection:bg-sky-400/30 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${onChange ? '' : 'cursor-default'}`}
          />
        </div>
      </div>
    );
  },
);
JsonCodeEditor.displayName = 'JsonCodeEditor';

const JsonTreeView: React.FC<{ value: unknown; onCopy: (text: string, label: string) => void }> = ({ value, onCopy }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ $: true });
  let visited = 0;

  const renderNode = (key: string, node: unknown, path: string, depth: number): React.ReactNode => {
    visited += 1;
    if (visited > 1400) return <p key={`${path}-limit`} className="py-2 text-xs text-slate-400">Tree view is limited to 1,400 visible nodes for responsiveness.</p>;
    const container = Array.isArray(node) || isRecord(node);
    const children = Array.isArray(node) ? node.map((child, index) => [String(index), child] as const) : isRecord(node) ? Object.entries(node) : [];
    const open = expanded[path] ?? depth < 1;
    const summary = Array.isArray(node) ? `Array(${node.length})` : isRecord(node) ? `Object(${children.length})` : '';
    const valueLabel = typeof node === 'string' ? JSON.stringify(node) : String(node);
    const valueColor = node === null ? 'text-rose-600' : typeof node === 'string' ? 'text-emerald-700' : typeof node === 'number' ? 'text-amber-700' : typeof node === 'boolean' ? 'text-violet-700' : 'text-slate-500';

    return (
      <div key={path}>
        <div className="group flex min-h-9 items-center gap-2 rounded-lg px-2 hover:bg-slate-50" style={{ paddingLeft: `${depth * 18 + 8}px` }}>
          {container ? <button type="button" aria-label={`${open ? 'Collapse' : 'Expand'} ${path}`} onClick={() => setExpanded((current) => ({ ...current, [path]: !open }))} className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-200">{open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</button> : <span className="w-5 shrink-0" />}
          {path !== '$' && <span className="font-mono text-xs font-semibold text-sky-800">{Array.isArray(node) ? `[${key}]` : `${JSON.stringify(key)}:`}</span>}
          <span className={`min-w-0 truncate font-mono text-xs ${container ? 'text-slate-500' : valueColor}`}>{container ? summary : valueLabel}</span>
          <div className="ml-auto flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"><button type="button" onClick={() => onCopy(path, 'JSONPath')} title="Copy JSONPath" aria-label={`Copy path ${path}`} className="rounded p-1 text-slate-400 hover:bg-white hover:text-blue-600"><span className="font-mono text-[10px]">$</span></button><button type="button" onClick={() => onCopy(JSON.stringify(node, null, 2) ?? 'null', 'Value')} title="Copy value" aria-label={`Copy value at ${path}`} className="rounded p-1 text-slate-400 hover:bg-white hover:text-blue-600"><Copy className="h-3.5 w-3.5" /></button></div>
        </div>
        {container && open && <div>{children.slice(0, 1400).map(([childKey, child]) => {
          const childPath = Array.isArray(node) ? `${path}[${childKey}]` : /^[A-Za-z_$][\w$]*$/.test(childKey) ? `${path}.${childKey}` : `${path}[${JSON.stringify(childKey)}]`;
          return renderNode(childKey, child, childPath, depth + 1);
        })}{children.length > 1400 && <p className="py-2 text-xs text-slate-400" style={{ paddingLeft: `${(depth + 1) * 18 + 8}px` }}>{children.length - 1400} more items hidden in this branch.</p>}</div>}
      </div>
    );
  };

  return <div className="max-h-[620px] overflow-auto rounded-xl border border-slate-200 bg-white p-3">{renderNode('', value, '$', 0)}</div>;
};

export const JSONStudioPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [view, setView] = useState<StudioView>('editor');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<'2' | '4' | 'tab'>('2');
  const [validation, setValidation] = useState<ValidationState>(null);
  const [toast, setToast] = useState('');
  const [treeSource, setTreeSource] = useState<'input' | 'output'>('input');
  const [search, setSearch] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [activeMatch, setActiveMatch] = useState(-1);
  const [compareLeft, setCompareLeft] = useState('');
  const [compareRight, setCompareRight] = useState('');
  const [compareError, setCompareError] = useState('');
  const [diffs, setDiffs] = useState<CompareDiff[] | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const parsedInput = useMemo(() => {
    if (!input.trim()) return { valid: false as const, value: null, error: null as string | null, location: null as string | null };
    try { return { valid: true as const, value: JSON.parse(input) as unknown, error: null, location: null }; }
    catch (error) { const detail = getSyntaxErrorLocation(input, error); return { valid: false as const, value: null, error: detail.message, location: detail.location }; }
  }, [input]);
  const parsedOutput = useMemo(() => {
    if (!output.trim()) return { valid: false as const, value: null };
    try { return { valid: true as const, value: JSON.parse(output) as unknown }; }
    catch { return { valid: false as const, value: null }; }
  }, [output]);
  const treeValid = treeSource === 'input' ? parsedInput.valid : parsedOutput.valid;
  const treeValue = treeSource === 'input' ? parsedInput.value : parsedOutput.value;
  const searchMatches = useMemo(() => getMatches(input, search, caseSensitive), [input, search, caseSensitive]);
  const stats = useMemo(() => parsedInput.valid ? getStats(parsedInput.value, input) : null, [parsedInput, input]);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  };

  const focusInputAt = (index: number | null) => {
    if (index === null || !inputRef.current) return;
    const editor = inputRef.current;
    editor.focus();
    editor.setSelectionRange(index, Math.min(index + 1, input.length));
    const line = input.slice(0, index).split('\n').length;
    editor.scrollTop = Math.max(0, (line - 2) * 22);
  };

  const formatInput = (compact = false) => {
    if (!input.trim()) {
      setValidation({ kind: 'error', message: 'Enter JSON to continue.' });
      return;
    }
    try {
      const value = JSON.parse(input) as unknown;
      const spacing: number | string = indent === 'tab' ? '\t' : Number(indent);
      setOutput(JSON.stringify(value, null, compact ? 0 : spacing) ?? '');
      setValidation({ kind: 'success', message: compact ? 'JSON minified successfully.' : 'Valid JSON formatted successfully.' });
    } catch (error) {
      const detail = getSyntaxErrorLocation(input, error);
      setValidation({ kind: 'error', message: `${detail.location ? `${detail.location}: ` : ''}${detail.message}` });
      focusInputAt(detail.index);
    }
  };

  const validateInput = () => {
    if (!input.trim()) { setValidation({ kind: 'error', message: 'Enter JSON to validate.' }); return; }
    try {
      JSON.parse(input);
      setValidation({ kind: 'success', message: 'Valid JSON syntax. No JSON Schema was applied.' });
    } catch (error) {
      const detail = getSyntaxErrorLocation(input, error);
      setValidation({ kind: 'error', message: `${detail.location ? `${detail.location}: ` : ''}${detail.message}` });
      focusInputAt(detail.index);
    }
  };

  const copyText = async (text: string, label = 'JSON') => {
    if (!text) { showToast('Nothing to copy.'); return; }
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else throw new Error('Clipboard API unavailable');
      showToast(`${label} copied to clipboard.`);
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { copied = false; }
      fallback.remove();
      showToast(copied ? `${label} copied to clipboard.` : 'Clipboard access failed. Select and copy the text manually.');
    }
  };

  const downloadOutput = () => {
    if (!output) { showToast('Format or minify JSON before downloading.'); return; }
    const file = new Blob([output], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'json-output.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('json-output.json downloaded.');
  };

  const moveSearch = (direction: 1 | -1) => {
    if (!searchMatches.length) { setActiveMatch(-1); return; }
    const next = (activeMatch + direction + searchMatches.length) % searchMatches.length;
    setActiveMatch(next);
    const start = searchMatches[next];
    const editor = inputRef.current;
    if (editor) {
      editor.focus();
      editor.setSelectionRange(start, start + search.length);
      const line = input.slice(0, start).split('\n').length;
      editor.scrollTop = Math.max(0, (line - 2) * 22);
    }
  };

  const runCompare = () => {
    setCompareError('');
    setDiffs(null);
    if (!compareLeft.trim() || !compareRight.trim()) { setCompareError('Enter JSON in both comparison editors.'); return; }
    let left: unknown;
    let right: unknown;
    try {
      left = JSON.parse(compareLeft) as unknown;
    } catch (error) {
      const detail = getSyntaxErrorLocation(compareLeft, error);
      setCompareError(`JSON A is invalid. ${detail.location ? `${detail.location}: ` : ''}${detail.message}`);
      return;
    }
    try {
      right = JSON.parse(compareRight) as unknown;
    } catch (error) {
      const detail = getSyntaxErrorLocation(compareRight, error);
      setCompareError(`JSON B is invalid. ${detail.location ? `${detail.location}: ` : ''}${detail.message}`);
      return;
    }
    setDiffs(compareValues(left, right));
  };

  const views: { id: StudioView; label: string; icon: React.ElementType }[] = [
    { id: 'editor', label: 'Editor', icon: AlignLeft },
    { id: 'tree', label: 'Tree View', icon: TreeDeciduous },
    { id: 'compare', label: 'Compare', icon: GitCompareArrows },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-xs hover:border-slate-300 hover:text-slate-900"><ArrowLeft className="h-4 w-4" />Tools</button>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Braces className="h-6 w-6" /></div>
          <div><h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">JSON Studio</h1><p className="text-xs text-slate-500">Format, validate, compare, explore and minify JSON data.</p></div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Runs locally in your browser</span>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex flex-wrap gap-1">{views.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} onClick={() => setView(item.id)} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${view === item.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</div>
        <button type="button" onClick={() => { setInput(''); setOutput(''); setValidation(null); setSearch(''); setActiveMatch(-1); setCompareLeft(''); setCompareRight(''); setCompareError(''); setDiffs(null); }} className="mb-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"><Trash2 className="h-3.5 w-3.5" />Clear all</button>
      </div>

      {view === 'editor' && <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => formatInput(false)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"><AlignLeft className="h-4 w-4" />Format</button>
            <button type="button" onClick={validateInput} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><CircleCheck className="h-4 w-4" />Validate</button>
            <button type="button" onClick={() => formatInput(true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><Minimize2 className="h-4 w-4" />Minify</button>
            <label className="ml-1 flex items-center gap-2 text-xs font-semibold text-slate-500">Indent <select value={indent} onChange={(event) => setIndent(event.target.value as '2' | '4' | 'tab')} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tabs</option></select></label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">Sample <select defaultValue="" onChange={(event) => { if (event.target.value) { setInput(samples[event.target.value as keyof typeof samples]); setOutput(''); setValidation(null); setActiveMatch(-1); event.target.value = ''; } }} className="max-w-[150px] rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none"><option value="">Choose sample</option><option value="object">Object</option><option value="array">Array</option><option value="nested">Nested JSON</option><option value="invalid">Invalid JSON</option></select></label>
            <button type="button" onClick={() => { setInput(''); setOutput(''); setValidation(null); setActiveMatch(-1); }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><RotateCcw className="h-3.5 w-3.5" />Clear input</button>
          </div>
        </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3"><div><h2 className="text-sm font-bold text-slate-900">Input JSON</h2><p className="mt-0.5 text-[10px] text-slate-400">Edit your source data</p></div><div className="flex items-center gap-2"><label className="flex items-center gap-1.5 text-[11px] text-slate-500"><Search className="h-3.5 w-3.5" /><input value={search} onChange={(event) => { setSearch(event.target.value); setActiveMatch(-1); }} placeholder="Search keys and values" className="w-36 border-b border-slate-200 py-1 outline-none focus:border-indigo-500 sm:w-44" /></label><span className="whitespace-nowrap text-[10px] text-slate-400">{search ? `${searchMatches.length} matches` : `${input.length} chars`}</span></div></div>
            <JsonCodeEditor ref={inputRef} value={input} tabIndent={indent === 'tab' ? '\t' : ' '.repeat(Number(indent))} onChange={(next) => { setInput(next); setOutput(''); setValidation(null); setActiveMatch(-1); }} onShortcut={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); formatInput(false); } }} label="Input JSON" placeholder="Paste or type JSON here…" />
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2"><label className="flex items-center gap-2 text-[10px] font-medium text-slate-500"><input type="checkbox" checked={caseSensitive} onChange={(event) => { setCaseSensitive(event.target.checked); setActiveMatch(-1); }} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />Case sensitive</label><div className="flex items-center gap-1"><button type="button" disabled={!searchMatches.length} onClick={() => moveSearch(-1)} aria-label="Previous match" className="rounded p-1.5 text-slate-500 hover:bg-white disabled:opacity-40"><ArrowUp className="h-3.5 w-3.5" /></button><span className="min-w-12 text-center text-[10px] text-slate-500">{searchMatches.length ? `${Math.max(activeMatch, 0) + 1}/${searchMatches.length}` : '0/0'}</span><button type="button" disabled={!searchMatches.length} onClick={() => moveSearch(1)} aria-label="Next match" className="rounded p-1.5 text-slate-500 hover:bg-white disabled:opacity-40"><ArrowDown className="h-3.5 w-3.5" /></button></div></div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3"><div><h2 className="text-sm font-bold text-slate-900">Output JSON</h2><p className="mt-0.5 text-[10px] text-slate-400">Formatted or minified result</p></div><div className="flex items-center gap-1"><button type="button" onClick={() => void copyText(output)} title="Copy output" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"><Copy className="h-3.5 w-3.5" />Copy</button><button type="button" onClick={downloadOutput} title="Download JSON" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"><Download className="h-3.5 w-3.5" />Download</button></div></div>
            <JsonCodeEditor value={output} label="Output JSON" placeholder="Formatted output will appear here…" />
            <div className="flex min-h-10 items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2 text-[11px]">{validation ? validation.kind === 'success' ? <CircleCheck className="h-4 w-4 shrink-0 text-emerald-600" /> : <CircleX className="h-4 w-4 shrink-0 text-rose-600" /> : <span className="h-4 w-4 shrink-0 rounded-full border border-slate-300" />}<span className={validation?.kind === 'error' ? 'text-rose-700' : validation?.kind === 'success' ? 'text-emerald-700' : 'text-slate-500'}>{validation?.message || 'Ready. JSON is processed in this browser.'}</span></div>
          </section>
        </div>

        {input.trim() && !parsedInput.valid && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">Statistics are available after the input contains valid JSON.</div>}
        {stats && <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"><div className="mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-indigo-600" /><h2 className="text-xs font-bold text-slate-800">Input statistics</h2><span className="text-[10px] text-slate-400">Valid JSON · size measured in UTF-8 bytes</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">{[
          ['Objects', stats.objects], ['Arrays', stats.arrays], ['Properties', stats.keys], ['Strings', stats.strings], ['Numbers', stats.numbers], ['Booleans', stats.booleans], ['Nulls', stats.nulls], ['Max depth', stats.maxDepth],
        ].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 px-3 py-2"><span className="block text-[10px] font-medium text-slate-500">{label}</span><span className="mt-0.5 block text-sm font-bold text-slate-900">{value}</span></div>)}<div className="col-span-2 rounded-lg bg-indigo-50 px-3 py-2 sm:col-span-4 lg:col-span-2"><span className="block text-[10px] font-medium text-indigo-700">Input size</span><span className="mt-0.5 block text-sm font-bold text-indigo-900">{stats.bytes.toLocaleString()} bytes</span></div></div></section>}
      </div>}

      {view === 'tree' && <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-slate-900">JSON Tree View</h2><p className="mt-1 text-xs text-slate-500">Read-only hierarchy with copyable JSONPaths and values.</p></div><div className="flex items-center gap-2"><label className="text-xs font-semibold text-slate-500">Source</label><select value={treeSource} onChange={(event) => setTreeSource(event.target.value as 'input' | 'output')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><option value="input">Input JSON</option><option value="output">Output JSON</option></select></div></div>{!treeValid ? <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">{treeSource === 'input' ? parsedInput.error ? `Input is invalid: ${parsedInput.error}` : 'Enter valid JSON in the Editor view to explore its tree.' : 'Create valid output JSON in the Editor view first.'}</div> : <JsonTreeView value={treeValue} onCopy={(text, label) => void copyText(text, label)} />}</section>}

      {view === 'compare' && <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs"><div><h2 className="text-sm font-bold text-slate-900">Compare JSON</h2><p className="mt-1 text-xs text-slate-500">Object key order is ignored; array order is significant.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setCompareLeft(input); setCompareRight(output); setDiffs(null); setCompareError(''); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Use editor values</button><button type="button" onClick={() => { setCompareLeft(''); setCompareRight(''); setDiffs(null); setCompareError(''); }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><X className="h-3.5 w-3.5" />Clear</button><button type="button" onClick={runCompare} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700"><GitCompareArrows className="h-4 w-4" />Compare</button></div></div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2"><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"><div className="border-b border-slate-200 px-4 py-3"><h3 className="text-xs font-bold text-slate-800">JSON A · Original</h3></div><JsonCodeEditor value={compareLeft} onChange={(value) => { setCompareLeft(value); setDiffs(null); }} label="First JSON for comparison" /></section><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"><div className="border-b border-slate-200 px-4 py-3"><h3 className="text-xs font-bold text-slate-800">JSON B · Updated</h3></div><JsonCodeEditor value={compareRight} onChange={(value) => { setCompareRight(value); setDiffs(null); }} label="Second JSON for comparison" /></section></div>
        {compareError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"><CircleX className="mt-0.5 h-4 w-4 shrink-0" />{compareError}</div>}
        {diffs && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"><div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><h3 className="text-sm font-bold text-slate-900">Comparison results</h3><span className="text-xs text-slate-500">{diffs.length} {diffs.length === 1 ? 'difference' : 'differences'}</span></div>{diffs.length ? <div className="divide-y divide-slate-100">{diffs.map((diff, index) => <div key={`${diff.path}-${index}`} className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[90px_minmax(120px,.8fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-start"><span className={`w-fit rounded px-2 py-1 text-[10px] font-bold uppercase ${diff.kind === 'added' ? 'bg-emerald-50 text-emerald-700' : diff.kind === 'removed' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{diff.kind}</span><code className="break-all text-xs font-semibold text-slate-700">{diff.path}</code><pre className="overflow-auto rounded bg-rose-50 p-2 text-[11px] text-rose-800">{diff.kind === 'added' ? '—' : JSON.stringify(diff.before, null, 2)}</pre><pre className="overflow-auto rounded bg-emerald-50 p-2 text-[11px] text-emerald-800">{diff.kind === 'removed' ? '—' : JSON.stringify(diff.after, null, 2)}</pre></div>)}</div> : <div className="flex items-center gap-2 px-4 py-6 text-sm font-semibold text-emerald-700"><CircleCheck className="h-4 w-4" />The JSON documents are equivalent.</div>}</section>}
      </section>}

      {toast && <div role="status" className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl"><Check className="h-4 w-4 text-emerald-400" />{toast}</div>}
    </div>
  );
};
