import React, { useState } from 'react';
import { 
  ArrowLeft, 
  UserPlus, 
  Check, 
  MessageSquare, 
  Heart, 
  Grid, 
  Layers, 
  Info, 
  X,
  ExternalLink,
  Camera,
  Share2
} from 'lucide-react';
import { ASSETS } from '../../data/assets';

interface ProfilePageProps {
  onBackToKit: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBackToKit }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(260);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'collections' | 'about'>('portfolio');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const toggleFollow = () => {
    if (isFollowing) {
      setFollowerCount((prev) => prev - 1);
      setIsFollowing(false);
    } else {
      setFollowerCount((prev) => prev + 1);
      setIsFollowing(true);
    }
  };

  const portfolioItems = [
    { title: 'Alpine Serenity', category: 'Landscape', image: ASSETS.carouselNature },
    { title: 'Architectural Solitude', category: 'Interior', image: ASSETS.projectShowcase },
    { title: 'Metropolitan Dusk', category: 'Cityscape', image: ASSETS.heroBg },
    { title: 'Studio Vignette', category: 'Portraiture', image: ASSETS.profileAvatar },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Return to Kit Navigation Floating Strip */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={onBackToKit}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white/95 text-slate-800 hover:text-[#f96332] rounded-full shadow-lg border border-slate-100 flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 text-[#f96332]" />
          <span>Back to UI Kit</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="relative h-80 sm:h-96 w-full overflow-hidden">
        <img
          src={ASSETS.carouselNature}
          alt="Profile Header Banner"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
      </div>

      {/* Profile Overview Card */}
      <div className="max-w-4xl mx-auto px-6 -mt-24 sm:-mt-28 relative z-10 text-center pb-16">
        {/* Avatar */}
        <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full overflow-hidden mx-auto shadow-now-raised border-4 border-white bg-white">
          <img
            src={ASSETS.profileAvatar}
            alt="Ryan Scheinder"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name & Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900 mt-5">
          Ryan Scheinder
        </h1>
        <p className="text-xs font-bold uppercase tracking-wider text-[#f96332] mt-1">
          Photographer & Creative Director
        </p>

        {/* Bio */}
        <p className="text-sm text-slate-600 max-w-xl mx-auto mt-4 leading-relaxed font-sans">
          An artist of considerable range, Ryan — the name taken by Melbourne-raised, Brooklyn-based photographer — captures serene nature landscapes and contemporary architecture.
        </p>

        {/* Metrics Bar */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 my-6 pt-4 border-t border-slate-100 max-w-md mx-auto">
          <div>
            <span className="block text-xl font-extrabold text-slate-900 tabular-nums">26</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Following</span>
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900 tabular-nums">{followerCount}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Followers</span>
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900 tabular-nums">32</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Projects</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <button
            onClick={toggleFollow}
            className={`px-7 py-3 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 flex items-center gap-2 ${
              isFollowing
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-[#f96332] text-white hover:bg-[#e04e20] shadow-now-primary hover:scale-102'
            }`}
          >
            {isFollowing ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            <span>{isFollowing ? 'Following' : 'Follow'}</span>
          </button>

          <button
            onClick={() => alert('Opening direct message composer...')}
            className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message</span>
          </button>
        </div>

        {/* Gallery Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 border-b border-slate-200 pb-3 mb-10">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-2 ${
              activeTab === 'portfolio'
                ? 'bg-[#f96332] text-white shadow-now-primary'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Portfolio</span>
          </button>

          <button
            onClick={() => setActiveTab('collections')}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-2 ${
              activeTab === 'collections'
                ? 'bg-[#f96332] text-white shadow-now-primary'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Collections</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-2 ${
              activeTab === 'about'
                ? 'bg-[#f96332] text-white shadow-now-primary'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>
        </div>

        {/* Tab 1: Portfolio Photo Grid */}
        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in">
            {portfolioItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhoto(item.image)}
                className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-left text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#f96332]">
                    {item.category}
                  </span>
                  <h4 className="text-lg font-bold uppercase">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Collections */}
        {activeTab === 'collections' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in text-left">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2ca8ff]">Series 01</span>
              <h3 className="text-base font-bold text-slate-900">Alpine Lakes & Glacial Peaks</h3>
              <p className="text-xs text-slate-500">18 Photographs · Shot on Medium Format Digital in Switzerland and Patagonia.</p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#18ce0f]">Series 02</span>
              <h3 className="text-base font-bold text-slate-900">Scandinavian Light & Living</h3>
              <p className="text-xs text-slate-500">14 Photographs · Architectural studies in Copenhagen and Stockholm.</p>
            </div>
          </div>
        )}

        {/* Tab 3: About */}
        {activeTab === 'about' && (
          <div className="bg-slate-50/70 p-8 rounded-3xl border border-slate-100 text-left space-y-4 max-w-2xl mx-auto animate-in fade-in text-sm text-slate-600 leading-relaxed">
            <h3 className="text-base font-bold uppercase tracking-wide text-slate-900">
              Biography & Equipment
            </h3>
            <p>
              Ryan has been commissioned for editorial stories in Architectural Digest, Kinfolk, and Cereal Magazine. His work focuses on the intersection of human habitats and raw geological landscapes.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
              <span className="px-3 py-1 bg-white rounded-full border border-slate-200">Hasselblad 907X</span>
              <span className="px-3 py-1 bg-white rounded-full border border-slate-200">Leica M11</span>
              <span className="px-3 py-1 bg-white rounded-full border border-slate-200">35mm Summilux</span>
              <span className="px-3 py-1 bg-white rounded-full border border-slate-200">Natural Daylight</span>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={selectedPhoto}
              alt="Enlarged view"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white text-center text-xs border-t border-slate-800">
        <p className="text-slate-400">
          © {new Date().getFullYear()} Now UI Kit. Coded with React & Tailwind CSS for Creative Tim.
        </p>
      </footer>
    </div>
  );
};
