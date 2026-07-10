import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4" id="not_found_page">
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 rounded-full border border-amber-100 dark:border-amber-950/30">
        <ShieldAlert size={36} />
      </div>
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm">
        The tax simulator route or educational policy guide you are looking for does not exist, or has been moved under active budget updates.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/10"
        id="not_found_back_home"
      >
        <ArrowLeft size={14} />
        Return to Home Dashboard
      </Link>
    </div>
  );
}
