import React from 'react';

export const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  className = '',
  rows = 3,
  options = [], // for select type
  ...props
}) => {
  const isSelect = type === 'select';
  const isTextarea = type === 'textarea';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {isSelect ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`w-full rounded-xl border bg-white/80 hover:bg-white focus:bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 transition-all duration-150 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400 ${
              Icon ? 'pl-10' : ''
            } ${error ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300/90 focus:border-emerald-600'}`}
            {...props}
          >
            {options.map((opt, idx) => (
              <option key={idx} value={typeof opt === 'object' ? opt.value : opt}>
                {typeof opt === 'object' ? opt.label : opt}
              </option>
            ))}
          </select>
        ) : isTextarea ? (
          <textarea
            id={name}
            name={name}
            rows={rows}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            className={`w-full rounded-xl border bg-white/80 hover:bg-white focus:bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-all duration-150 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400 ${
              Icon ? 'pl-10' : ''
            } ${error ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300/90 focus:border-emerald-600'}`}
            {...props}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            className={`w-full rounded-xl border bg-white/80 hover:bg-white focus:bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-all duration-150 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400 ${
              Icon ? 'pl-10' : ''
            } ${error ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300/90 focus:border-emerald-600'}`}
            {...props}
          />
        )}
      </div>

      {error && <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
