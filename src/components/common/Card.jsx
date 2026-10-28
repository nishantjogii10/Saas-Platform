import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#DCE5EF] rounded-2xl shadow-xs overflow-hidden transition-all duration-200 ${
        hover ? 'hover:shadow-md hover:border-[#087F8C]/40 cursor-pointer' : ''
      } ${padding ? 'p-5 sm:p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  title,
  subtitle,
  action,
  icon: Icon,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#DCE5EF] ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-[#E6F3F0] text-[#075E4B] flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

