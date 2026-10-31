import React, { useState } from 'react';
import { PageView, CodeSnippet, UserSession, AdminTab } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { QuickAccessPage } from './components/pages/QuickAccessPage';
import { EnvironmentPage } from './components/pages/EnvironmentPage';
import { ProjectManagementPage } from './components/pages/ProjectManagementPage';
import { ToolsPage } from './components/pages/ToolsPage';
import { JSONStudioPage } from './components/pages/JSONStudioPage';
import { CHMODCalculatorPage } from './components/pages/CHMODCalculatorPage';
import { SSLCertificateCheckerPage } from './components/pages/SSLCertificateCheckerPage';
import { KnowledgeHubPage } from './components/pages/KnowledgeHubPage';
import { LoginPage } from './components/pages/LoginPage';
import { AdminPage } from './components/pages/AdminPage';
import { BasicElements } from './components/sections/BasicElements';
import { NotificationsSection } from './components/sections/NotificationsSection';
import { CodeModal } from './components/CodeModal';
import { Footer } from './components/Footer';
import { BLOG_CATEGORIES, getBlogCategoryLabel, readBlogPosts } from './data/knowledge';
import { getCategoryIcon } from './data/categories';
import { 
  Bookmark, 
  Server, 
  Kanban, 
  Wrench, 
  BookOpen, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [currentSubTab, setCurrentSubTab] = useState<string | undefined>(undefined);
  const [inspectSnippet, setInspectSnippet] = useState<CodeSnippet | null>(null);

  // Authenticated User Session (Admin user by default as requested)
  const [userSession, setUserSession] = useState<UserSession | null>({
    username: 'Admin',
    fullName: 'Murat Karahaliloğlu (Admin)',
    role: 'Admin',
    email: 'admin@workspace.internal',
    isLoggedIn: true,
  });

  const handleNavigate = (page: PageView, subTab?: string) => {
    if (page === 'admin' && (!userSession?.isLoggedIn || userSession.role !== 'Admin')) {
      return;
    }

    setCurrentPage(page);
    setCurrentSubTab(subTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setUserSession(null);
    setCurrentPage('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const popularArticles = readBlogPosts()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 5);

  // If on Login Page, render the fullscreen Now UI Kit login layout
  if (currentPage === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={() => setCurrentPage('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#2c2c2c] flex flex-col selection:bg-[#f96332] selection:text-white font-sans antialiased">
      {/* Top Navigation Bar with Murat Krhl's brand and updated menu items */}
      <Navbar
        currentPage={currentPage === 'json-studio' || currentPage === 'chmod-calculator' || currentPage === 'ssl-certificate-checker' ? 'tools' : currentPage}
        onNavigate={handleNavigate}
        userSession={userSession}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 1. HOME VIEW */}
        {currentPage === 'home' && (
          <div>
            {/* The Hero matching image_4df3de0b.png */}
            <Hero />

            {/* Popular Posts */}
            <section className="max-w-7xl mx-auto px-6 pt-10">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
                <div className="flex items-end justify-between gap-4 mb-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#f96332]">From the Engineering Blog</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Popular Post</h2>
                  </div>
                  <button onClick={() => handleNavigate('knowledge-hub', 'blog')} className="text-xs font-bold text-[#f96332] hover:underline">Tüm makaleler</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {popularArticles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => handleNavigate('knowledge-hub', 'blog')}
                      className="w-full text-left py-3 flex items-center gap-3 group"
                    >
                      {(() => {
                        const category = BLOG_CATEGORIES.find((item) => item.id === article.category);
                        const ArticleIcon = getCategoryIcon(category?.icon || 'BookOpen');
                        const color = category?.color || '#f97316';
                        return (
                          <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ color, backgroundColor: `${color}18` }}>
                            <ArticleIcon className="w-5 h-5" />
                          </span>
                        );
                      })()}
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#f96332]">{getBlogCategoryLabel(article.category)}</span>
                        <span className="block mt-1 text-sm font-bold leading-snug text-slate-900 group-hover:text-[#f96332] line-clamp-2">{article.title}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">{article.publishedAt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Workspace Hub Quick Navigation Cards */}
            <section className="py-16 max-w-7xl mx-auto px-6">
              <div className="mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-[#f96332] block mb-1">
                  Workspace Modules
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Overview & Quick Portals
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Direct shortcuts to infrastructure environments, migrations, dev tools, and documentation
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Quick Access Card */}
                <div
                  onClick={() => handleNavigate('quick-access')}
                  className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#f96332] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Bookmark className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#f96332] transition-colors">
                      Quick Access
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Frequent links and Network File System (NFS) storage mounts with real-time usage meters.
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-[11px] font-semibold text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-100">Bookmarks (8)</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">NFS Storage</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#f96332]">
                    <span>Open Quick Access</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* 2. Environment Card */}
                <div
                  onClick={() => handleNavigate('environment')}
                  className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2ca8ff] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Server className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2ca8ff] transition-colors">
                      Environment
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Servers, Applications, OpenShift cluster nodes, Reverse Proxy ingress, Provenir, Evam, and PowerCurve.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-4 text-[10px] font-semibold text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-100">Sunucu</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">OpenShift</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Reverse Proxy</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Provenir</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2ca8ff]">
                    <span>View Infrastructure</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* 3. Project Management Card */}
                <div
                  onClick={() => handleNavigate('project-management')}
                  className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Kanban className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                      Project Management
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Audit finding tracking, JBOSS 8 EAP migration roadmap, Provenir upgrade, and personal To-Do list.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-4 text-[10px] font-semibold text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-100">Bulgu Takip</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">JBOSS 8</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">To Do List</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                    <span>Manage Projects</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* 4. Tools Card */}
                <div
                  onClick={() => handleNavigate('tools')}
                  className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#18ce0f] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Developer Utilities
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      JSON Studio for formatting, validating, exploring, comparing, and minifying JSON locally.
                    </p>
                    <div className="flex items-center gap-1.5 mt-4 text-[10px] font-semibold text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-100">Format</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Validate</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Tree View</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Diff</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span>Launch Utilities</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* 5. Knowledge Hub Card */}
                <div
                  onClick={() => handleNavigate('knowledge-hub')}
                  className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-200 cursor-pointer flex flex-col justify-between md:col-span-2 lg:col-span-2"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#ffb236] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      Knowledge Hub
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-xl">
                      Technical runbooks, emergency triage cheat-sheets (OpenShift oc commands, JVM thread dumps, NGINX SSL reload), and in-depth engineering blog articles.
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-[11px] font-semibold text-slate-400">
                      <span className="px-2.5 py-0.5 rounded bg-slate-100">OneNote Runbooks</span>
                      <span className="px-2.5 py-0.5 rounded bg-slate-100">Engineering Blog</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#ffb236]">
                    <span>Open Knowledge Hub</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive Components Section (Now UI Kit design system) */}
            <div className="border-t border-slate-100">
              <BasicElements onInspectCode={setInspectSnippet} />
              <NotificationsSection onInspectCode={setInspectSnippet} />
            </div>
          </div>
        )}

        {/* 2. QUICK ACCESS PAGE */}
        {currentPage === 'quick-access' && (
          <QuickAccessPage initialTab={currentSubTab as any} />
        )}

        {/* 3. ENVIRONMENT PAGE */}
        {currentPage === 'environment' && (
          <EnvironmentPage initialTab={currentSubTab as any} />
        )}

        {/* 4. PROJECT MANAGEMENT PAGE */}
        {currentPage === 'project-management' && (
          <ProjectManagementPage initialTab={currentSubTab as any} />
        )}

        {/* 5. TOOLS PAGE */}
        {currentPage === 'tools' && (
          <ToolsPage
            onOpenJSONStudio={() => handleNavigate('json-studio')}
            onOpenCHMODCalculator={() => handleNavigate('chmod-calculator')}
            onOpenSSLCertificateChecker={() => handleNavigate('ssl-certificate-checker')}
          />
        )}

        {/* JSON Studio opens as a separate workspace page */}
        {currentPage === 'json-studio' && <JSONStudioPage onBack={() => handleNavigate('tools')} />}
        {currentPage === 'chmod-calculator' && <CHMODCalculatorPage onBack={() => handleNavigate('tools')} />}
        {currentPage === 'ssl-certificate-checker' && <SSLCertificateCheckerPage onBack={() => handleNavigate('tools')} />}

        {/* 6. KNOWLEDGE HUB PAGE */}
        {currentPage === 'knowledge-hub' && (
          <KnowledgeHubPage initialTab={currentSubTab as any} />
        )}

        {/* 7. ADMIN PAGE */}
        {currentPage === 'admin' && userSession?.isLoggedIn && userSession.role === 'Admin' && (
          <AdminPage initialTab={currentSubTab as AdminTab} />
        )}
      </main>

      {/* Code Inspector Modal */}
      <CodeModal
        snippet={inspectSnippet}
        onClose={() => setInspectSnippet(null)}
      />

      {/* Footer */}
      <Footer
        onBackToTop={handleBackToTop}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
