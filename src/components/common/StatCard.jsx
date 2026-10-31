import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  change,
  trend = 'up', // up | down | neutral
  icon: Icon,
  accentColor = 'emerald', // emerald | amber | rose | blue | purple | teal
  subtext,
  onClick,
  className = '',
}) => {
  const COLOR_MAP = {
    emerald: {
      bg: 'bg-emerald-50/90',
      text: 'text-emerald-700',
      border: 'border-emerald-200/80',
      glow: 'group-hover:border-emerald-300/90 group-hover:shadow-emerald-500/10',
    },
    amber: {
      bg: 'bg-amber-50/90',
      text: 'text-amber-700',
      border: 'border-amber-200/80',
      glow: 'group-hover:border-amber-300/90 group-hover:shadow-amber-500/10',
    },
    rose: {
      bg: 'bg-rose-50/90',
      text: 'text-rose-700',
      border: 'border-rose-200/80',
      glow: 'group-hover:border-rose-300/90 group-hover:shadow-rose-500/10',
    },
    blue: {
      bg: 'bg-blue-50/90',
      text: 'text-blue-700',
      border: 'border-blue-200/80',
      glow: 'group-hover:border-blue-300/90 group-hover:shadow-blue-500/10',
    },
    purple: {
      bg: 'bg-purple-50/90',
      text: 'text-purple-700',
      border: 'border-purple-200/80',
      glow: 'group-hover:border-purple-300/90 group-hover:shadow-purple-500/10',
    },
    teal: {
      bg: 'bg-teal-50/90',
      text: 'text-teal-700',
      border: 'border-teal-200/80',
      glow: 'group-hover:border-teal-300/90 group-hover:shadow-teal-500/10',
    },
  };

  const style = COLOR_MAP[accentColor] || COLOR_MAP.emerald;

  return (
    <div
      onClick={onClick}
      className={`group glass-panel rounded-2xl p-5 sm:p-5.5 transition-all duration-200 ${
        onClick ? 'cursor-pointer glass-panel-hover ' + style.glow : 'hover:border-slate-300/80'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900">{value}</span>
            {change !== undefined && (
              <span
                className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                  trend === 'up'
                    ? 'text-emerald-800 bg-emerald-50/90 border-emerald-200'
                    : trend === 'down'
                    ? 'text-rose-800 bg-rose-50/90 border-rose-200'
                    : 'text-slate-600 bg-slate-100/90 border-slate-200'
                }`}
              >
                {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1 inline shrink-0" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3 mr-1 inline shrink-0" />}
                {trend === 'neutral' && <Minus className="w-3 h-3 mr-1 inline shrink-0" />}
                {change}
              </span>
            )}
          </div>
          {subtext && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{subtext}</p>}
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs transition-transform group-hover:scale-105 duration-200 ${style.bg} ${style.text} ${style.border}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
