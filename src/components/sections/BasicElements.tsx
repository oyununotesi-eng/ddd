import React, { useState } from 'react';
import { 
  Heart, 
  Search, 
  User, 
  Lock, 
  Mail, 
  Check, 
  AlertCircle, 
  Code2, 
  Send,
  Volume2,
  Sliders,
  Settings
} from 'lucide-react';
import { CodeSnippet } from '../../types';

interface BasicElementsProps {
  onInspectCode: (snippet: CodeSnippet) => void;
}

export const BasicElements: React.FC<BasicElementsProps> = ({ onInspectCode }) => {
  // Checkbox states
  const [checkbox1, setCheckbox1] = useState(true);
  const [checkbox2, setCheckbox2] = useState(false);
  
  // Radio states
  const [radioValue, setRadioValue] = useState<'option1' | 'option2'>('option1');

  // Toggle switch states
  const [switch1, setSwitch1] = useState(true);
  const [switch2, setSwitch2] = useState(false);

  // Slider states
  const [sliderValue, setSliderValue] = useState(42);
  const [sliderRange, setSliderRange] = useState(70);

  // Form input states
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section id="basic-elements" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div className="mb-14 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900">
              Basic Elements
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Buttons, form inputs, custom checkboxes, radio controls, and sliders
            </p>
          </div>
          <button
            onClick={() => onInspectCode({
              title: "Basic Buttons & Inputs",
              category: "Form & Interactive",
              code: `// Now UI Kit Primary Button
<button className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-now-primary transition-all duration-200">
  Primary Button
</button>

// Now UI Input with Icon
<div className="relative">
  <input 
    type="text" 
    placeholder="Search..." 
    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:border-[#f96332] focus:ring-1 focus:ring-[#f96332] outline-none transition-all"
  />
  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
</div>`
            })}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#f96332] bg-orange-50 hover:bg-orange-100 rounded-full transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>View React Snippet</span>
          </button>
        </div>

        {/* 1. BUTTONS */}
        <div className="space-y-10 mb-16">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Buttons
            </h3>
            <span className="text-xs text-slate-400">Multiple styles, sizes, and colors</span>
          </div>

          {/* Button Styles Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            {/* Default */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Default</span>
              <button 
                onClick={() => alert('Clicked Default Button!')}
                className="w-full py-2.5 px-6 text-xs font-bold uppercase tracking-wider text-white bg-[#888888] hover:bg-[#777777] rounded transition-all shadow-sm active:scale-95"
              >
                Default
              </button>
            </div>

            {/* Round */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Round</span>
              <button 
                onClick={() => alert('Clicked Round Button!')}
                className="w-full py-2.5 px-6 text-xs font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-now-primary transition-all duration-200 active:scale-95"
              >
                Primary Round
              </button>
            </div>

            {/* With Icon */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">With Icon</span>
              <button 
                onClick={() => alert('Clicked Info Button!')}
                className="w-full py-2.5 px-6 text-xs font-bold uppercase tracking-wider text-white bg-[#2ca8ff] hover:bg-[#1b9bf2] rounded-full shadow-now-info transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>With Icon</span>
              </button>
            </div>

            {/* Simple / Ghost */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Simple (Ghost)</span>
              <button 
                onClick={() => alert('Clicked Simple Button!')}
                className="w-full py-2.5 px-6 text-xs font-bold uppercase tracking-wider text-[#f96332] hover:bg-orange-50 border border-[#f96332] rounded-full transition-all active:scale-95"
              >
                Simple
              </button>
            </div>
          </div>

          {/* Color Variations */}
          <div className="space-y-3 pt-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Color Palette</span>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#888888] hover:bg-[#777777] rounded-full transition-all active:scale-95">
                Default
              </button>
              <button className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-now-primary transition-all active:scale-95">
                Primary
              </button>
              <button className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2ca8ff] hover:bg-[#1b9bf2] rounded-full shadow-now-info transition-all active:scale-95">
                Info
              </button>
              <button className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#18ce0f] hover:bg-[#15ba0d] rounded-full shadow-now-success transition-all active:scale-95">
                Success
              </button>
              <button className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#ffb236] hover:bg-[#e99e23] rounded-full shadow-now-warning transition-all active:scale-95">
                Warning
              </button>
              <button className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#ff3636] hover:bg-[#e82525] rounded-full shadow-now-danger transition-all active:scale-95">
                Danger
              </button>
              <button className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2c2c2c] hover:bg-[#1a1a1a] rounded-full transition-all active:scale-95">
                Neutral
              </button>
            </div>
          </div>

          {/* Button Sizes */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Sizes</span>
            <div className="flex flex-wrap items-center gap-4">
              <button className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-sm transition-all active:scale-95">
                Small (sm)
              </button>
              <button className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-now-primary transition-all active:scale-95">
                Regular (md)
              </button>
              <button className="px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-lg transition-all active:scale-95">
                Large (lg)
              </button>
            </div>
          </div>

          {/* Social Buttons Showcase (Now UI Kit Official) */}
          <div className="pt-8 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Social Buttons
                </h4>
                <p className="text-xs text-slate-400">
                  Standard, Square, Round Circle, Simple Icon and Simple Link variants
                </p>
              </div>
              <button
                onClick={() => onInspectCode({
                  title: "Now UI Kit Social Buttons",
                  category: "Buttons & Social",
                  code: `// Twitter Full Button
<a href="#" className="px-5 py-2.5 text-xs font-bold text-white bg-[#55acee] hover:bg-[#419de0] rounded-md shadow-sm">
  Connect with Twitter
</a>

// LinkedIn Round Button
<a href="#" className="w-10 h-10 rounded-full bg-[#0077b5] text-white flex items-center justify-center">
  in
</a>

// GitHub Square Button
<a href="#" className="w-10 h-10 rounded-md bg-[#333333] text-white flex items-center justify-center">
  <GithubIcon />
</a>`
                })}
                className="text-xs font-semibold text-[#f96332] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Snippet</span>
              </button>
            </div>

            {/* Social Buttons Matrix (Matches Official Now UI Kit Showcase) */}
            <div className="overflow-x-auto py-2">
              <div className="min-w-[700px] space-y-3.5">
                {/* 1. Twitter */}
                <div className="grid grid-cols-5 items-center gap-4">
                  <div>
                    <button className="px-4 py-2.5 text-xs font-bold text-white bg-[#55acee] hover:bg-[#419de0] rounded-md shadow-sm flex items-center gap-2 cursor-pointer transition-all">
                      <span className="font-bold">🐦</span>
                      <span>Connect with Twitter</span>
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-md bg-[#55acee] hover:bg-[#419de0] text-white flex items-center justify-center shadow-xs cursor-pointer">
                      <span>🐦</span>
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-full bg-[#55acee] hover:bg-[#419de0] text-white flex items-center justify-center shadow-xs cursor-pointer">
                      <span>🐦</span>
                    </button>
                  </div>
                  <div>
                    <button className="p-2 text-[#55acee] hover:opacity-80 cursor-pointer">
                      <span>🐦</span>
                    </button>
                  </div>
                  <div>
                    <button className="text-xs font-semibold text-[#55acee] hover:underline flex items-center gap-1.5 cursor-pointer">
                      <span>🐦</span>
                      <span>Connect with Twitter</span>
                    </button>
                  </div>
                </div>

                {/* 2. Facebook */}
                <div className="grid grid-cols-5 items-center gap-4">
                  <div>
                    <button className="px-4 py-2.5 text-xs font-bold text-white bg-[#3b5998] hover:bg-[#2d4373] rounded-md shadow-sm flex items-center gap-2 cursor-pointer transition-all">
                      <span className="font-bold">f</span>
                      <span>Share · 2.2k</span>
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-md bg-[#3b5998] hover:bg-[#2d4373] text-white flex items-center justify-center shadow-xs cursor-pointer font-bold">
                      f
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-full bg-[#3b5998] hover:bg-[#2d4373] text-white flex items-center justify-center shadow-xs cursor-pointer font-bold">
                      f
                    </button>
                  </div>
                  <div>
                    <button className="p-2 text-[#3b5998] hover:opacity-80 cursor-pointer font-bold">
                      f
                    </button>
                  </div>
                  <div>
                    <button className="text-xs font-semibold text-[#3b5998] hover:underline flex items-center gap-1.5 cursor-pointer">
                      <span className="font-bold">f</span>
                      <span>Share · 2.2k</span>
                    </button>
                  </div>
                </div>

                {/* 3. Google+ */}
                <div className="grid grid-cols-5 items-center gap-4">
                  <div>
                    <button className="px-4 py-2.5 text-xs font-bold text-white bg-[#dd4b39] hover:bg-[#c23321] rounded-md shadow-sm flex items-center gap-2 cursor-pointer transition-all">
                      <span className="font-bold">G</span>
                      <span>Share on Google+</span>
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-md bg-[#dd4b39] hover:bg-[#c23321] text-white flex items-center justify-center shadow-xs cursor-pointer font-bold">
                      G
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-full bg-[#dd4b39] hover:bg-[#c23321] text-white flex items-center justify-center shadow-xs cursor-pointer font-bold">
                      G
                    </button>
                  </div>
                  <div>
                    <button className="p-2 text-[#dd4b39] hover:opacity-80 cursor-pointer font-bold">
                      G
                    </button>
                  </div>
                  <div>
                    <button className="text-xs font-semibold text-[#dd4b39] hover:underline flex items-center gap-1.5 cursor-pointer">
                      <span className="font-bold">G</span>
                      <span>Share on Google+</span>
                    </button>
                  </div>
                </div>

                {/* 4. LinkedIn */}
                <div className="grid grid-cols-5 items-center gap-4">
                  <div>
                    <button className="px-4 py-2.5 text-xs font-bold text-white bg-[#0077b5] hover:bg-[#00669e] rounded-md shadow-sm flex items-center gap-2 cursor-pointer transition-all">
                      <span className="font-bold">in</span>
                      <span>Connect with Linkedin</span>
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-md bg-[#0077b5] hover:bg-[#00669e] text-white flex items-center justify-center shadow-xs cursor-pointer font-bold text-xs">
                      in
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-full bg-[#0077b5] hover:bg-[#00669e] text-white flex items-center justify-center shadow-xs cursor-pointer font-bold text-xs">
                      in
                    </button>
                  </div>
                  <div>
                    <button className="p-2 text-[#0077b5] hover:opacity-80 cursor-pointer font-bold text-xs">
                      in
                    </button>
                  </div>
                  <div>
                    <button className="text-xs font-semibold text-[#0077b5] hover:underline flex items-center gap-1.5 cursor-pointer">
                      <span className="font-bold">in</span>
                      <span>Connect with Linkedin</span>
                    </button>
                  </div>
                </div>

                {/* 5. Pinterest */}
                <div className="grid grid-cols-5 items-center gap-4">
                  <div>
                    <button className="px-4 py-2.5 text-xs font-bold text-white bg-[#cc2127] hover:bg-[#b21b20] rounded-md shadow-sm flex items-center gap-2 cursor-pointer transition-all">
                      <span className="font-bold">P</span>
                      <span>Pint it · 212</span>
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-md bg-[#cc2127] hover:bg-[#b21b20] text-white flex items-center justify-center shadow-xs cursor-pointer font-bold">
                      P
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-full bg-[#cc2127] hover:bg-[#b21b20] text-white flex items-center justify-center shadow-xs cursor-pointer font-bold">
                      P
                    </button>
                  </div>
                  <div>
                    <button className="p-2 text-[#cc2127] hover:opacity-80 cursor-pointer font-bold">
                      P
                    </button>
                  </div>
                  <div>
                    <button className="text-xs font-semibold text-[#cc2127] hover:underline flex items-center gap-1.5 cursor-pointer">
                      <span className="font-bold">P</span>
                      <span>Pint it · 212</span>
                    </button>
                  </div>
                </div>

                {/* 6. YouTube */}
                <div className="grid grid-cols-5 items-center gap-4">
                  <div>
                    <button className="px-4 py-2.5 text-xs font-bold text-white bg-[#e52d27] hover:bg-[#c9221c] rounded-md shadow-sm flex items-center gap-2 cursor-pointer transition-all">
                      <span className="font-bold">▶</span>
                      <span>View on Youtube</span>
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-md bg-[#e52d27] hover:bg-[#c9221c] text-white flex items-center justify-center shadow-xs cursor-pointer font-bold">
                      ▶
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-full bg-[#e52d27] hover:bg-[#c9221c] text-white flex items-center justify-center shadow-xs cursor-pointer font-bold">
                      ▶
                    </button>
                  </div>
                  <div>
                    <button className="p-2 text-[#e52d27] hover:opacity-80 cursor-pointer font-bold">
                      ▶
                    </button>
                  </div>
                  <div>
                    <button className="text-xs font-semibold text-[#e52d27] hover:underline flex items-center gap-1.5 cursor-pointer">
                      <span className="font-bold">▶</span>
                      <span>View on Youtube</span>
                    </button>
                  </div>
                </div>

                {/* 7. Tumblr */}
                <div className="grid grid-cols-5 items-center gap-4">
                  <div>
                    <button className="px-4 py-2.5 text-xs font-bold text-white bg-[#35465c] hover:bg-[#283546] rounded-md shadow-sm flex items-center gap-2 cursor-pointer transition-all">
                      <span className="font-bold font-serif">t</span>
                      <span>Repost</span>
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-md bg-[#35465c] hover:bg-[#283546] text-white flex items-center justify-center shadow-xs cursor-pointer font-serif font-bold">
                      t
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-full bg-[#35465c] hover:bg-[#283546] text-white flex items-center justify-center shadow-xs cursor-pointer font-serif font-bold">
                      t
                    </button>
                  </div>
                  <div>
                    <button className="p-2 text-[#35465c] hover:opacity-80 cursor-pointer font-serif font-bold">
                      t
                    </button>
                  </div>
                  <div>
                    <button className="text-xs font-semibold text-[#35465c] hover:underline flex items-center gap-1.5 cursor-pointer">
                      <span className="font-bold font-serif">t</span>
                      <span>Repost</span>
                    </button>
                  </div>
                </div>

                {/* 8. GitHub */}
                <div className="grid grid-cols-5 items-center gap-4">
                  <div>
                    <button className="px-4 py-2.5 text-xs font-bold text-white bg-[#333333] hover:bg-[#1a1a1a] rounded-md shadow-sm flex items-center gap-2 cursor-pointer transition-all">
                      <span className="font-bold">🐙</span>
                      <span>Connect with Github</span>
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-md bg-[#333333] hover:bg-[#1a1a1a] text-white flex items-center justify-center shadow-xs cursor-pointer">
                      <span>🐙</span>
                    </button>
                  </div>
                  <div>
                    <button className="w-9 h-9 rounded-full bg-[#333333] hover:bg-[#1a1a1a] text-white flex items-center justify-center shadow-xs cursor-pointer">
                      <span>🐙</span>
                    </button>
                  </div>
                  <div>
                    <button className="p-2 text-[#333333] hover:opacity-80 cursor-pointer">
                      <span>🐙</span>
                    </button>
                  </div>
                  <div>
                    <button className="text-xs font-semibold text-[#333333] hover:underline flex items-center gap-1.5 cursor-pointer">
                      <span>🐙</span>
                      <span>Connect with Github</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. INPUTS & FORM CONTROLS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16 pt-8 border-t border-slate-100">
          {/* Left Column: Text Inputs */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
              Inputs & Form Fields
            </h3>

            {/* Standard Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Regular Input</label>
              <input
                type="text"
                placeholder="Regular input..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:border-[#f96332] focus:ring-1 focus:ring-[#f96332] outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Input with Icon Left */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">With Left Icon</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products or docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:border-[#f96332] focus:ring-1 focus:ring-[#f96332] outline-none transition-all placeholder:text-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Success Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Success Input</label>
              <div className="relative">
                <input
                  type="text"
                  defaultValue="valid_username"
                  className="w-full pl-4 pr-10 py-2.5 text-sm bg-white border border-emerald-500 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-emerald-900 transition-all"
                />
                <Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* Danger Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Error Input</label>
              <div className="relative">
                <input
                  type="text"
                  defaultValue="invalid-email@"
                  className="w-full pl-4 pr-10 py-2.5 text-sm bg-white border border-rose-500 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none text-rose-900 transition-all"
                />
                <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Middle Column: Checkboxes & Radios & Switches */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
              Checkboxes & Switches
            </h3>

            {/* Checkboxes */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Custom Checkboxes</span>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div 
                  onClick={() => setCheckbox1(!checkbox1)}
                  className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                    checkbox1 
                      ? 'bg-[#f96332] text-white shadow-now-primary' 
                      : 'border border-slate-300 bg-white hover:border-slate-400'
                  }`}
                >
                  {checkbox1 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-sm font-medium text-slate-700">Subscribe to updates</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div 
                  onClick={() => setCheckbox2(!checkbox2)}
                  className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                    checkbox2 
                      ? 'bg-[#f96332] text-white shadow-now-primary' 
                      : 'border border-slate-300 bg-white hover:border-slate-400'
                  }`}
                >
                  {checkbox2 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-sm font-medium text-slate-700">Send telemetry reports</span>
              </label>

              <label className="flex items-center gap-3 opacity-50 cursor-not-allowed select-none">
                <div className="w-5 h-5 rounded border border-slate-300 bg-slate-100 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-sm font-medium text-slate-500">Disabled checkbox</span>
              </label>
            </div>

            {/* Radio Buttons */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Radio Buttons</span>
              <div className="flex items-center gap-6">
                <label 
                  onClick={() => setRadioValue('option1')}
                  className="flex items-center gap-2.5 cursor-pointer select-none"
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    radioValue === 'option1' ? 'border-[#f96332]' : 'border-slate-300 bg-white'
                  }`}>
                    {radioValue === 'option1' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#f96332]" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700">First Option</span>
                </label>

                <label 
                  onClick={() => setRadioValue('option2')}
                  className="flex items-center gap-2.5 cursor-pointer select-none"
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    radioValue === 'option2' ? 'border-[#f96332]' : 'border-slate-300 bg-white'
                  }`}>
                    {radioValue === 'option2' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#f96332]" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700">Second Option</span>
                </label>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Toggle Switches</span>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSwitch1(!switch1)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      switch1 ? 'bg-[#f96332]' : 'bg-slate-200'
                    }`}
                    role="switch"
                    aria-checked={switch1}
                  >
                    <span
                      className={`inline-block w-5 h-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                        switch1 ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {switch1 ? 'ON' : 'OFF'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSwitch2(!switch2)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      switch2 ? 'bg-[#2ca8ff]' : 'bg-slate-200'
                    }`}
                    role="switch"
                    aria-checked={switch2}
                  >
                    <span
                      className={`inline-block w-5 h-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                        switch2 ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {switch2 ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sliders */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
              Sliders
            </h3>

            {/* Primary Slider */}
            <div className="space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Primary Slider</span>
                <span className="text-xs font-bold text-[#f96332] bg-orange-100/60 px-2 py-0.5 rounded-full tabular-nums">
                  {sliderValue}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#f96332]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Range Slider / Secondary */}
            <div className="space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Range Slider (Info)</span>
                <span className="text-xs font-bold text-[#2ca8ff] bg-blue-100/60 px-2 py-0.5 rounded-full tabular-nums">
                  {sliderRange} pts
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                value={sliderRange}
                onChange={(e) => setSliderRange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2ca8ff]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>10</span>
                <span>80</span>
                <span>150</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
