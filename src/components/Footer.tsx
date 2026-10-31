import React from 'react';
import { ArrowUp } from 'lucide-react';
import { PageView } from '../types';

interface FooterProps {
  onBackToTop: () => void;
  onNavigate: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onBackToTop, onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-white py-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Navigation links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <button onClick={() => onNavigate('home')} className="hover:text-[#f96332] transition-colors cursor-pointer">
            Home
          </button>
          <button onClick={() => onNavigate('quick-access')} className="hover:text-[#f96332] transition-colors cursor-pointer">
            Quick Access
          </button>
          <button onClick={() => onNavigate('environment')} className="hover:text-[#f96332] transition-colors cursor-pointer">
            Environment
          </button>
          <button onClick={() => onNavigate('project-management')} className="hover:text-[#f96332] transition-colors cursor-pointer">
            Project Management
          </button>
          <button onClick={() => onNavigate('tools')} className="hover:text-[#f96332] transition-colors cursor-pointer">
            Tools
          </button>
          <button onClick={() => onNavigate('knowledge-hub')} className="hover:text-[#f96332] transition-colors cursor-pointer">
            Knowledge Hub
          </button>
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-400 text-center flex items-center gap-1.5 font-sans">
          <span>© {new Date().getFullYear()}</span>
          <span className="font-bold text-white">Murat Krhl's WorkSpace</span>
          <span>— All rights reserved.</span>
        </div>

        {/* Back to top */}
        <button
          onClick={onBackToTop}
          className="p-2.5 rounded-full bg-white/10 hover:bg-[#f96332] text-white transition-colors cursor-pointer"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
