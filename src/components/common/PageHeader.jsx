import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  badge,
  actions,
  breadcrumbs = [],
  className = '',
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-emerald-700 transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className={idx === breadcrumbs.length - 1 ? 'text-slate-600' : ''}>
                  {crumb.label}
                </span>
              )}
              {idx < breadcrumbs.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {actions && <div className="flex items-center flex-wrap gap-2.5">{actions}</div>}
      </div>
    </div>
  );
};

