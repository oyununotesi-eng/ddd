import React from 'react';
import { Quote, Code2 } from 'lucide-react';
import { ASSETS } from '../../data/assets';
import { CodeSnippet } from '../../types';

interface TypographyAndImagesSectionProps {
  onInspectCode: (snippet: CodeSnippet) => void;
}

export const TypographyAndImagesSection: React.FC<TypographyAndImagesSectionProps> = ({ onInspectCode }) => {
  return (
    <section id="typography-and-images" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-14 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900">
              Typography & Images
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Montserrat type scale, blockquotes, contextual colors, and polished image elevations
            </p>
          </div>
          <button
            onClick={() => onInspectCode({
              title: "Typography & Image Styling",
              category: "Typography",
              code: `// Raised Image Elevation
<img 
  src="/path-to-image.jpg" 
  alt="Raised showcase" 
  className="rounded-2xl shadow-now-raised object-cover transition-transform hover:scale-102"
/>

// Blockquote Styling
<blockquote className="border-l-0 pl-6 my-6 relative text-slate-700 italic">
  <Quote className="w-8 h-8 text-[#f96332]/20 absolute -top-3 -left-2" />
  "Design is not just what it looks like and feels like. Design is how it works."
  <footer className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2 not-italic">
    — Steve Jobs
  </footer>
</blockquote>`
            })}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#f96332] bg-orange-50 hover:bg-orange-100 rounded-full transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>View Snippet</span>
          </button>
        </div>

        {/* 1. TYPOGRAPHY SCALE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Headings */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-6">
              Heading Scale
            </h3>

            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-mono text-slate-400">h1</span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  Header 1 Bold
                </h1>
              </div>

              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-mono text-slate-400">h2</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Header 2 Display
                </h2>
              </div>

              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-mono text-slate-400">h3</span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Header 3 Section
                </h3>
              </div>

              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-mono text-slate-400">h4</span>
                <h4 className="text-lg font-semibold text-slate-900">
                  Header 4 Subsection
                </h4>
              </div>

              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-mono text-slate-400">h5</span>
                <h5 className="text-base font-semibold text-slate-900">
                  Header 5 Card Title
                </h5>
              </div>

              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-mono text-slate-400">h6</span>
                <h6 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Header 6 Micro Label
                </h6>
              </div>
            </div>
          </div>

          {/* Paragraphs & Contextual Colors */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-6">
              Paragraphs & Quotes
            </h3>

            <p className="text-base text-slate-700 leading-relaxed font-normal">
              <span className="font-bold text-slate-900">Lead Paragraph:</span> I will be the leader of a company that ends up being worth billions of dollars, because I got the answers. I understand culture. I am the nucleus. I think that’s a responsibility that I have, to push possibilities.
            </p>

            {/* Blockquote with Now UI touch */}
            <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-100 relative">
              <Quote className="w-8 h-8 text-[#f96332]/30 mb-2" />
              <p className="text-sm italic text-slate-700 leading-relaxed">
                "Creativity is just connecting things. When you ask creative people how they did something, they feel a little guilty because they didn't really do it, they just saw something."
              </p>
              <div className="mt-3 text-xs font-bold uppercase tracking-wider text-[#f96332]">
                — Steve Jobs
              </div>
            </div>

            {/* Contextual Text Colors */}
            <div className="pt-2 space-y-1.5 text-xs font-semibold">
              <p className="text-slate-400">Muted Text: Subtle auxiliary note for metadata.</p>
              <p className="text-[#f96332]">Primary Text: Vibrant orange accent for links.</p>
              <p className="text-[#2ca8ff]">Info Text: Helpful hint for user workflows.</p>
              <p className="text-[#18ce0f]">Success Text: Confirmed action and validated state.</p>
              <p className="text-[#ffb236]">Warning Text: Attention needed before proceeding.</p>
              <p className="text-[#ff3636]">Danger Text: Critical error message requiring action.</p>
            </div>
          </div>
        </div>

        {/* 2. IMAGE VARIANTS */}
        <div className="pt-8 border-t border-slate-100">
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Images & Shapes
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Rounded, circle avatars, raised drop-shadows, and styled thumbnails
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Rounded Image */}
            <div className="space-y-3 text-center">
              <div className="h-48 overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={ASSETS.projectShowcase}
                  alt="Rounded showcase"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">Rounded Image</span>
                <span className="text-[11px] text-slate-400">rounded-2xl overflow-hidden</span>
              </div>
            </div>

            {/* Circle Image (Avatar) */}
            <div className="space-y-3 text-center flex flex-col items-center">
              <div className="w-48 h-48 rounded-full overflow-hidden bg-slate-100 shadow-md">
                <img
                  src={ASSETS.profileAvatar}
                  alt="Circle avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">Circle Image</span>
                <span className="text-[11px] text-slate-400">rounded-full avatar</span>
              </div>
            </div>

            {/* Raised Image */}
            <div className="space-y-3 text-center">
              <div className="h-48 overflow-hidden rounded-2xl bg-slate-100 shadow-now-raised">
                <img
                  src={ASSETS.carouselNature}
                  alt="Raised nature"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">Raised Shadow</span>
                <span className="text-[11px] text-slate-400">shadow-now-raised drop shadow</span>
              </div>
            </div>

            {/* Thumbnail Image with Frame */}
            <div className="space-y-3 text-center">
              <div className="h-48 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <img
                  src={ASSETS.heroBg}
                  alt="Thumbnail skyline"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">Thumbnail Frame</span>
                <span className="text-[11px] text-slate-400">p-2 border with inner round</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
