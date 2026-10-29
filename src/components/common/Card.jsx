import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = true,
  glass = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`${
        glass ? 'glass-panel' : 'bg-white border border-slate-200/90 shadow-xs'
      } rounded-2xl overflow-hidden transition-all duration-200 ${
        hover ? 'glass-panel-hover cursor-pointer' : ''
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
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100/80 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h3 className="font-bold text-slate-900 text-base tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};
