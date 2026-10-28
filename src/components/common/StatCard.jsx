import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  change,
  trend = 'up', // up | down | neutral
  icon: Icon,
  accentColor = 'emerald', // emerald | amber | rose | blue | purple
  subtext,
  onClick,
  className = '',
}) => {
  const COLOR_MAP = {
    emerald: {
      bg: 'bg-[#E6F3F0]',
      text: 'text-[#075E4B]',
      border: 'border-[#C2E5D9]',
      glow: 'group-hover:border-[#075E4B]/40',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-[#D97706]',
      border: 'border-amber-200',
      glow: 'group-hover:border-[#D97706]/40',
    },
    rose: {
      bg: 'bg-red-50',
      text: 'text-[#DC2626]',
      border: 'border-red-200',
      glow: 'group-hover:border-[#DC2626]/40',
    },
    teal: {
      bg: 'bg-[#E6F8FA]',
      text: 'text-[#087F8C]',
      border: 'border-[#BCECF4]',
      glow: 'group-hover:border-[#087F8C]/40',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      glow: 'group-hover:border-blue-300',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      glow: 'group-hover:border-purple-300',
    },
  };

  const style = COLOR_MAP[accentColor] || COLOR_MAP.emerald;

  return (
    <div
      onClick={onClick}
      className={`group bg-white border border-[#DCE5EF] rounded-2xl p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + style.glow : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
            {change !== undefined && (
              <span
                className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                  trend === 'up'
                    ? 'text-[#15803D] bg-green-50'
                    : trend === 'down'
                    ? 'text-[#DC2626] bg-red-50'
                    : 'text-slate-600 bg-slate-100'
                }`}
              >
                {trend === 'up' && <TrendingUp className="w-3 h-3 mr-0.5 inline" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
                {trend === 'neutral' && <Minus className="w-3 h-3 mr-0.5 inline" />}
                {change}
              </span>
            )}
          </div>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${style.bg} ${style.text} ${style.border}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

