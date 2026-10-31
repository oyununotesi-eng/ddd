import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Check, Sparkles, ExternalLink } from 'lucide-react';
import { ASSETS } from '../../data/assets';

interface LoginPageProps {
  onBackToKit: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToKit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 4000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
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

      {/* Background Image */}
      <img
        src={ASSETS.heroBg}
        alt="Login Background"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Signature Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-[#f96332]/80 to-[#ffb236]/70 mix-blend-multiply" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20 animate-in zoom-in-95 duration-200">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#f96332] text-white flex items-center justify-center font-black text-xl shadow-now-primary">
            N
          </div>
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
            Sign In to Now UI
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Access your templates and workspace
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => alert('Social sign-in with Twitter initialized')}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-[#f96332] flex items-center justify-center text-slate-600 hover:text-[#f96332] transition-colors"
            aria-label="Sign in with Twitter"
          >
            <span className="font-bold text-xs">𝕏</span>
          </button>
          <button
            type="button"
            onClick={() => alert('Social sign-in with Google initialized')}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-[#f96332] flex items-center justify-center text-slate-600 hover:text-[#f96332] transition-colors"
            aria-label="Sign in with Google"
          >
            <span className="font-bold text-xs">G</span>
          </button>
          <button
            type="button"
            onClick={() => alert('Social sign-in with GitHub initialized')}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-[#f96332] flex items-center justify-center text-slate-600 hover:text-[#f96332] transition-colors"
            aria-label="Sign in with GitHub"
          >
            <span className="font-bold text-xs">gh</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 absolute">
            or with email
          </span>
        </div>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-in zoom-in-95">
            <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-emerald-900">Signed In Successfully!</h4>
            <p className="text-xs text-emerald-700 mt-1">Welcome back, {name || 'Designer'}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="relative">
              <input
                type="text"
                required
                placeholder="First Name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-[#f96332] outline-none transition-all placeholder:text-slate-400"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Email Address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-[#f96332] outline-none transition-all placeholder:text-slate-400"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-now-primary transition-all duration-200 hover:scale-101 active:scale-98"
            >
              Get Started
            </button>
          </form>
        )}

        {/* Footer links */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <button
            onClick={() => alert('Account registration flow')}
            className="hover:text-[#f96332] transition-colors"
          >
            Create Account
          </button>
          <button
            onClick={() => alert('Password reset link sent')}
            className="hover:text-[#f96332] transition-colors"
          >
            Need Help?
          </button>
        </div>
      </div>
    </div>
  );
};
