import React from 'react';

const VARIANTS = {
  primary: 'bg-[#075E4B] hover:bg-[#054638] text-white shadow-xs focus:ring-[#075E4B]/30',
  secondary: 'bg-[#F7F9FC] hover:bg-slate-200 text-slate-800 border border-[#DCE5EF] focus:ring-[#087F8C]/30',
  outline: 'border border-[#DCE5EF] hover:bg-[#F7F9FC] text-slate-700 focus:ring-[#075E4B]/20',
  danger: 'bg-[#DC2626] hover:bg-red-700 text-white shadow-xs focus:ring-[#DC2626]/30',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200',
  brand: 'bg-[#075E4B] hover:bg-[#054638] text-white shadow-xs focus:ring-[#075E4B]/30',
  teal: 'bg-[#087F8C] hover:bg-[#066772] text-white shadow-xs focus:ring-[#087F8C]/30',
  success: 'bg-[#15803D] hover:bg-green-800 text-white shadow-xs focus:ring-[#15803D]/30',
  warning: 'bg-[#D97706] hover:bg-amber-700 text-white shadow-xs focus:ring-[#D97706]/30',
};

const SIZES = {
  xs: 'text-xs px-2.5 py-1 rounded-md gap-1.5',
  sm: 'text-xs font-medium px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm font-medium px-4 py-2 rounded-lg gap-2',
  lg: 'text-base font-medium px-5 py-2.5 rounded-xl gap-2.5',
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
      className={`inline-flex items-center justify-center transition-all duration-150 select-none font-medium outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
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

