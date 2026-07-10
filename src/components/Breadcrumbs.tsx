import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/') {
    return null; // hide on homepage
  }

  const formatLabel = (p: string) => {
    return p
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className="flex items-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500" aria-label="Breadcrumb" id="dynamic_breadcrumbs">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-blue-500 transition-colors"
        title="Home Dashboard"
      >
        <Home size={11} />
        <span>Home</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={to}>
            <ChevronRight size={11} className="text-slate-300 dark:text-slate-700" />
            {isLast ? (
              <span className="text-slate-750 dark:text-slate-350 select-none">
                {formatLabel(value)}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-blue-500 transition-colors"
              >
                {formatLabel(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
