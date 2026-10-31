import React, { useState } from 'react';
import { Download, ExternalLink, Star, Check, X, Shield, Sparkles, Heart } from 'lucide-react';

interface DownloadSharingSectionProps {
  onOpenDownload: () => void;
}

export const DownloadSharingSection: React.FC<DownloadSharingSectionProps> = ({ onOpenDownload }) => {
  const [starCount, setStarCount] = useState(4820);
  const [hasStarred, setHasStarred] = useState(false);

  const toggleStar = () => {
    if (hasStarred) {
      setStarCount((prev) => prev - 1);
      setHasStarred(false);
    } else {
      setStarCount((prev) => prev + 1);
      setHasStarred(true);
    }
  };

  return (
    <section id="download-section" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main CTA Box */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a] text-white p-8 sm:p-14 shadow-2xl mb-20">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-orange-400 mb-6 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free & Open Source</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white mb-6 leading-tight">
              Do you love this UI Kit?
            </h2>

            <p className="text-base text-slate-300 leading-relaxed mb-10 max-w-2xl">
              Cause if you do, it can be yours now for free. Hit the button below to download the complete React & Tailwind package, or star the project on GitHub to support open-source designers.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenDownload}
                className="px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-now-primary transition-all duration-200 flex items-center gap-2 hover:scale-102"
              >
                <Download className="w-4 h-4" />
                <span>Download React Kit (Free)</span>
              </button>

              <button
                onClick={toggleStar}
                className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 flex items-center gap-2 border ${
                  hasStarred
                    ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                <Star className={`w-4 h-4 ${hasStarred ? 'fill-slate-900' : ''}`} />
                <span>Star on GitHub · {starCount.toLocaleString()}</span>
              </button>
            </div>
          </div>

          {/* Decorative glowing gradient circle */}
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-[#f96332]/30 to-transparent pointer-events-none rounded-r-3xl" />
        </div>

        {/* Free vs Pro Comparison */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900">
              Want more components & sections?
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Check out what's included in Now UI Kit Free vs Now UI Kit PRO
            </p>
          </div>

          <div className="overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <th className="py-4 px-6">Feature</th>
                  <th className="py-4 px-6 text-center text-[#f96332]">Free Version</th>
                  <th className="py-4 px-6 text-center text-slate-900">PRO Version</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-600 divide-y divide-slate-100 font-sans">
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-800">Components</td>
                  <td className="py-4 px-6 text-center font-bold text-slate-900">50+</td>
                  <td className="py-4 px-6 text-center font-bold text-[#f96332]">1000+</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-800">Plugins Included</td>
                  <td className="py-4 px-6 text-center font-bold text-slate-900">3</td>
                  <td className="py-4 px-6 text-center font-bold text-[#f96332]">7</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-800">Example Pages</td>
                  <td className="py-4 px-6 text-center font-bold text-slate-900">3 Templates</td>
                  <td className="py-4 px-6 text-center font-bold text-[#f96332]">11 Templates</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-800">TypeScript & Tailwind Support</td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-4 h-4 text-[#18ce0f] mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-4 h-4 text-[#18ce0f] mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-800">Commercial License</td>
                  <td className="py-4 px-6 text-center text-slate-400">MIT</td>
                  <td className="py-4 px-6 text-center font-bold text-slate-900">Full Commercial</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-800">Priority Support</td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-4 h-4 text-slate-300 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-4 h-4 text-[#18ce0f] mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
