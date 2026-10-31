import React, { useState } from 'react';
import { X, Download, Copy, Check, Terminal, ExternalLink, Package, Sparkles } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const cloneCommand = 'git clone https://github.com/creativetimofficial/now-ui-kit.git';

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDownloadZip = () => {
    setIsDownloading(true);
    // Create a starter bundle JSON file to trigger a real download
    const starterConfig = {
      name: "now-ui-kit-react",
      version: "1.4.0",
      description: "Free Bootstrap 4 and Tailwind CSS UI Kit for React",
      author: "Creative Tim & InVision",
      license: "MIT",
      homepage: "https://demos.creative-tim.com/now-ui-kit/index.html",
      dependencies: {
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "tailwindcss": "^4.0.0",
        "lucide-react": "latest"
      },
      colors: {
        primary: "#f96332",
        info: "#2ca8ff",
        success: "#18ce0f",
        warning: "#ffb236",
        danger: "#ff3636",
        dark: "#2c2c2c"
      }
    };

    const blob = new Blob([JSON.stringify(starterConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'now-ui-kit-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsDownloading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#f96332] to-[#ffb236] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-wide">
                Download Now UI Kit
              </h3>
              <p className="text-xs text-white/90 font-medium">Free & Open Source under MIT License</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Quick Terminal Clone
            </span>
            <div className="flex items-center justify-between bg-slate-900 text-slate-100 p-3.5 rounded-2xl font-mono text-xs">
              <span className="truncate mr-2">$ {cloneCommand}</span>
              <button
                onClick={handleCopyCommand}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors shrink-0"
                aria-label="Copy clone command"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-[#f96332] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Includes in package:</span>
            </div>
            <p>• 50+ Responsive UI Components</p>
            <p>• 3 Full Production Templates (Landing, Profile, Login)</p>
            <p>• Nucleo Icon set + Lucide React icon integration</p>
            <p>• Tailwind CSS & React 19 configuration</p>
          </div>

          {/* Action Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-now-primary transition-all flex items-center justify-center gap-2 hover:scale-101"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Preparing Package...' : 'Download Starter Package (JSON)'}</span>
            </button>

            <a
              href="https://github.com/creativetimofficial/now-ui-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              <span>View GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
