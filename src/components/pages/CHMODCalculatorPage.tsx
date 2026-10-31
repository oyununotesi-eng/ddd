import React, { useMemo, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, Copy, RotateCcw, Terminal } from 'lucide-react';
import {
  DEFAULT_CHMOD_PERMISSIONS,
  formatChmodOctal,
  formatChmodSymbolic,
  parseChmodMode,
  quoteShellArgument,
  type ChmodPermissions,
  type PermissionGroup,
} from '../../utils/chmod';

interface CHMODCalculatorPageProps {
  onBack: () => void;
}

const presets = [
  { mode: '644', label: 'Standard file', description: 'Owner reads and writes; others read.' },
  { mode: '755', label: 'Executable / directory', description: 'Owner has full access; others can read and execute.' },
  { mode: '700', label: 'Owner only', description: 'Only the owner can access.' },
  { mode: '600', label: 'Private file', description: 'Only the owner can read and write.' },
  { mode: '750', label: 'Limited group access', description: 'Owner has full access; group can read and execute.' },
  { mode: '640', label: 'Private with group read', description: 'Owner reads and writes; group can read.' },
  { mode: '777', label: 'Everyone full access', description: 'Allows anyone to read, write, and execute.', warning: true },
];

const groups: { id: PermissionGroup; label: string; detail: string }[] = [
  { id: 'owner', label: 'Owner', detail: 'The file owner' },
  { id: 'group', label: 'Group', detail: 'Users in the file group' },
  { id: 'others', label: 'Others', detail: 'Everyone else' },
];

const permissionOptions = [
  { label: 'Read', letter: 'r', value: 4, description: 'View file contents or list a directory.' },
  { label: 'Write', letter: 'w', value: 2, description: 'Change a file or create/remove directory entries.' },
  { label: 'Execute', letter: 'x', value: 1, description: 'Run a file or enter/search a directory.' },
];

const updatePermissionBit = (value: number, bit: number) => value & bit ? value & ~bit : value | bit;

export const CHMODCalculatorPage: React.FC<CHMODCalculatorPageProps> = ({ onBack }) => {
  const [permissions, setPermissions] = useState<ChmodPermissions>({ ...DEFAULT_CHMOD_PERMISSIONS });
  const [modeInput, setModeInput] = useState('644');
  const [modeError, setModeError] = useState('');
  const [filePath, setFilePath] = useState('');
  const [recursive, setRecursive] = useState(false);
  const [notice, setNotice] = useState('');

  const octal = useMemo(() => formatChmodOctal(permissions), [permissions]);
  const symbolic = useMemo(() => formatChmodSymbolic(permissions), [permissions]);
  const command = useMemo(() => {
    const path = filePath.trim();
    if (!path) return '';
    return `chmod ${recursive ? '-R ' : ''}${octal} -- ${quoteShellArgument(path)}`;
  }, [filePath, octal, recursive]);
  const specialDigit = (permissions.setuid ? 4 : 0) + (permissions.setgid ? 2 : 0) + (permissions.sticky ? 1 : 0);
  const specialLabels = [permissions.setuid && 'setuid', permissions.setgid && 'setgid', permissions.sticky && 'sticky bit'].filter(Boolean).join(' + ');

  const applyPermissions = (next: ChmodPermissions) => {
    setPermissions(next);
    setModeInput(formatChmodOctal(next));
    setModeError('');
    setNotice('');
  };

  const applyPreset = (mode: string) => {
    const parsed = parseChmodMode(mode);
    if (parsed.ok) applyPermissions(parsed.permissions);
  };

  const handleModeInput = (value: string) => {
    setModeInput(value);
    setNotice('');
    const parsed = parseChmodMode(value);
    if (parsed.ok) {
      setPermissions(parsed.permissions);
      setModeError('');
    } else {
      setModeError(parsed.error);
    }
  };

  const toggleGroupPermission = (group: PermissionGroup, bit: number) => {
    applyPermissions({ ...permissions, [group]: updatePermissionBit(permissions[group], bit) });
  };

  const copyCommand = async () => {
    if (!command) {
      setNotice('Enter a file or directory path to generate a command.');
      return;
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(command);
      setNotice('Command copied. It has not been run on your system.');
    } catch {
      setNotice('Clipboard access failed. Select and copy the command manually.');
    }
  };

  const reset = () => {
    setPermissions({ ...DEFAULT_CHMOD_PERMISSIONS });
    setModeInput('644');
    setModeError('');
    setFilePath('');
    setRecursive(false);
    setNotice('Permissions reset to 644.');
  };

  const specialPermission = (key: 'setuid' | 'setgid' | 'sticky', label: string, description: string) => (
    <label key={key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
      <input
        type="checkbox"
        checked={permissions[key]}
        onChange={(event) => applyPermissions({ ...permissions, [key]: event.target.checked })}
        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span><span className="block text-xs font-bold text-slate-800">{label}</span><span className="mt-1 block text-[11px] leading-relaxed text-slate-500">{description}</span></span>
    </label>
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-10">
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white"><Terminal className="h-5 w-5" /></span>
          <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600">Linux &amp; System</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">CHMOD Calculator</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">Calculate Linux file permissions, convert octal and symbolic modes, and generate chmod commands.</p></div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><RotateCcw className="h-3.5 w-3.5" />Reset</button>
          <button type="button" onClick={onBack} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Back to Tools</button>
        </div>
      </header>

      <section aria-labelledby="presets-heading" className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3"><div><h2 id="presets-heading" className="text-sm font-bold text-slate-900">Common permission presets</h2><p className="mt-1 text-[11px] text-slate-500">Presets are general guidance; choose permissions that fit your system and file.</p></div><span className="hidden text-[10px] font-medium text-slate-400 sm:inline">Select a mode to apply it</span></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {presets.map((preset) => <button key={preset.mode} type="button" onClick={() => applyPreset(preset.mode)} aria-label={`Apply ${preset.mode}: ${preset.label}`} className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${octal === preset.mode ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
            <span className="flex items-center gap-1.5"><code className="text-sm font-black text-slate-900">{preset.mode}</code>{preset.warning && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-label="Risky permission" />}</span><span className="mt-1 block text-[10px] font-semibold text-slate-700">{preset.label}</span><span className="mt-1 hidden text-[10px] leading-snug text-slate-500 lg:block">{preset.description}</span>
          </button>)}
        </div>
        {octal === '777' && <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />777 grants read, write, and execute access to everyone. Use it only when you understand the security impact.</p>}
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.85fr)]">
        <div className="space-y-5">
          <section aria-labelledby="permissions-heading" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5"><h2 id="permissions-heading" className="text-sm font-bold text-slate-900">Permissions</h2><p className="mt-1 text-[11px] text-slate-500">Choose read, write, and execute access for each user class.</p></div>
            <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {groups.map((group) => <div key={group.id} className="p-4 sm:p-5">
                <h3 className="text-sm font-bold text-slate-800">{group.label}</h3><p className="mb-3 mt-0.5 text-[10px] text-slate-400">{group.detail}</p>
                <div className="space-y-2">
                  {permissionOptions.map((option) => <label key={option.letter} className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                    <span><span className="text-xs font-semibold text-slate-700">{option.label}</span><span className="ml-1.5 font-mono text-[10px] text-slate-400">({option.letter} = {option.value})</span></span>
                    <input aria-label={`${group.label} ${option.label}`} type="checkbox" checked={Boolean(permissions[group.id] & option.value)} onChange={() => toggleGroupPermission(group.id, option.value)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  </label>)}
                </div>
              </div>)}
            </div>
            <div className="border-t border-slate-200 bg-slate-50/70 p-4 sm:px-5">
              <label htmlFor="mode-input" className="mb-1.5 block text-xs font-bold text-slate-700">Enter octal or symbolic mode</label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><input id="mode-input" aria-invalid={Boolean(modeError)} aria-describedby={modeError ? 'mode-error' : 'mode-help'} value={modeInput} onChange={(event) => handleModeInput(event.target.value)} placeholder="755 or rwxr-xr-x" className={`w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:ring-2 ${modeError ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'}`} /><span className="text-[10px] text-slate-400">Accepts 3/4-digit octal or 9-character symbolic mode</span></div>
              {modeError ? <p id="mode-error" role="alert" className="mt-1.5 text-[11px] text-rose-700">{modeError}</p> : <p id="mode-help" className="mt-1.5 text-[11px] text-slate-500">Valid values update the checkboxes and both results. Examples: 755, 4755, rwxr-xr-x.</p>}
            </div>
          </section>

          <details className="group rounded-2xl border border-slate-200 bg-white shadow-xs">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-bold text-slate-900 marker:hidden sm:px-5">Advanced · special permissions<ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" /></summary>
            <div className="border-t border-slate-100 p-4 sm:p-5"><p className="mb-3 text-[11px] leading-relaxed text-slate-500">Special bits add a leading octal digit. Symbolic output uses s/S or t/T depending on the matching execute permission.</p><div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {specialPermission('setuid', 'Setuid (4)', 'Runs an executable with its owner’s permissions. Only enable when required and trusted.')}
              {specialPermission('setgid', 'Setgid (2)', 'Uses the file group for execution; on directories, new entries inherit the directory group.')}
              {specialPermission('sticky', 'Sticky bit (1)', 'On shared directories, limits deletion of entries to their owner or an administrator.')}
            </div>{(permissions.setuid || permissions.setgid) && <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />Setuid and setgid can grant elevated or group-based access. Review the target and system policy before applying.</p>}</div>
          </details>
        </div>

        <aside className="space-y-5">
          <section aria-label="Calculated permission modes" className="rounded-2xl bg-slate-950 p-5 text-white shadow-xs">
            <div className="mb-4 flex items-center gap-2"><Terminal className="h-4 w-4 text-indigo-300" /><h2 className="text-sm font-bold">Calculated mode</h2></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3"><span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Octal</span><code className="mt-1 block text-2xl font-black tracking-widest text-emerald-300">{octal}</code></div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3"><span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Symbolic</span><code className="mt-2 block break-all text-sm font-bold tracking-wide text-sky-300">{symbolic}</code></div>
            </div>
            <p className="mt-3 text-[10px] text-slate-400">{octal.split('').map(Number).join(' + ')} · Octal digits are Owner / Group / Others{octal.length === 4 ? ', preceded by special bits' : ''}.</p>
          </section>

          <section aria-labelledby="command-heading" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
            <div className="mb-4"><h2 id="command-heading" className="text-sm font-bold text-slate-900">chmod command</h2><p className="mt-1 text-[11px] leading-relaxed text-slate-500">Build a shell-safe command. It is generated for copying only and is never run here.</p></div>
            <label htmlFor="file-path" className="mb-1.5 block text-xs font-semibold text-slate-700">File or directory path</label>
            <input id="file-path" value={filePath} onChange={(event) => { setFilePath(event.target.value); setNotice(''); }} placeholder="e.g. ./script.sh or /srv/app" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-lg bg-slate-50 p-3"><input type="checkbox" checked={recursive} onChange={(event) => setRecursive(event.target.checked)} className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /><span><span className="block text-xs font-semibold text-slate-700">Apply recursively (-R)</span><span className="mt-1 block text-[10px] leading-relaxed text-slate-500">Affects all nested files and directories under the path.</span></span></label>
            <div className="mt-3 min-h-12 rounded-lg bg-slate-950 p-3"><code className="break-all text-xs text-emerald-300">{command || 'Enter a path to generate the command.'}</code></div>
            <button type="button" disabled={!command} onClick={() => void copyCommand()} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{notice.includes('copied') ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{notice.includes('copied') ? 'Copied' : 'Copy command'}</button>
            {notice && <p role="status" className={`mt-2 text-[11px] ${notice.toLowerCase().includes('failed') ? 'text-rose-700' : 'text-slate-500'}`}>{notice}</p>}
          </section>

          <details className="group rounded-2xl border border-slate-200 bg-white shadow-xs">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-bold text-slate-900">Permission guide &amp; examples<ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" /></summary>
            <div className="space-y-3 border-t border-slate-100 px-4 py-4 text-[11px] leading-relaxed text-slate-600">
              <p><strong className="text-slate-800">Owner, Group, Others:</strong> the file owner, users assigned to its group, and all remaining users.</p>
              <p><strong className="text-slate-800">Read (4), Write (2), Execute (1):</strong> values add within each class. For example, 7 = 4 + 2 + 1 and 5 = 4 + 1.</p>
              <p><strong className="text-slate-800">Octal:</strong> {octal} = {octal.length === 4 ? `${specialDigit} (${specialLabels || 'no special bits'}), ` : ''}{octal.slice(-3).split('').map((digit, index) => `${digit} (${digit === '0' ? 'no permissions' : permissionOptions.filter((permission) => (Number(digit) & permission.value) !== 0).map((permission) => permission.value).join('+')})`).join(', ')}.</p>
              <p><strong className="text-slate-800">Symbolic:</strong> each set of three letters describes read, write, and execute. A dash means that permission is absent. s/S and t/T show special bits with/without execute.</p>
              <p><strong className="text-slate-800">Directories:</strong> read lists entries, write changes directory entries, and execute permits traversal/search. File and directory modes have different effects.</p>
              <div className="grid grid-cols-2 gap-2 pt-1">{['644 · common file', '755 · executable', '600 · private file', '700 · owner only', '750 · group can traverse', '1777 · sticky shared directory'].map((example) => <span key={example} className="rounded-lg bg-slate-50 px-2.5 py-2 font-mono text-[10px] text-slate-600">{example}</span>)}</div>
            </div>
          </details>
        </aside>
      </div>
    </div>
  );
};
