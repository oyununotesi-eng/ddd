import React, { useState } from 'react';
import { 
  Home, 
  User, 
  MessageSquare, 
  Settings, 
  Code2, 
  Compass, 
  Bookmark, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { CodeSnippet } from '../../types';

interface TabsAndPillsSectionProps {
  onInspectCode: (snippet: CodeSnippet) => void;
}

export const TabsAndPillsSection: React.FC<TabsAndPillsSectionProps> = ({ onInspectCode }) => {
  // Card 1 Active Tab (Orange Header)
  const [card1Tab, setCard1Tab] = useState<'profile' | 'messages' | 'settings'>('profile');

  // Card 2 Active Tab (Info Blue Header)
  const [card2Tab, setCard2Tab] = useState<'home' | 'activity' | 'history'>('home');

  // Horizontal Pills Active Tab
  const [horizontalPill, setHorizontalPill] = useState<'dashboard' | 'schedule' | 'tasks'>('dashboard');

  // Vertical Pills Active Tab
  const [verticalPill, setVerticalPill] = useState<'profile' | 'security' | 'billing'>('profile');

  return (
    <section id="tabs-and-pills" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-14 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900">
              Tabs & Pills
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Card navigation tabs with vibrant colored headers, horizontal pills, and vertical segmented controllers
            </p>
          </div>
          <button
            onClick={() => onInspectCode({
              title: "Card Tabs & Navigation Pills",
              category: "Navigation / Tabs",
              code: `// Horizontal Navigation Pills
<div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-full w-fit">
  <button 
    onClick={() => setTab('home')}
    className={\`px-5 py-2 text-xs font-bold uppercase rounded-full transition-all \${
      tab === 'home' ? 'bg-[#f96332] text-white shadow-now-primary' : 'text-slate-600 hover:text-slate-900'
    }\`}
  >
    Home
  </button>
</div>`
            })}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#f96332] bg-orange-50 hover:bg-orange-100 rounded-full transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>View Snippet</span>
          </button>
        </div>

        {/* 1. CARDS WITH HEADER TABS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Card 1: Primary Orange Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Colored Header with Tabs */}
            <div className="bg-[#f96332] text-white p-6 pb-0 shadow-now-primary">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-white/90">Card With Tabs</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto">
                <button
                  onClick={() => setCard1Tab('profile')}
                  className={`pb-4 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    card1Tab === 'profile'
                      ? 'border-white text-white opacity-100'
                      : 'border-transparent text-white/70 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setCard1Tab('messages')}
                  className={`pb-4 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    card1Tab === 'messages'
                      ? 'border-white text-white opacity-100'
                      : 'border-transparent text-white/70 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Messages</span>
                </button>
                <button
                  onClick={() => setCard1Tab('settings')}
                  className={`pb-4 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    card1Tab === 'settings'
                      ? 'border-white text-white opacity-100'
                      : 'border-transparent text-white/70 hover:text-white'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 min-h-[170px] text-sm text-slate-600 leading-relaxed">
              {card1Tab === 'profile' && (
                <div className="animate-in fade-in duration-200 space-y-2">
                  <p className="font-semibold text-slate-900">User Profile Overview</p>
                  <p>
                    I think that’s a responsibility that I have, to push possibilities, to show people, this is the level that things could be at. Now UI Kit allows rapid prototyping with iconic typography and distinct visual rhythm.
                  </p>
                </div>
              )}
              {card1Tab === 'messages' && (
                <div className="animate-in fade-in duration-200 space-y-2">
                  <p className="font-semibold text-slate-900">Direct Messages (3 unread)</p>
                  <p>
                    I will be the leader of a company that ends up being worth billions of dollars, because I got the answers. I understand culture. I am the nucleus. Everything is connected.
                  </p>
                </div>
              )}
              {card1Tab === 'settings' && (
                <div className="animate-in fade-in duration-200 space-y-2">
                  <p className="font-semibold text-slate-900">System Preferences</p>
                  <p>
                    Completely synergize resource taxing relationships via premier niche markets. Professionally cultivate one-to-one customer service with robust ideas and clean state management.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Info Blue Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Colored Header with Tabs */}
            <div className="bg-[#2ca8ff] text-white p-6 pb-0 shadow-now-info">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-white/90">Card With Icons</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto">
                <button
                  onClick={() => setCard2Tab('home')}
                  className={`pb-4 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    card2Tab === 'home'
                      ? 'border-white text-white opacity-100'
                      : 'border-transparent text-white/70 hover:text-white'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => setCard2Tab('activity')}
                  className={`pb-4 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    card2Tab === 'activity'
                      ? 'border-white text-white opacity-100'
                      : 'border-transparent text-white/70 hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Activity</span>
                </button>
                <button
                  onClick={() => setCard2Tab('history')}
                  className={`pb-4 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    card2Tab === 'history'
                      ? 'border-white text-white opacity-100'
                      : 'border-transparent text-white/70 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>History</span>
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 min-h-[170px] text-sm text-slate-600 leading-relaxed">
              {card2Tab === 'home' && (
                <div className="animate-in fade-in duration-200 space-y-2">
                  <p className="font-semibold text-slate-900">Welcome to Creative Workspace</p>
                  <p>
                    Collaboratively administrate empowered markets via plug-and-play networks. Dynamically procrastinate B2C users after installed base benefits. Dramatically visualize customer directed convergence.
                  </p>
                </div>
              )}
              {card2Tab === 'activity' && (
                <div className="animate-in fade-in duration-200 space-y-2">
                  <p className="font-semibold text-slate-900">Real-time Stream</p>
                  <p>
                    Efficiently unleash cross-media information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions.
                  </p>
                </div>
              )}
              {card2Tab === 'history' && (
                <div className="animate-in fade-in duration-200 space-y-2">
                  <p className="font-semibold text-slate-900">Archived Deployments</p>
                  <p>
                    Proactively envisioned multimedia based expertise and cross-media growth strategies. Seamlessly visualize quality intellectual capital without superior collaboration.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. NAVIGATION PILLS (Horizontal & Vertical) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4">
          {/* Horizontal Pills */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
              Horizontal Navigation Pills
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setHorizontalPill('dashboard')}
                className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 ${
                  horizontalPill === 'dashboard'
                    ? 'bg-[#f96332] text-white shadow-now-primary scale-102'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setHorizontalPill('schedule')}
                className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 ${
                  horizontalPill === 'schedule'
                    ? 'bg-[#f96332] text-white shadow-now-primary scale-102'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => setHorizontalPill('tasks')}
                className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 ${
                  horizontalPill === 'tasks'
                    ? 'bg-[#f96332] text-white shadow-now-primary scale-102'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tasks
              </button>
            </div>

            <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed min-h-[140px]">
              {horizontalPill === 'dashboard' && (
                <p>
                  Collaboratively leverage existing core competencies rather than customized manufactured products. Rapidly redefine long-term high-impact opportunities with intuitive dashboards.
                </p>
              )}
              {horizontalPill === 'schedule' && (
                <p>
                  Plan agile sprints, milestones, and release windows. Synchronize team calendars with zero scheduling friction and continuous deployment loops.
                </p>
              )}
              {horizontalPill === 'tasks' && (
                <p>
                  Track progress items, assignees, deadlines, and automated code review pipelines. Empower team execution with clear accountability.
                </p>
              )}
            </div>
          </div>

          {/* Vertical Pills */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
              Vertical Navigation Pills
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Vertical Menu Buttons */}
              <div className="flex sm:flex-col gap-2">
                <button
                  onClick={() => setVerticalPill('profile')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                    verticalPill === 'profile'
                      ? 'bg-[#f96332] text-white shadow-now-primary'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setVerticalPill('security')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                    verticalPill === 'security'
                      ? 'bg-[#f96332] text-white shadow-now-primary'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Security</span>
                </button>
                <button
                  onClick={() => setVerticalPill('billing')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                    verticalPill === 'billing'
                      ? 'bg-[#f96332] text-white shadow-now-primary'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Billing</span>
                </button>
              </div>

              {/* Vertical Content */}
              <div className="sm:col-span-2 p-6 bg-slate-50/70 rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed min-h-[140px]">
                {verticalPill === 'profile' && (
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">Personal Details</p>
                    <p>
                      Update your avatar, username, and bio. Changes reflect across all active workspace projects instantly.
                    </p>
                  </div>
                )}
                {verticalPill === 'security' && (
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">Two-Factor Authentication</p>
                    <p>
                      Enforce hardware security keys or authenticator apps for all workspace team members.
                    </p>
                  </div>
                )}
                {verticalPill === 'billing' && (
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">Invoices & Seats</p>
                    <p>
                      Manage subscription tiers, credit card details, and download past monthly receipts in PDF format.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
