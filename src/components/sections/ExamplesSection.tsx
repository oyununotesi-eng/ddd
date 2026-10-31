import React from 'react';
import { ExternalLink, Compass, User, Lock, ArrowRight } from 'lucide-react';
import { PageView } from '../../types';
import { ASSETS } from '../../data/assets';

interface ExamplesSectionProps {
  onSelectPage: (page: PageView) => void;
}

export const ExamplesSection: React.FC<ExamplesSectionProps> = ({ onSelectPage }) => {
  const templates = [
    {
      id: 'landing' as PageView,
      title: 'Landing Page',
      subtitle: 'Marketing & Corporate Showcase',
      description: 'Features a cinematic hero, value proposition pillars, team showcase cards, and a styled contact section.',
      image: ASSETS.projectShowcase,
      color: 'from-[#f96332] to-[#ffb236]',
      badgeColor: 'bg-orange-50 text-[#f96332]',
      icon: Compass,
    },
    {
      id: 'profile' as PageView,
      title: 'Profile Page',
      subtitle: 'Creative Portfolio & Gallery',
      description: 'Clean personal profile header with circular avatar, follower metrics, interactive photo tabs, and bio information.',
      image: ASSETS.carouselNature,
      color: 'from-[#2ca8ff] to-[#18ce0f]',
      badgeColor: 'bg-blue-50 text-[#2ca8ff]',
      icon: User,
    },
    {
      id: 'login' as PageView,
      title: 'Login Page',
      subtitle: 'Authentication & Access Screen',
      description: 'Centered card login screen with social auth triggers (Google, Twitter, Facebook), formatted inputs, and gradient backdrop.',
      image: ASSETS.heroBg,
      color: 'from-[#ff3636] to-[#f96332]',
      badgeColor: 'bg-rose-50 text-rose-600',
      icon: Lock,
    },
  ];

  return (
    <section id="examples-section" className="py-24 bg-slate-50/70 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f96332] block mb-2">
            Production Templates
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-900">
            Completed Examples
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Now UI Kit comes packaged with fully assembled, responsive templates ready to deploy for your products, accounts, and teams.
          </p>
        </div>

        {/* Templates Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templates.map((tpl) => {
            const IconComp = tpl.icon;
            return (
              <div
                key={tpl.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col transform hover:-translate-y-1"
              >
                {/* Visual Thumbnail Preview */}
                <div className="relative h-56 overflow-hidden bg-slate-900">
                  <img
                    src={tpl.image}
                    alt={tpl.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Icon badge */}
                  <div className="absolute top-4 left-4 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md text-slate-900 shadow-md">
                    <IconComp className="w-5 h-5 text-[#f96332]" />
                  </div>

                  {/* Overlay Title */}
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <h3 className="text-xl font-bold uppercase tracking-wide text-white drop-shadow">
                      {tpl.title}
                    </h3>
                    <p className="text-xs text-white/80 font-medium">{tpl.subtitle}</p>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {tpl.description}
                  </p>

                  <button
                    onClick={() => {
                      onSelectPage(tpl.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-3 px-5 text-xs font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-now-primary transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-101"
                  >
                    <span>Launch {tpl.title}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
