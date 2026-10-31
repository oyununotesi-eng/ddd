import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Code2, 
  Check, 
  Sparkles, 
  MessageCircle,
  HelpCircle,
  Sliders,
  Play,
  Pause
} from 'lucide-react';
import { ASSETS } from '../../data/assets';
import { CodeSnippet } from '../../types';

interface JavascriptComponentsSectionProps {
  onInspectCode: (snippet: CodeSnippet) => void;
}

export const JavascriptComponentsSection: React.FC<JavascriptComponentsSectionProps> = ({ onInspectCode }) => {
  // Modal states
  const [classicModalOpen, setClassicModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);

  // Datepicker state
  const [datepickerOpen, setDatepickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 9, 28));
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 9, 1));

  // Tooltip & Popover state
  const [activePopover, setActivePopover] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null);

  // Carousel state
  const carouselSlides = [
    {
      image: ASSETS.carouselNature,
      title: 'Nature, Yellowstone National Park',
      caption: 'Somewhere beyond the majestic peaks and crystal glacial lakes where ideas take flight.',
    },
    {
      image: ASSETS.projectShowcase,
      title: 'Modern Architecture & Living Space',
      caption: 'Clean geometric lines, sustainable materials, and warm natural morning light.',
    },
    {
      image: ASSETS.heroBg,
      title: 'Urban Skyline at Sunset',
      caption: 'Thriving metropolises connecting thousands of creators and engineers worldwide.',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  useEffect(() => {
    if (!isAutoplay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoplay, carouselSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  // Calendar helpers
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  return (
    <section id="javascript-components" className="py-20 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-14 pb-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900">
              JavaScript Components
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Interactive dialog modals, calendar datepicker, multi-directional tooltips, and responsive carousel
            </p>
          </div>
          <button
            onClick={() => onInspectCode({
              title: "Interactive Modal & Tooltips",
              category: "JavaScript Plugins",
              code: `// Classic Dialog Modal
{isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95">
      <h3 className="text-lg font-bold">Modal Title</h3>
      <p className="text-sm text-slate-600 mt-2">Modal content...</p>
      <div className="flex justify-end gap-2 mt-6">
        <button className="px-4 py-2 text-xs font-bold uppercase rounded-full bg-[#f96332] text-white">Save</button>
      </div>
    </div>
  </div>
)}`
            })}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#f96332] bg-white border border-orange-200 hover:bg-orange-50 rounded-full transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>View Snippet</span>
          </button>
        </div>

        {/* 1. MODALS & DATEPICKER ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Modals Demo */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Interactive Dialog Modals
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Now UI Kit dialogs are designed with rounded corners, subtle drop shadows, and clean button actions.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setClassicModalOpen(true)}
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-now-primary transition-all active:scale-95"
              >
                Launch Classic Modal
              </button>

              <button
                onClick={() => setNoticeModalOpen(true)}
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2ca8ff] hover:bg-[#1b9bf2] rounded-full shadow-now-info transition-all active:scale-95"
              >
                Notice Modal
              </button>
            </div>
          </div>

          {/* Datepicker Demo */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Interactive Datepicker
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Click the input field below to toggle the custom interactive calendar picker.
            </p>

            <div className="relative max-w-sm">
              <div
                onClick={() => setDatepickerOpen(!datepickerOpen)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg cursor-pointer flex items-center justify-between hover:border-[#f96332] transition-colors shadow-xs"
              >
                <span className="font-semibold text-slate-800">
                  {selectedDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-xs text-[#f96332] font-bold uppercase">Change Date</span>
              </div>
              <CalendarIcon className="w-4 h-4 text-[#f96332] absolute left-3.5 top-3.5 pointer-events-none" />

              {/* Datepicker Calendar Popup */}
              {datepickerOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-72 z-30 animate-in fade-in">
                  {/* Month Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <button
                      onClick={() =>
                        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
                      }
                      className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
                      }
                      className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Days of week */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase mb-1">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  {/* Day cells */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNumber = i + 1;
                      const isSelected =
                        selectedDate.getDate() === dayNumber &&
                        selectedDate.getMonth() === currentMonth.getMonth() &&
                        selectedDate.getFullYear() === currentMonth.getFullYear();

                      return (
                        <button
                          key={dayNumber}
                          onClick={() => {
                            setSelectedDate(
                              new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber)
                            );
                            setDatepickerOpen(false);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-medium transition-colors ${
                            isSelected
                              ? 'bg-[#f96332] text-white font-bold shadow-now-primary'
                              : 'text-slate-700 hover:bg-orange-50 hover:text-[#f96332]'
                          }`}
                        >
                          {dayNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. POPOVERS & TOOLTIPS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 pt-8 border-t border-slate-200/80">
          {/* Popovers */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Popovers
            </h3>
            <p className="text-xs text-slate-500 font-medium">Click buttons to toggle directional popovers</p>

            <div className="flex flex-wrap gap-3 pt-2">
              {(['top', 'bottom', 'left', 'right'] as const).map((dir) => (
                <div key={dir} className="relative">
                  <button
                    onClick={() => setActivePopover(activePopover === dir ? null : dir)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white border border-slate-200 hover:border-[#f96332] text-slate-700 rounded-full transition-all shadow-xs"
                  >
                    On {dir}
                  </button>

                  {activePopover === dir && (
                    <div
                      className={`absolute z-20 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-3 text-xs text-slate-600 animate-in fade-in ${
                        dir === 'top'
                          ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
                          : dir === 'bottom'
                          ? 'top-full left-1/2 -translate-x-1/2 mt-2'
                          : dir === 'left'
                          ? 'right-full top-1/2 -translate-y-1/2 mr-2'
                          : 'left-full top-1/2 -translate-y-1/2 ml-2'
                      }`}
                    >
                      <div className="font-bold text-slate-900 mb-1 capitalize">Popover {dir}</div>
                      <div>Here is rich popover content styled according to Now UI Kit principles.</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tooltips */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Tooltips
            </h3>
            <p className="text-xs text-slate-500 font-medium">Hover over buttons to trigger tooltips</p>

            <div className="flex flex-wrap gap-3 pt-2">
              {(['top', 'bottom', 'left', 'right'] as const).map((dir) => (
                <div key={dir} className="relative">
                  <button
                    onMouseEnter={() => setActiveTooltip(dir)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all"
                  >
                    Tooltip on {dir}
                  </button>

                  {activeTooltip === dir && (
                    <div
                      className={`absolute z-20 bg-slate-900 text-white rounded-md px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap shadow-lg animate-in fade-in ${
                        dir === 'top'
                          ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
                          : dir === 'bottom'
                          ? 'top-full left-1/2 -translate-x-1/2 mt-2'
                          : dir === 'left'
                          ? 'right-full top-1/2 -translate-y-1/2 mr-2'
                          : 'left-full top-1/2 -translate-y-1/2 ml-2'
                      }`}
                    >
                      Tooltip {dir} message
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. RESPONSIVE CAROUSEL */}
        <div className="pt-8 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Responsive Carousel
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Full-width responsive slider with slide indicators, manual arrows, and autoplay controls
              </p>
            </div>
            <button
              onClick={() => setIsAutoplay(!isAutoplay)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700"
            >
              {isAutoplay ? <Pause className="w-3 h-3 text-[#f96332]" /> : <Play className="w-3 h-3 text-[#18ce0f]" />}
              <span>{isAutoplay ? 'Pause Autoplay' : 'Resume Autoplay'}</span>
            </button>
          </div>

          {/* Carousel Frame */}
          <div className="relative h-80 sm:h-96 md:h-[460px] rounded-3xl overflow-hidden shadow-now-raised bg-slate-900">
            {/* Slides */}
            {carouselSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                
                {/* Caption */}
                <div className="absolute bottom-10 left-6 sm:left-12 right-6 sm:right-12 text-white max-w-2xl">
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white drop-shadow mb-2">
                    {slide.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-sans">
                    {slide.caption}
                  </p>
                </div>
              </div>
            ))}

            {/* Prev / Next Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-xs transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-xs transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {carouselSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'w-8 bg-[#f96332]' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CLASSIC MODAL POPUP */}
        {classicModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h4 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Modal Title Header
                </h4>
                <button
                  onClick={() => setClassicModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 text-sm text-slate-600 leading-relaxed space-y-3">
                <p>
                  Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics.
                </p>
                <p>
                  A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country.
                </p>
              </div>
              <div className="p-4 bg-slate-50 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  onClick={() => setClassicModalOpen(false)}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('Saved changes!');
                    setClassicModalOpen(false);
                  }}
                  className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-now-primary transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTICE MODAL POPUP */}
        {noticeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-100 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 text-[#2ca8ff] flex items-center justify-center shadow-now-info">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-2">
                How Do You Like It?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Now UI Kit is designed to accelerate frontend prototyping while giving your interfaces a distinctive aesthetic.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setNoticeModalOpen(false)}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2ca8ff] hover:bg-[#1b9bf2] rounded-full shadow-now-info transition-all"
                >
                  Looks Fantastic!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
