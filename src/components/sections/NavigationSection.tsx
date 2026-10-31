import React, { useState } from 'react';
import { 
  Compass, 
  User, 
  Settings, 
  Search, 
  Bell, 
  Globe, 
  Heart, 
  Mail, 
  Menu, 
  X, 
  ChevronDown, 
  Code2,
  Check
} from 'lucide-react';
import { CodeSnippet } from '../../types';

interface NavigationSectionProps {
  onInspectCode: (snippet: CodeSnippet) => void;
}

export const NavigationSection: React.FC<NavigationSectionProps> = ({ onInspectCode }) => {
  const [activeNavbarColor, setActiveNavbarColor] = useState<'primary' | 'info' | 'success' | 'warning' | 'danger' | 'dark'>('primary');
  const [dropdown1Open, setDropdown1Open] = useState(false);
  const [dropdown2Open, setDropdown2Open] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const colors = {
    primary: {
      bg: 'bg-[#f96332]',
      shadow: 'shadow-now-primary',
      name: 'Primary (Orange)',
      text: 'text-[#f96332]',
    },
    info: {
      bg: 'bg-[#2ca8ff]',
      shadow: 'shadow-now-info',
      name: 'Info (Sky Blue)',
      text: 'text-[#2ca8ff]',
    },
    success: {
      bg: 'bg-[#18ce0f]',
      shadow: 'shadow-now-success',
      name: 'Success (Green)',
      text: 'text-[#18ce0f]',
    },
    warning: {
      bg: 'bg-[#ffb236]',
      shadow: 'shadow-now-warning',
      name: 'Warning (Amber)',
      text: 'text-[#ffb236]',
    },
    danger: {
      bg: 'bg-[#ff3636]',
      shadow: 'shadow-now-danger',
      name: 'Danger (Red)',
      text: 'text-[#ff3636]',
    },
    dark: {
      bg: 'bg-[#2c2c2c]',
      shadow: 'shadow-lg',
      name: 'Dark (Charcoal)',
      text: 'text-slate-800',
    },
  };

  return (
    <section id="navigation-section" className="py-20 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-12 pb-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900">
              Navbars & Menus
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Responsive navigation bars with icons, brand logos, dropdowns, and thematic color palettes
            </p>
          </div>
          <button
            onClick={() => onInspectCode({
              title: "Colored Navbar Component",
              category: "Navigation",
              code: `<nav className="bg-[#f96332] text-white px-6 py-3 rounded-xl shadow-now-primary flex items-center justify-between">
  <div className="font-bold text-sm uppercase tracking-wider">Brand Name</div>
  <div className="flex items-center gap-6 text-xs font-semibold uppercase">
    <a href="#" className="hover:opacity-80">Discover</a>
    <a href="#" className="hover:opacity-80">Profile</a>
    <a href="#" className="hover:opacity-80">Settings</a>
  </div>
</nav>`
            })}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#f96332] bg-white border border-orange-200 hover:bg-orange-50 rounded-full transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>View Snippet</span>
          </button>
        </div>

        {/* Color Palette Selector */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">
            Switch Navbar Color:
          </span>
          {(Object.keys(colors) as Array<keyof typeof colors>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveNavbarColor(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeNavbarColor === key
                  ? `${colors[key].bg} text-white ${colors[key].shadow} scale-105`
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {activeNavbarColor === key && <Check className="w-3 h-3" />}
              <span>{key}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Colored Navbar */}
        <div className="mb-12">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Active Theme: {colors[activeNavbarColor].name}
          </div>
          <div
            className={`w-full rounded-2xl p-4 sm:px-8 text-white transition-all duration-300 ${colors[activeNavbarColor].bg} ${colors[activeNavbarColor].shadow}`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Brand */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold uppercase tracking-widest text-white">
                  Creative Studio
                </span>
                <button className="md:hidden p-1.5 text-white/80 hover:text-white">
                  <Menu className="w-5 h-5" />
                </button>
              </div>

              {/* Links with Icons */}
              <div className="flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-wider">
                <button className="flex items-center gap-1.5 hover:text-white/80 transition-opacity">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Explore</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-white/80 transition-opacity">
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>

                {/* Dropdown in Navbar */}
                <div className="relative">
                  <button
                    onClick={() => setDropdown1Open(!dropdown1Open)}
                    onBlur={() => setTimeout(() => setDropdown1Open(false), 200)}
                    className="flex items-center gap-1 hover:text-white/80 transition-opacity"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {dropdown1Open && (
                    <div className="absolute top-full left-0 mt-3 w-44 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 py-1.5 z-20 animate-in fade-in">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Preferences
                      </div>
                      <button className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 transition-colors">
                        Account Info
                      </button>
                      <button className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 transition-colors">
                        Billing & Plans
                      </button>
                      <div className="my-1 border-t border-slate-100" />
                      <button className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Action: Search or Notification */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="bg-white/20 placeholder:text-white/70 text-white text-xs pl-8 pr-3 py-1.5 rounded-full outline-none focus:bg-white/30 transition-all border border-white/20 w-36 sm:w-44"
                  />
                  <Search className="w-3.5 h-3.5 text-white/70 absolute left-2.5 top-2" />
                </div>
                <button 
                  onClick={() => alert('Notification bell clicked!')}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Second Example: Clean Transparent / White Navbar */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Minimalist Clean Navbar with Icons Only & Social Badges
          </div>
          <div className="w-full bg-white rounded-2xl p-4 sm:px-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#f96332] text-white flex items-center justify-center font-black text-sm shadow-now-primary">
                N
              </div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">Now UI Clean</span>
            </div>

            <div className="flex items-center gap-8 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <button className="hover:text-[#f96332] transition-colors">Overview</button>
              <button className="hover:text-[#f96332] transition-colors">Products</button>
              <button className="hover:text-[#f96332] transition-colors">Customers</button>
              <button className="hover:text-[#f96332] transition-colors">Pricing</button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => alert('Added to favorites!')}
                className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                aria-label="Favorite"
              >
                <Heart className="w-4 h-4" />
              </button>
              <button 
                onClick={() => alert('Direct message opened!')}
                className="p-2 rounded-full text-slate-400 hover:text-[#2ca8ff] hover:bg-blue-50 transition-colors"
                aria-label="Messages"
              >
                <Mail className="w-4 h-4" />
              </button>
              <button className="ml-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f96332] border border-[#f96332] hover:bg-orange-50 rounded-full transition-colors">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
