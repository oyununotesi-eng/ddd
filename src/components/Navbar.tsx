import React, { useState } from 'react';
import { 
  Home, 
  Bookmark, 
  Server, 
  Kanban, 
  Wrench, 
  BookOpen, 
  Menu, 
  X,
  ShieldCheck,
  ChevronDown,
  Users,
  UploadCloud,
  BookmarkCheck,
  LogOut,
  User,
  Lock
} from 'lucide-react';
import { PageView, UserSession } from '../types';

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView, subTab?: string) => void;
  userSession?: UserSession | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  userSession,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="text-left group shrink-0 cursor-pointer py-1"
        >
          <span className="text-xl font-extrabold tracking-tight text-slate-900 block group-hover:text-[#f96332] transition-colors">
            Murat Krhl's
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-700">
          {/* Home */}
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPage === 'home'
                ? 'bg-slate-100 text-[#f96332] font-extrabold'
                : 'hover:text-[#f96332] hover:bg-slate-50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* Quick Access */}
          <button
            onClick={() => onNavigate('quick-access')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPage === 'quick-access'
                ? 'bg-slate-100 text-[#f96332] font-extrabold'
                : 'hover:text-[#f96332] hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Quick Access</span>
          </button>

          {/* Environment */}
          <button
            onClick={() => onNavigate('environment')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPage === 'environment'
                ? 'bg-slate-100 text-[#f96332] font-extrabold'
                : 'hover:text-[#f96332] hover:bg-slate-50'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Environment</span>
          </button>

          {/* Project Management */}
          <button
            onClick={() => onNavigate('project-management')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPage === 'project-management'
                ? 'bg-slate-100 text-[#f96332] font-extrabold'
                : 'hover:text-[#f96332] hover:bg-slate-50'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Project Management</span>
          </button>

          {/* Tools */}
          <button
            onClick={() => onNavigate('tools')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPage === 'tools'
                ? 'bg-slate-100 text-[#f96332] font-extrabold'
                : 'hover:text-[#f96332] hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Tools</span>
          </button>

          {/* Knowledge Hub */}
          <button
            onClick={() => onNavigate('knowledge-hub')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPage === 'knowledge-hub'
                ? 'bg-slate-100 text-[#f96332] font-extrabold'
                : 'hover:text-[#f96332] hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Knowledge Hub</span>
          </button>

        </nav>

        {/* Zone 3: Profile Info (Right Corner) & Mobile hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          {userSession?.isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2.5 p-1 sm:pl-3 sm:pr-2.5 rounded-full border border-slate-200/90 hover:border-orange-300 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-xs group"
                aria-label="Kullanıcı Profili"
              >
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#f96332] transition-colors leading-none block">
                    {userSession.username}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold leading-none block mt-0.5">
                    {userSession.role}
                  </span>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-1">
                  {/* User Profile Header */}
                  <div className="px-3 py-2.5 border-b border-slate-100">
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {userSession.fullName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        {userSession.email}
                      </span>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-50 text-[#f96332]">
                        {userSession.role}
                      </span>
                    </div>
                  </div>

                  {userSession.isLoggedIn && userSession.role === 'Admin' && (
                    <div className="py-2 border-b border-slate-100">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onNavigate('admin');
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                          currentPage === 'admin'
                            ? 'bg-orange-50 text-[#f96332]'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-[#f96332]'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin</span>
                      </button>
                    </div>
                  )}

                  {/* Log Out Action */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Çıkış Yap (Log Out)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#f96332] to-[#ea4c10] hover:from-[#e04e20] hover:to-[#c83c0c] shadow-now-primary hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Giriş Yap</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 animate-in fade-in">
          {/* User Profile Summary in Mobile */}
          {userSession?.isLoggedIn && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{userSession.fullName}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">@{userSession.username} ({userSession.role})</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              {userSession.isLoggedIn && userSession.role === 'Admin' && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
                    currentPage === 'admin' ? 'bg-orange-50 text-[#f96332]' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          )}
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left p-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
              currentPage === 'home' ? 'bg-orange-50 text-[#f96332]' : 'hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => {
              onNavigate('quick-access');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left p-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
              currentPage === 'quick-access' ? 'bg-orange-50 text-[#f96332]' : 'hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Quick Access</span>
          </button>

          <button
            onClick={() => {
              onNavigate('environment');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left p-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
              currentPage === 'environment' ? 'bg-orange-50 text-[#f96332]' : 'hover:bg-slate-50'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Environment</span>
          </button>

          <button
            onClick={() => {
              onNavigate('project-management');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left p-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
              currentPage === 'project-management' ? 'bg-orange-50 text-[#f96332]' : 'hover:bg-slate-50'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Project Management</span>
          </button>

          <button
            onClick={() => {
              onNavigate('tools');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left p-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
              currentPage === 'tools' ? 'bg-orange-50 text-[#f96332]' : 'hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Tools</span>
          </button>

          <button
            onClick={() => {
              onNavigate('knowledge-hub');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left p-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
              currentPage === 'knowledge-hub' ? 'bg-orange-50 text-[#f96332]' : 'hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Knowledge Hub</span>
          </button>

          {!userSession?.isLoggedIn && (
            <button
              onClick={() => {
                onNavigate('login');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#f96332] bg-orange-50 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Giriş Yap (Sign In)</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
