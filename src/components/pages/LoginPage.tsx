import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { UserSession } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      // Validate credentials: Admin / Admin1981***
      if (username.trim().toLowerCase() === 'admin' && password === 'Admin1981***') {
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess({
            username: 'Admin',
            fullName: 'Murat Karahaliloğlu (Admin)',
            role: 'Admin',
            email: 'admin@workspace.internal',
            isLoggedIn: true,
          });
        }, 1000);
      } else {
        setIsLoading(false);
        setErrorMessage('Geçersiz kullanıcı adı veya şifre!');
      }
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Background Image with IT Datacenter Infrastructure & Now UI Kit Signature Orange Filter */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center z-0"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=80')` 
        }}
      >
        {/* Subtle Tech Cyber Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
        {/* Now UI Kit Signature Orange Clear Filter Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#120a05]/90 via-[#f96332]/85 to-[#ffb236]/75 mix-blend-multiply" />
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />
      </div>

      {/* Floating Header Navbar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-white/15 hover:bg-white/25 rounded-full backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          <span>Back to Workspace</span>
        </button>

        <div className="text-right">
          <span className="text-sm font-extrabold text-white tracking-wider uppercase block">
            Murat Krhl's
          </span>
          <span className="text-[10px] text-white/70 uppercase tracking-widest block">
            Enterprise Portal
          </span>
        </div>
      </header>

      {/* Main Login Card Center Container */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-8 sm:p-10 border border-white/40 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Card Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              Murat Krhl's Workspace
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Hoş geldin
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success State */}
          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Giriş Başarılı!</h3>
              <p className="text-xs text-slate-500">
                Hoş geldiniz, Admin. Yönetim konsoluna aktarılıyorsunuz...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 ml-3">
                  Kullanıcı Adı
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Kullanıcı Adı"
                    className="w-full pl-11 pr-4 py-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-[#f96332] focus:ring-2 focus:ring-[#f96332]/20 outline-none transition-all placeholder:text-slate-400 text-slate-800"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 ml-3">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifre"
                    className="w-full pl-11 pr-11 py-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-[#f96332] focus:ring-2 focus:ring-[#f96332]/20 outline-none transition-all placeholder:text-slate-400 text-slate-800"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-3.5 top-3 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button (Now UI Kit Primary Round Button) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#f96332] via-[#fb7740] to-[#ea4c10] hover:from-[#e04e20] hover:to-[#c83c0c] rounded-full shadow-now-primary hover:shadow-[0_12px_24px_-4px_rgba(249,99,50,0.6)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Doğrulanıyor...</span>
                  </>
                ) : (
                  <span>Giriş Yap (Get Started)</span>
                )}
              </button>
            </form>
          )}

          {/* NOTE: 'Create Account' and 'Need Help?' links are intentionally omitted as requested */}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-white/70">
        <p>©2026 Murat Krhl's Workspace</p>
      </footer>
    </div>
  );
};
