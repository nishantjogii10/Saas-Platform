import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  unit,
  change,
  trend = 'up', // up | down | neutral
  icon: Icon,
  accentColor,
  variant = 'default',
  subtext,
  subtitle,
  onClick,
  className = '',
}) => {
  // Map variant or accentColor to standardized theme matching Inventory Items standard
  const resolvedColor = accentColor || (
    variant === 'success' ? 'emerald' :
    variant === 'warning' ? 'amber' :
    variant === 'danger' || variant === 'rose' ? 'rose' :
    variant === 'info' || variant === 'blue' ? 'blue' :
    variant === 'purple' ? 'purple' :
    variant === 'teal' ? 'teal' :
    'slate'
  );

  const COLOR_MAP = {
    slate: {
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      valueColor: 'text-slate-900',
      dotColor: 'bg-slate-400',
      subtextColor: 'text-slate-500',
    },
    emerald: {
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      subtextColor: 'text-emerald-700',
    },
    amber: {
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
      dotColor: 'bg-amber-500',
      subtextColor: 'text-amber-700',
    },
    rose: {
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      valueColor: 'text-rose-700',
      dotColor: 'bg-rose-500',
      subtextColor: 'text-rose-700',
    },
    blue: {
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-700',
      dotColor: 'bg-blue-500',
      subtextColor: 'text-blue-700',
    },
    purple: {
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-700',
      dotColor: 'bg-purple-500',
      subtextColor: 'text-purple-700',
    },
    teal: {
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      valueColor: 'text-teal-700',
      dotColor: 'bg-teal-500',
      subtextColor: 'text-teal-700',
    },
  };

  const style = COLOR_MAP[resolvedColor] || COLOR_MAP.slate;
  const displayText = subtext || subtitle;

  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 truncate mr-2">{title}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
        <span className={`text-2xl font-bold tracking-tight ${style.valueColor}`}>{value}</span>
        {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
        {change !== undefined && (
          <span
            className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full border ml-1 ${
              trend === 'up'
                ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                : trend === 'down'
                ? 'text-rose-800 bg-rose-50 border-rose-200'
                : 'text-slate-600 bg-slate-100 border-slate-200'
            }`}
          >
            {trend === 'up' && <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline shrink-0" />}
            {trend === 'down' && <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline shrink-0" />}
            {trend === 'neutral' && <Minus className="w-2.5 h-2.5 mr-0.5 inline shrink-0" />}
            {change}
          </span>
        )}
      </div>

      {displayText && (
        <div className="mt-2 text-xs flex items-center gap-1.5 truncate">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotColor}`} />
          <span className={`text-[11px] font-medium truncate ${style.subtextColor}`}>{displayText}</span>
        </div>
      )}
    </div>
  );
};
