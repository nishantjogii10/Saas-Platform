import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEME_MODES } from '../../context/ThemeContext';
import { Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react';

export const ThemeToggle = ({
  variant = 'dropdown', // 'dropdown' | 'segmented' | 'compact'
  className = '',
  align = 'right',
}) => {
  const { mode, effectiveTheme, setMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const getModeIcon = (modeId, iconClass = 'w-4 h-4') => {
    switch (modeId) {
      case 'light':
        return <Sun className={`${iconClass} text-amber-500`} />;
      case 'dark':
        return <Moon className={`${iconClass} text-emerald-400`} />;
      case 'system':
      default:
        return <Monitor className={`${iconClass} text-indigo-400`} />;
    }
  };

  const getActiveDisplayLabel = () => {
    if (mode === 'system') {
      return `System (${effectiveTheme === 'dark' ? 'Dark' : 'Light'})`;
    }
    return mode === 'dark' ? 'Dark' : 'Light';
  };

  // 1. Compact Button Variant
  if (variant === 'compact') {
    const cycleMode = () => {
      if (mode === 'light') setMode('dark');
      else if (mode === 'dark') setMode('system');
      else setMode('light');
    };

    return (
      <button
        type="button"
        onClick={cycleMode}
        className={`p-2 rounded-xl transition-all duration-200 border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/50 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs flex items-center justify-center ${className}`}
        title={`Theme: ${getActiveDisplayLabel()} (Click to cycle Light / Dark / System)`}
        aria-label="Toggle Theme Appearance"
      >
        {getModeIcon(mode, 'w-4 h-4')}
      </button>
    );
  }

  // 2. Segmented 3-Button Control (For Profile Menu & Settings)
  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 w-full justify-between gap-1 ${className}`}
        role="radiogroup"
        aria-label="Theme Selection"
      >
        {THEME_MODES.map((item) => {
          const isActive = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              role="radio"
              aria-checked={isActive}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold border border-slate-200/60 dark:border-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              }`}
              title={item.description}
            >
              {getModeIcon(item.id, 'w-3.5 h-3.5')}
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 3. Dropdown Menu Variant (For Top Navigation Bar)
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/40 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-all duration-150 group"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Change Appearance Mode (Light / Dark / System)"
      >
        <div className="flex items-center gap-1.5">
          {getModeIcon(mode, 'w-3.5 h-3.5')}
          <span className="hidden sm:inline font-bold tracking-tight">
            {getActiveDisplayLabel()}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-64 rounded-2xl glass-dropdown z-50 py-2 shadow-2xl border border-slate-200/90 dark:border-white/15 animate-scale-in`}
          role="menu"
        >
          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Appearance
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              Saved per user
            </span>
          </div>

          <div className="p-1.5 space-y-1">
            {THEME_MODES.map((item) => {
              const isActive = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMode(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30'
                      : 'hover:bg-slate-100/80 dark:hover:bg-white/5 border border-transparent'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 shadow-2xs">
                      {getModeIcon(item.id, 'w-4 h-4')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold ${
                            isActive
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.id === 'system' && (
                          <span className="text-[9px] font-semibold px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Auto
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-3.5 pt-2 pb-1 border-t border-slate-100 dark:border-white/10 text-[10px] text-slate-400 text-center">
            Restored automatically across sessions
          </div>
        </div>
      )}
    </div>
  );
};
