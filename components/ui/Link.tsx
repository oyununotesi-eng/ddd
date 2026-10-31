import React from 'react';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'style'> {
  size?: 'sm' | 'md' | 'lg';
  style?: 'primary' | 'outline' | 'secondary' | 'ghost' | string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({
  size = 'md',
  style = 'primary',
  className = '',
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-5 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm font-bold',
  }[size] || 'px-6 py-2.5 text-sm font-bold';

  const styleClasses = typeof style === 'string' && {
    primary: 'bg-black text-white hover:bg-neutral-800 shadow-sm active:scale-95',
    outline: 'bg-white border-2 border-black text-black hover:bg-slate-100 shadow-xs active:scale-95',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95',
    ghost: 'bg-transparent text-slate-800 hover:bg-slate-100 active:scale-95',
  }[style] || 'bg-black text-white hover:bg-neutral-800';

  return (
    <a
      className={`inline-flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${sizeClasses} ${styleClasses} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};

export default Link;
