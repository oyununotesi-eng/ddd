import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MessageCircle, 
  ShieldCheck, 
  Fingerprint, 
  Send, 
  Check, 
  Twitter, 
  Linkedin, 
  Github, 
  Mail, 
  Play,
  Heart
} from 'lucide-react';
import { ASSETS } from '../../data/assets';

interface LandingPageProps {
  onBackToKit: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onBackToKit }) => {
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormName('');
      setFormEmail('');
      setFormMessage('');
    }, 3500);
  };

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

      {/* Hero Section */}
      <div className="relative min-h-[85vh] flex items-center justify-center text-center overflow-hidden">
        <img
          src={ASSETS.projectShowcase}
          alt="Landing Hero Background"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#f96332]/90 via-[#f85116]/85 to-[#2c2c2c]/90 mix-blend-multiply" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-28 text-white">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight mb-6 drop-shadow-md">
            Your story starts with us
          </h1>
          <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Build memorable web applications with pixel-perfect attention to detail, verified typography, and smooth interaction states.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3.5 text-xs font-bold uppercase tracking-wider bg-white text-[#f96332] hover:bg-slate-50 rounded-full shadow-xl transition-all duration-200"
            >
              Get Started
            </button>
            <button
              onClick={() => alert('Demo video preview requested')}
              className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider bg-transparent text-white border-2 border-white/80 hover:bg-white/10 rounded-full transition-all duration-200 flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch Showreel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Pillars: What is Now UI Kit */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f96332] block mb-2">
            Core Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-900">
            What is Now UI Kit?
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            The kit provides a complete foundation for modern websites, SaaS apps, and digital platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {/* Pillar 1 */}
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#f96332] flex items-center justify-center shadow-now-primary mb-2">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wide text-slate-900">
              Free Community Chat
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans max-w-xs">
              Divide details about your product or work into parts. Write a few lines about each one. A paragraph describing a feature will be enough.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-[#2ca8ff] flex items-center justify-center shadow-now-info mb-2">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wide text-slate-900">
              Verified Security
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans max-w-xs">
              Enterprise grade data security protocols with end-to-end token validation and compliance with international standards.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#18ce0f] flex items-center justify-center shadow-now-success mb-2">
              <Fingerprint className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wide text-slate-900">
              Fingerprint Auth
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans max-w-xs">
              Seamless biometric authentication integrations for web applications running on modern mobile and desktop clients.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-slate-50/70 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-[#f96332] block mb-2">
              Talented Makers
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-900">
              Here is our team
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Meet the creators who turn complex product requirements into simple, human experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Member 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-now-raised mb-6">
                <img
                  src={ASSETS.profileAvatar}
                  alt="Ryan Scheinder"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ryan Scheinder</h3>
              <p className="text-xs font-semibold text-[#f96332] uppercase tracking-wider mb-3">
                Lead Designer
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-sans mb-6">
                Specializing in interactive typography, motion systems, and accessible design patterns for high-growth SaaS.
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                <button className="p-2 hover:text-[#f96332] transition-colors"><Twitter className="w-4 h-4" /></button>
                <button className="p-2 hover:text-[#f96332] transition-colors"><Linkedin className="w-4 h-4" /></button>
                <button className="p-2 hover:text-[#f96332] transition-colors"><Github className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Member 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-now-raised mb-6 bg-slate-100">
                <img
                  src={ASSETS.carouselNature}
                  alt="Romina Hadid"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900">Romina Hadid</h3>
              <p className="text-xs font-semibold text-[#2ca8ff] uppercase tracking-wider mb-3">
                Marketing Specialist
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-sans mb-6">
                Focused on global brand partnerships, user retention funnels, and narrative product launches across channels.
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                <button className="p-2 hover:text-[#2ca8ff] transition-colors"><Twitter className="w-4 h-4" /></button>
                <button className="p-2 hover:text-[#2ca8ff] transition-colors"><Linkedin className="w-4 h-4" /></button>
                <button className="p-2 hover:text-[#2ca8ff] transition-colors"><Github className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Member 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-now-raised mb-6 bg-slate-100">
                <img
                  src={ASSETS.heroBg}
                  alt="Alexander Smith"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900">Alexander Smith</h3>
              <p className="text-xs font-semibold text-[#18ce0f] uppercase tracking-wider mb-3">
                Principal Engineer
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-sans mb-6">
                Passionate about performance engineering, resilient microfrontends, and automated CI/CD pipelines.
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                <button className="p-2 hover:text-[#18ce0f] transition-colors"><Twitter className="w-4 h-4" /></button>
                <button className="p-2 hover:text-[#18ce0f] transition-colors"><Linkedin className="w-4 h-4" /></button>
                <button className="p-2 hover:text-[#18ce0f] transition-colors"><Github className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work With Us Contact Section */}
      <section id="contact-form" className="py-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f96332] block mb-2">
            Start A Project
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-900">
            Work with us
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Complete this form and our engineering team will get back to you within 24 hours.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-now-success">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-lg font-bold text-emerald-900">Message Dispatched!</h3>
            <p className="text-xs text-emerald-700 mt-1">
              Thank you {formName}. We have received your inquiry and will reach out to {formEmail}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your First Name..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#f96332] outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Your Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#f96332] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Message</label>
              <textarea
                rows={4}
                required
                placeholder="Type your message here..."
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                className="w-full p-4 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#f96332] outline-none transition-all resize-none"
              />
            </div>

            <div className="text-center pt-2">
              <button
                type="submit"
                className="px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-now-primary transition-all duration-200 inline-flex items-center gap-2 hover:scale-102"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Landing Footer */}
      <footer className="py-12 bg-slate-900 text-white text-center text-xs border-t border-slate-800">
        <p className="text-slate-400">
          © {new Date().getFullYear()} Now UI Kit. Coded with React & Tailwind CSS for Creative Tim.
        </p>
      </footer>
    </div>
  );
};
