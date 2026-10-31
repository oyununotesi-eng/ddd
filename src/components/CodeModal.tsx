import React, { useState } from 'react';
import { X, Check, Copy, Code2 } from 'lucide-react';
import { CodeSnippet } from '../types';

interface CodeModalProps {
  snippet: CodeSnippet | null;
  onClose: () => void;
}

export const CodeModal: React.FC<CodeModalProps> = ({ snippet, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!snippet) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-100 text-[#f96332] rounded-lg">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{snippet.title}</h3>
              <p className="text-xs text-slate-500 font-medium">React & Tailwind Code Snippet · {snippet.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed">
          <pre className="overflow-x-auto whitespace-pre">
            <code>{snippet.code}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white">
          <span className="text-xs text-slate-500">Ready to paste into your React + Tailwind project</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all shadow-sm ${
                copied 
                  ? 'bg-emerald-600 text-white shadow-emerald-500/30' 
                  : 'bg-[#f96332] text-white hover:bg-[#e04e20] shadow-now-primary'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
