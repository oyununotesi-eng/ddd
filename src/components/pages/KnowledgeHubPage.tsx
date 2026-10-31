import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  GitBranch,
  GraduationCap,
  Plus,
  Save,
} from 'lucide-react';
import { KnowledgeHubTab } from '../../types';
import { getCategoryIcon } from '../../data/categories';
import {
  BLOG_CATEGORIES,
  BlogArticle,
  getBlogCategoryLabel,
  OneNotePage,
  PRODUCT_HUB_CATEGORIES,
  readBlogPosts,
  readOneNoteConfig,
  readOneNotePages,
  saveBlogPosts,
  saveOneNotePages,
} from '../../data/knowledge';
import {
  createConnectedLocalNote,
  readConnectedLocalNotes,
  writeConnectedLocalNote,
} from '../../data/localNotes';
import { ReleaseDashboard } from './ReleaseDashboard';

interface KnowledgeHubPageProps {
  initialTab?: KnowledgeHubTab;
}

const KNOWLEDGE_HUB_TABS: { id: KnowledgeHubTab; label: string; icon: React.ElementType }[] = [
  { id: 'onenote', label: 'OneNote', icon: BookOpen },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'release', label: 'Release', icon: GitBranch },
  { id: 'education', label: 'Education', icon: GraduationCap },
];

export const KnowledgeHubPage: React.FC<KnowledgeHubPageProps> = ({ initialTab = 'onenote' }) => {
  const [activeTab, setActiveTab] = useState<KnowledgeHubTab>(initialTab);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notePages, setNotePages] = useState<OneNotePage[]>(readOneNotePages);
  const [selectedSection, setSelectedSection] = useState('JBOSS');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState('');
  const [noteStatus, setNoteStatus] = useState<string | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogArticle[]>(readBlogPosts);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedBlogCategory, setSelectedBlogCategory] = useState('all');
  const [selectedEducationCategory, setSelectedEducationCategory] = useState('all');
  const oneNoteConfig = useMemo(readOneNoteConfig, []);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!oneNoteConfig.localFolderName || oneNoteConfig.sourceUrl) return;
    let cancelled = false;
    readConnectedLocalNotes()
      .then((pages) => {
        if (cancelled) return;
        setNotePages(pages);
        if (pages.length) {
          setSelectedSection(pages[0].section);
          setSelectedNoteId(pages[0].id);
          setDraftContent(pages[0].content);
          setNoteStatus(null);
        } else {
          setSelectedSection('LOCAL FILES');
          setSelectedNoteId(null);
          setDraftContent('');
          setNoteStatus('Bağlı klasörde .md, .markdown, .txt veya .html sayfa bulunamadı ya da klasör izni yeniden isteniyor.');
        }
      })
      .catch(() => setNoteStatus('Yerel klasör okunamadı. Admin ayarlarından klasör iznini yeniden verin.'));
    return () => { cancelled = true; };
  }, [oneNoteConfig.localFolderName, oneNoteConfig.sourceUrl]);

  const sections = useMemo(
    () => Array.from(new Set(notePages.map((page) => page.section))),
    [notePages],
  );
  const sectionPages = notePages.filter((page) => page.section === selectedSection);
  const selectedNote = notePages.find((page) => page.id === selectedNoteId) || sectionPages[0] || notePages[0];
  const sortedPosts = [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const filteredPosts = sortedPosts.filter((post) => selectedBlogCategory === 'all' || post.category === selectedBlogCategory);
  const selectedArticle = blogPosts.find((post) => post.id === selectedArticleId);

  const renderEducationWorkspace = () => {
    const selectedCategory = PRODUCT_HUB_CATEGORIES.find((category) => category.id === selectedEducationCategory);
    const setSelectedCategory = setSelectedEducationCategory;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start animate-in fade-in">
        <aside className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs lg:sticky lg:top-24">
          <div className="px-2 pb-3 mb-2 border-b border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">Ürün kategorileri</h2>
            <p className="text-[11px] text-slate-400 mt-1">Renkli ürün simgeleriyle filtreleyin</p>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={'w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ' + (selectedEducationCategory === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50')}
            >
              <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: selectedEducationCategory === 'all' ? 'white' : '#f97316', backgroundColor: selectedEducationCategory === 'all' ? 'rgba(255,255,255,.12)' : '#fff7ed' }}>
                {React.createElement(getCategoryIcon('LayoutGrid'), { className: 'w-4 h-4' })}
              </span>
              Tümü
            </button>
            {PRODUCT_HUB_CATEGORIES.map((category) => {
              const CategoryIcon = getCategoryIcon(category.icon);
              const isSelected = selectedEducationCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={'w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ' + (isSelected ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50')}
                >
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: isSelected ? 'white' : category.color, backgroundColor: isSelected ? 'rgba(255,255,255,.12)' : category.color + '18' }}>
                    <CategoryIcon className="w-4 h-4" />
                  </span>
                  {category.label}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-5">
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#f96332]">Knowledge Hub</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">{selectedCategory?.label || 'Product Education'}</h1>
            <p className="text-sm text-slate-500 mt-2">Eğitim notlarını ve kaynaklarını ürüne göre görüntüleyin.</p>
          </div>

          {selectedCategory ? (
            <article className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ color: selectedCategory.color, backgroundColor: selectedCategory.color + '18' }}>
                  {React.createElement(getCategoryIcon(selectedCategory.icon), { className: 'w-6 h-6' })}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedCategory.label}</h2>
                  <p className="text-xs text-slate-500 mt-1">Ürün eğitimleri ve öğrenme kaynakları</p>
                </div>
              </div>
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-10 text-center">
                <p className="text-sm font-semibold text-slate-700">Henüz eğitim içeriği eklenmedi.</p>
                <p className="text-xs text-slate-500 mt-2">Eğitim kaynakları eklendiğinde bu ürün altında listelenecek.</p>
              </div>
            </article>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {PRODUCT_HUB_CATEGORIES.map((category) => {
                const CategoryIcon = getCategoryIcon(category.icon);
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-left bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all"
                  >
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ color: category.color, backgroundColor: category.color + '18' }}>
                      <CategoryIcon className="w-5 h-5" />
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 mt-4">{category.label}</h2>
                    <p className="text-xs text-slate-500 mt-1">Eğitim ve dokümantasyon</p>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  };
  useEffect(() => {
    if (selectedNote) setDraftContent(selectedNote.content);
  }, [selectedNote?.id]);

  const triggerConfetti = (originEl: HTMLElement) => {
    const colors = ['#f96332', '#ea4c10', '#ffb236', '#2ca8ff', '#18ce0f', '#ff3636'];
    const rect = originEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 20; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      const size = Math.random() * 8 + 6;
      const angle = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.4;
      const dist = Math.random() * 100 + 40;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * (Math.random() > 0.5 ? 1 : 0.5)}px`;
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.left = `${cx}px`;
      piece.style.top = `${cy}px`;
      document.body.appendChild(piece);
      piece.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist + 160}px) rotate(360deg)`, opacity: 0 },
        ],
        { duration: 1200, easing: 'cubic-bezier(.22,.61,.36,1)' },
      );
      setTimeout(() => piece.remove(), 1300);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    const updatedPage = { ...selectedNote, content: draftContent, updatedAt: new Date().toISOString().slice(0, 10) };
    if (selectedNote.sourceFile) {
      try {
        await writeConnectedLocalNote(selectedNote.sourceFile, draftContent);
        setNotePages((pages) => pages.map((page) => page.id === selectedNote.id ? updatedPage : page));
        setNoteStatus(`Değişiklik ${selectedNote.sourceFile} dosyasına kaydedildi.`);
      } catch (error) {
        setNoteStatus(error instanceof Error ? error.message : 'Dosyaya kaydedilemedi.');
      }
      return;
    }
    const updated = notePages.map((page) => page.id === selectedNote.id ? updatedPage : page);
    setNotePages(updated);
    saveOneNotePages(updated);
    setNoteStatus('Sayfa bu tarayıcıda kaydedildi.');
  };

  const handleAddNote = async () => {
    const title = window.prompt('Yeni sayfa adı:')?.trim();
    if (!title) return;
    if (oneNoteConfig.localFolderName && !oneNoteConfig.sourceUrl) {
      try {
        const content = `# ${title}\n\n`;
        const sourceFile = await createConnectedLocalNote(title, content);
        const pages = await readConnectedLocalNotes();
        setNotePages(pages);
        const created = pages.find((page) => page.sourceFile === sourceFile);
        if (created) {
          setSelectedSection(created.section);
          setSelectedNoteId(created.id);
          setDraftContent(created.content);
        }
        setNoteStatus(`${sourceFile} oluşturuldu.`);
      } catch (error) {
        setNoteStatus(error instanceof Error ? error.message : 'Sayfa oluşturulamadı.');
      }
      return;
    }
    const page: OneNotePage = {
      id: `note-${Date.now()}`,
      section: selectedSection || 'Notlar',
      title,
      content: '',
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    const updated = [page, ...notePages];
    setNotePages(updated);
    saveOneNotePages(updated);
    setSelectedNoteId(page.id);
    setDraftContent('');
    setNoteStatus('Yeni sayfa oluşturuldu.');
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-6">
      <div className="mb-10 flex justify-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-3 p-1.5 bg-slate-50/80 rounded-full border border-slate-200/60 shadow-xs">
          {KNOWLEDGE_HUB_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  setActiveTab(tab.id);
                  triggerConfetti(e.currentTarget);
                }}
                className={`group px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] text-white shadow-[0_10px_22px_-6px_rgba(249,99,50,0.5)] -translate-y-0.5'
                    : 'bg-white hover:bg-orange-50/50 text-slate-700 hover:text-[#f96332] border border-slate-200/90 hover:border-orange-300 shadow-xs hover:-translate-y-0.5 hover:shadow-md'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#f96332]'}`} />
                <span>{tab.label}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'onenote' && (
        oneNoteConfig.sourceUrl ? (
          <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Bağlı OneNote Sayfası</h2>
                <p className="text-[11px] text-slate-400 truncate max-w-[70vw]">{oneNoteConfig.sourceUrl}</p>
              </div>
              <a href={oneNoteConfig.sourceUrl} target="_blank" rel="noreferrer" className="shrink-0 px-3 py-2 rounded-lg bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                Yeni sekmede aç
              </a>
            </div>
            <iframe title="OneNote web notebook" src={oneNoteConfig.sourceUrl} className="w-full h-[72vh] min-h-[520px] bg-slate-50" />
            <p className="px-5 py-3 text-[11px] leading-relaxed text-slate-400 border-t border-slate-100">
              Düzenleme ve eşitleme, bağlı web uygulaması iframe içinde çalışmayı destekliyorsa doğrudan o uygulama tarafından yapılır.
            </p>
          </section>
        ) : (
          <div className="space-y-3 animate-in fade-in">
            {noteStatus && <p className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">{noteStatus}</p>}
            {oneNoteConfig.windowsPath && !oneNoteConfig.localFolderName && (
              <p className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                Admin ayarlarında Windows yolu kayıtlı. Tarayıcı bu yolu doğrudan okuyamaz. Admin &gt; Knowledge Hub içinden “Klasör Seç” ile erişim izni verin; .md, .markdown, .txt ve .html dosyaları açılır ve aynı dosyaya kaydedilir.
              </p>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-[180px_250px_minmax(0,1fr)] min-h-[600px] bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <aside className="bg-slate-950 text-slate-100 p-3">
                <div className="flex items-center gap-2 px-2 py-3 border-b border-white/10">
                  <BookOpen className="w-4 h-4 text-violet-300" />
                  <span className="text-xs font-bold truncate">My Notebook</span>
                </div>
                <div className="pt-3 space-y-1">
                  {sections.map((section, index) => (
                    <button
                      key={section}
                      onClick={() => {
                        setSelectedSection(section);
                        const firstPage = notePages.find((page) => page.section === section);
                        if (firstPage) {
                          setSelectedNoteId(firstPage.id);
                          setDraftContent(firstPage.content);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${selectedSection === section ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10'}`}
                    >
                      <span className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ['#2563eb', '#22c55e', '#f43f5e', '#f59e0b'][index % 4] }} />
                      <span className="truncate">{section}</span>
                    </button>
                  ))}
                </div>
              </aside>

              <aside className="bg-slate-50 border-r border-slate-200 p-3">
                <div className="flex items-center justify-between px-2 py-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700">{selectedSection || 'Pages'}</span>
                  {!oneNoteConfig.sourceUrl && (
                    <button onClick={handleAddNote} className="p-1.5 rounded-md text-slate-500 hover:bg-white hover:text-[#f96332]" title="Yeni sayfa ekle">
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-1 pt-2">
                  {sectionPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        setSelectedNoteId(page.id);
                        setDraftContent(page.content);
                        setNoteStatus(null);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs truncate ${selectedNote?.id === page.id ? 'bg-white shadow-xs text-slate-900 border border-slate-200' : 'text-slate-600 hover:bg-white/80'}`}
                    >
                      <span className="block truncate">{page.title}</span>
                      <span className="block mt-1 text-[10px] text-slate-400">{page.updatedAt}</span>
                    </button>
                  ))}
                  {sectionPages.length === 0 && <p className="px-3 py-4 text-[11px] text-slate-400">Bu bölümde sayfa yok.</p>}
                </div>
              </aside>

              <main className="p-5 sm:p-8 min-w-0">
                {selectedNote ? (
                  <div className="max-w-3xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                      <div className="min-w-0">
                        <input
                          value={selectedNote.title}
                          readOnly={Boolean(selectedNote.sourceFile)}
                          onChange={(e) => {
                            const updated = notePages.map((page) => page.id === selectedNote.id ? { ...page, title: e.target.value } : page);
                            setNotePages(updated);
                            if (!selectedNote.sourceFile) saveOneNotePages(updated);
                          }}
                          className="w-full text-xl sm:text-2xl font-semibold text-slate-800 border-b border-transparent focus:border-violet-300 outline-none"
                        />
                        <p className="text-[11px] text-slate-400 mt-2">{selectedNote.updatedAt} {selectedNote.sourceFile ? `· ${selectedNote.sourceFile}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleCopy(draftContent, selectedNote.id)} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          {copiedId === selectedNote.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          Kopyala
                        </button>
                        <button onClick={handleSaveNote} className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-xs font-semibold text-white flex items-center gap-1.5">
                          <Save className="w-3.5 h-3.5" /> Kaydet
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      className="w-full min-h-[430px] p-4 rounded-xl border border-slate-200 outline-none focus:border-violet-300 text-sm leading-7 text-slate-700 resize-y"
                      aria-label="OneNote sayfa içeriği"
                    />
                    <p className="mt-3 text-[11px] text-slate-400">
                      {selectedNote.sourceFile ? 'Kaydet, değişikliği seçili yerel dosyaya yazar.' : 'Kaydet, değişikliği bu tarayıcıda saklar.'}
                    </p>
                  </div>
                ) : (
                  <div className="h-full min-h-64 flex items-center justify-center text-sm text-slate-400">Bir OneNote sayfası seçin.</div>
                )}
              </main>
            </div>
          </div>
        )
      )}

      {activeTab === 'blog' && (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start animate-in fade-in">
          <aside className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs lg:sticky lg:top-24">
            <div className="px-2 pb-3 mb-2 border-b border-slate-100">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">Ürünler & Konular</h2>
              <p className="text-[11px] text-slate-400 mt-1">Teknik yazılara göz atın</p>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { setSelectedBlogCategory('all'); setSelectedArticleId(null); }}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${selectedBlogCategory === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: selectedBlogCategory === 'all' ? 'white' : '#f97316', backgroundColor: selectedBlogCategory === 'all' ? 'rgba(255,255,255,.12)' : '#fff7ed' }}>
                  {React.createElement(getCategoryIcon('LayoutGrid'), { className: 'w-4 h-4' })}
                </span>
                Tümü
              </button>
              {BLOG_CATEGORIES.map((category) => {
                const CategoryIcon = getCategoryIcon(category.icon);
                const isSelected = selectedBlogCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => { setSelectedBlogCategory(category.id); setSelectedArticleId(null); }}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${isSelected ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: isSelected ? 'white' : category.color, backgroundColor: isSelected ? 'rgba(255,255,255,.12)' : `${category.color}18` }}>
                      <CategoryIcon className="w-4 h-4" />
                    </span>
                    {category.label}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="min-w-0">
            {selectedArticle ? (
              <article className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-9 shadow-xs">
                <button onClick={() => setSelectedArticleId(null)} className="text-xs font-bold text-[#f96332] uppercase tracking-wider flex items-center gap-1.5 hover:underline mb-6">
                  <ChevronRight className="w-4 h-4 rotate-180" /> Tüm makaleler
                </button>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BLOG_CATEGORIES.find((category) => category.id === selectedArticle.category)?.color || '#f96332' }}>{getBlogCategoryLabel(selectedArticle.category)}</span>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 mt-2">{selectedArticle.title}</h1>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-3 pb-6 border-b border-slate-100">
                  <span>Murat Krhl</span><span>·</span><span>{selectedArticle.publishedAt}</span><span>·</span><span>{selectedArticle.readTime}</span>
                </div>
                <div className="whitespace-pre-line text-sm leading-8 text-slate-700 mt-6">{selectedArticle.content}</div>
              </article>
            ) : (
              <>
                <div className="flex items-end justify-between gap-4 mb-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#f96332]">Engineering Journal</span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">{selectedBlogCategory === 'all' ? 'Latest Articles' : BLOG_CATEGORIES.find((category) => category.id === selectedBlogCategory)?.label || selectedBlogCategory}</h1>
                  </div>
                  <span className="text-xs text-slate-400">{filteredPosts.length} article{filteredPosts.length === 1 ? '' : 's'}</span>
                </div>
                <div className="space-y-4">
                  {filteredPosts.map((post, index) => {
                    const categoryColor = BLOG_CATEGORIES.find((category) => category.id === post.category)?.color || '#f96332';
                    return (
                      <article key={post.id} onClick={() => setSelectedArticleId(post.id)} className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)]">
                          <div className="min-h-36 sm:min-h-full flex items-center justify-center" style={{ background: `linear-gradient(145deg, ${categoryColor}24, ${categoryColor}0d)` }}>
                            {(() => {
                              const CategoryIcon = getCategoryIcon(BLOG_CATEGORIES.find((category) => category.id === post.category)?.icon || 'BookOpen');
                              return <CategoryIcon className="w-10 h-10" style={{ color: categoryColor }} />;
                            })()}
                          </div>
                          <div className="p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 uppercase tracking-wider">
                              <span className="font-extrabold" style={{ color: categoryColor }}>{getBlogCategoryLabel(post.category)}</span>
                              <span>{post.publishedAt} · {post.readTime}</span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#f96332] transition-colors mt-2">{post.title}</h2>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 line-clamp-3">{post.summary}</p>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#f96332]">
                              <span>Read Article</span><ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                  {filteredPosts.length === 0 && <div className="p-10 bg-white rounded-2xl border border-slate-200 text-sm text-slate-500 text-center">Bu konuda henüz makale yok.</div>}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {activeTab === 'release' && <ReleaseDashboard />}
      {activeTab === 'education' && renderEducationWorkspace()}
    </div>
  );
};
