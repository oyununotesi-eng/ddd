import React, { useState } from 'react';
import { Braces, Check, Copy, FileJson, ShieldCheck, Terminal } from 'lucide-react';
import { getCategoryIcon, TOOL_CATEGORIES } from '../../data/categories';

interface ToolsPageProps {
  onOpenJSONStudio: () => void;
  onOpenCHMODCalculator: () => void;
  onOpenSSLCertificateChecker: () => void;
}

export const ToolsPage: React.FC<ToolsPageProps> = ({ onOpenJSONStudio, onOpenCHMODCalculator, onOpenSSLCertificateChecker }) => {
  const [activeTool, setActiveTool] = useState<'json-formatter' | 'json-studio' | 'chmod-calculator' | 'ssl-certificate-checker'>('json-studio');
  const [selectedCategory, setSelectedCategory] = useState('Developer Utilities');
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState('{"service":"provenir","cluster":"prod","replicas":3,"active":true}');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const toolCatalog = [
    { id: 'json-studio' as const, title: 'JSON Studio', description: 'Format, validate, compare, explore and minify JSON data.', category: 'Developer Utilities', icon: Braces },
    { id: 'json-formatter' as const, title: 'JSON Formatter', description: 'Quickly validate and format a JSON document.', category: 'Text & Data', icon: FileJson },
    { id: 'chmod-calculator' as const, title: 'CHMOD Calculator', description: 'Calculate Linux file permissions, convert octal and symbolic modes, and generate chmod commands.', category: 'Linux & System', icon: Terminal },
    { id: 'ssl-certificate-checker' as const, title: 'SSL/TLS Certificate Checker', description: 'Inspect SSL/TLS certificates, validate live HTTPS endpoints, and explore certificate history.', category: 'Security & Cryptography', icon: ShieldCheck },
  ];
  const visibleTools = toolCatalog.filter((tool) => tool.category === selectedCategory);

  const handleCopy = async () => {
    if (!jsonOutput) return;
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setJsonError('Clipboard access failed. Select and copy the output manually.');
    }
  };

  const handleJsonFormat = () => {
    try {
      setJsonOutput(JSON.stringify(JSON.parse(jsonInput), null, 2));
      setJsonError(null);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 grid grid-cols-1 items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <h2 className="mb-2 border-b border-slate-100 px-2 pb-3 text-xs font-black uppercase tracking-wider text-slate-800">Tools Categories</h2>
          <div className="space-y-1">
            {TOOL_CATEGORIES.map((category) => {
              const CategoryIcon = getCategoryIcon(category.icon);
              const isSelected = selectedCategory === category.id;
              return (
                <button key={category.id} type="button" onClick={() => {
                  setSelectedCategory(category.id);
                  const nextTool = toolCatalog.find((tool) => tool.category === category.id);
                  if (nextTool) setActiveTool(nextTool.id);
                }} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors ${isSelected ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ color: isSelected ? '#fff' : category.color, backgroundColor: isSelected ? 'rgba(255,255,255,.12)' : `${category.color}18` }}><CategoryIcon className="h-4 w-4" /></span>
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {visibleTools.length ? visibleTools.map((tool) => {
            const ToolIcon = tool.icon;
            const isActive = activeTool === tool.id;
            const toolColor = TOOL_CATEGORIES.find((category) => category.id === tool.category)?.color || '#0284c7';
            return (
              <button key={tool.id} type="button" onClick={() => {
                setActiveTool(tool.id);
                if (tool.id === 'json-studio') onOpenJSONStudio();
                if (tool.id === 'chmod-calculator') onOpenCHMODCalculator();
                if (tool.id === 'ssl-certificate-checker') onOpenSSLCertificateChecker();
              }} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${isActive ? 'border-indigo-300 bg-indigo-50/70 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ color: toolColor, backgroundColor: `${toolColor}18` }}><ToolIcon className="h-5 w-5" /></span>
                <span><span className="block text-sm font-bold text-slate-900">{tool.title}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{tool.description}</span></span>
              </button>
            );
          }) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 md:col-span-2">Bu kategoride henüz araç bulunmuyor.</div>}
        </div>
      </div>

      {activeTool === 'json-formatter' && selectedCategory === 'Text & Data' && <div className="mx-auto max-w-5xl space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs animate-in fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-base font-bold text-slate-900">JSON Formatter</h3><p className="mt-1 text-xs text-slate-500">Quick format and syntax validation for JSON.</p></div><button type="button" onClick={handleJsonFormat} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700">Format JSON</button></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">Input JSON</label><textarea rows={14} value={jsonInput} onChange={(event) => { setJsonInput(event.target.value); setJsonError(null); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs outline-none focus:border-indigo-500 focus:bg-white" /></div><div className="space-y-2"><div className="flex items-center justify-between"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">Formatted output</label><button type="button" disabled={!jsonOutput} onClick={() => void handleCopy()} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-40">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copied' : 'Copy'}</button></div>{jsonError ? <div role="alert" className="min-h-[334px] rounded-xl border border-rose-200 bg-rose-50 p-4 font-mono text-xs text-rose-700">Syntax error: {jsonError}</div> : <textarea rows={14} readOnly value={jsonOutput} placeholder="Click Format JSON to validate and format…" className="w-full resize-none rounded-xl bg-slate-950 p-3 font-mono text-xs text-emerald-300 outline-none placeholder:text-slate-500" />}</div></div>
      </div>}
    </div>
  );
};
