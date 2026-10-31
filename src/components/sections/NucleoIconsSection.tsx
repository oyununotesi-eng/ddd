import React, { useState } from 'react';
import { 
  Heart, Star, User, Settings, Bell, Search, Compass, Globe, 
  Mail, MessageSquare, Send, Camera, Image, Video, Music, 
  MapPin, Calendar, Clock, Lock, Shield, Check, Copy, 
  ArrowRight, ArrowLeft, Download, Upload, Share2, Bookmark, 
  Cpu, Layers, Sliders, Smartphone, Laptop, Trash2, Eye, 
  FileText, Folder, RefreshCw, Zap, Flag, Flame, Gift
} from 'lucide-react';
import { CodeSnippet } from '../../types';

interface NucleoIconsSectionProps {
  onInspectCode: (snippet: CodeSnippet) => void;
}

export const NucleoIconsSection: React.FC<NucleoIconsSectionProps> = ({ onInspectCode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null);

  const iconList = [
    { name: 'heart-2', icon: Heart, cat: 'Social' },
    { name: 'single-02', icon: User, cat: 'User' },
    { name: 'settings-gear-65', icon: Settings, cat: 'System' },
    { name: 'bell-53', icon: Bell, cat: 'Alert' },
    { name: 'zoom-split', icon: Search, cat: 'Navigation' },
    { name: 'compass-05', icon: Compass, cat: 'Navigation' },
    { name: 'world', icon: Globe, cat: 'Navigation' },
    { name: 'email-85', icon: Mail, cat: 'Communication' },
    { name: 'chat-round', icon: MessageSquare, cat: 'Communication' },
    { name: 'send', icon: Send, cat: 'Communication' },
    { name: 'camera-compact', icon: Camera, cat: 'Media' },
    { name: 'image', icon: Image, cat: 'Media' },
    { name: 'video-66', icon: Video, cat: 'Media' },
    { name: 'headphones', icon: Music, cat: 'Media' },
    { name: 'pin-3', icon: MapPin, cat: 'Location' },
    { name: 'calendar-60', icon: Calendar, cat: 'Date' },
    { name: 'watch-time', icon: Clock, cat: 'Date' },
    { name: 'lock-circle-open', icon: Lock, cat: 'Security' },
    { name: 'badge', icon: Shield, cat: 'Security' },
    { name: 'check-2', icon: Check, cat: 'Action' },
    { name: 'minimal-right', icon: ArrowRight, cat: 'Navigation' },
    { name: 'cloud-download-93', icon: Download, cat: 'Action' },
    { name: 'cloud-upload-94', icon: Upload, cat: 'Action' },
    { name: 'share-66', icon: Share2, cat: 'Social' },
    { name: 'bookmark-2', icon: Bookmark, cat: 'Social' },
    { name: 'app', icon: Layers, cat: 'Design' },
    { name: 'palette', icon: Sliders, cat: 'Design' },
    { name: 'mobile', icon: Smartphone, cat: 'Hardware' },
    { name: 'laptop', icon: Laptop, cat: 'Hardware' },
    { name: 'paper', icon: FileText, cat: 'Content' },
    { name: 'folder-15', icon: Folder, cat: 'Content' },
    { name: 'refresh-69', icon: RefreshCw, cat: 'System' },
    { name: 'bolt', icon: Zap, cat: 'Accent' },
    { name: 'flag', icon: Flag, cat: 'Accent' },
    { name: 'flame', icon: Flame, cat: 'Accent' },
    { name: 'gift-2', icon: Gift, cat: 'Accent' },
  ];

  const filtered = iconList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (iconName: string) => {
    navigator.clipboard.writeText(`<i className="now-ui-icons ${iconName}"></i>`);
    setCopiedIcon(iconName);
    setTimeout(() => setCopiedIcon(null), 1800);
  };

  return (
    <section id="nucleo-icons" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900">
              Nucleo Icons
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Over 100 handcrafted outline and solid glyph icons designed for Now UI Kit
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:border-[#f96332] outline-none transition-all w-48 sm:w-60"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={() => onInspectCode({
                title: "Using Nucleo Icons",
                category: "Icons",
                code: `// Now UI Icon Usage in React
import { Heart, Compass, User } from 'lucide-react';

<button className="flex items-center gap-2 text-[#f96332]">
  <Heart className="w-4 h-4 fill-[#f96332]" />
  <span>Like Project</span>
</button>`
              })}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f96332] bg-orange-50 hover:bg-orange-100 rounded-full transition-colors flex items-center gap-1.5"
            >
              <span>Usage Code</span>
            </button>
          </div>
        </div>

        {/* Icons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
          {filtered.map((item) => {
            const IconComp = item.icon;
            const isCopied = copiedIcon === item.name;

            return (
              <button
                key={item.name}
                onClick={() => handleCopy(item.name)}
                className={`group p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center text-center relative ${
                  isCopied
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                    : 'bg-white hover:bg-orange-50/50 border-slate-100 hover:border-orange-200 hover:shadow-md'
                }`}
              >
                <div className={`p-2.5 rounded-xl mb-2 transition-colors ${
                  isCopied ? 'bg-emerald-100' : 'bg-slate-50 group-hover:bg-orange-100 text-[#2c2c2c] group-hover:text-[#f96332]'
                }`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 truncate w-full group-hover:text-[#f96332]">
                  {item.name}
                </span>

                {/* Copied indicator pill */}
                {isCopied && (
                  <span className="absolute -top-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                    Copied!
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-slate-400">
            No icons found matching "{searchTerm}". Try a different keyword like "heart", "user", "media".
          </div>
        )}
      </div>
    </section>
  );
};
