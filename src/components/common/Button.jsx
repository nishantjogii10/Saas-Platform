import React from 'react';

const VARIANTS = {
  primary: 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs hover:shadow-sm focus-visible:ring-emerald-500/40 active:scale-[0.98]',
  secondary: 'bg-slate-100/90 hover:bg-slate-200 text-slate-800 focus-visible:ring-slate-300 active:scale-[0.98]',
  outline: 'border border-slate-200/90 hover:border-slate-300 bg-white/80 hover:bg-white text-slate-700 shadow-2xs hover:shadow-xs focus-visible:ring-slate-200 active:scale-[0.98]',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:ring-rose-500/40 active:scale-[0.98]',
  ghost: 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:ring-slate-200 active:scale-[0.98]',
  brand: 'bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white shadow-sm hover:shadow-md focus-visible:ring-emerald-500/40 active:scale-[0.98]',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus-visible:ring-emerald-500/40 active:scale-[0.98]',
};

const SIZES = {
  xs: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-semibold',
  sm: 'text-xs font-semibold px-3 py-1.5 rounded-xl gap-1.5',
  md: 'text-sm font-semibold px-4 py-2 rounded-xl gap-2',
  lg: 'text-base font-semibold px-5 py-2.5 rounded-xl gap-2.5',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none outline-hidden focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={size === 'xs' ? 'w-3.5 h-3.5' : size === 'sm' ? 'w-4 h-4' : 'w-4.5 h-4.5'} />
      ) : null}
      {children}
      {IconRight && !loading && (
        <IconRight className={size === 'xs' ? 'w-3.5 h-3.5' : size === 'sm' ? 'w-4 h-4' : 'w-4.5 h-4.5'} />
      )}
    </button>
  );
};
