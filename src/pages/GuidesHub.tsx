import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Heart, ShieldCheck } from 'lucide-react';

export const guidesData = [
  {
    slug: 'old-vs-new-regime',
    title: 'Old vs New Tax Regime in India (FY 2025-26) — Which Should You Choose?',
    description: 'Union Budget 2025 introduced major adjustments to India\'s tax structures. Learn which tax regime fits your income levels and how standard deductions, rebates, and slabs stack up.',
    readTime: '6 min read',
    category: 'India Taxation',
    date: 'Feb 2025',
  },
  {
    slug: 'understanding-us-paycheck-withholding',
    title: 'How Federal Withholding Slabs Impact Your Biweekly Take-Home Pay',
    description: 'Understand filing exemptions, standard deductions, and FICA wage caps. Explore how the IRS maps paycheck withholding rates from your Form W-4 details.',
    readTime: '5 min read',
    category: 'US Taxation',
    date: 'Jan 2026',
  },
  {
    slug: 'india-vda-crypto-taxation',
    title: 'Navigating Virtual Digital Assets (VDA) Surcharge Rules in India',
    description: 'Under Section 115BBH, virtual digital assets (cryptocurrency and NFTs) are taxed at a flat 30%. Understand the loss offsets and surcharge calculation guidelines.',
    readTime: '4 min read',
    category: 'Crypto Assets',
    date: 'Dec 2025',
  }
];

export default function GuidesHub() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4" id="guides_hub_page">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-100/50 uppercase tracking-widest">
          <BookOpen size={12} />
          Tax Learning Library
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          Tax Education Guides
        </h1>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Our editorial guides break down complex national tax statutes, withholding rules, and filing compliance structures into straightforward worked-out numeric examples.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {guidesData.map((guide) => (
          <Link
            key={guide.slug}
            to={`/guides/${guide.slug}`}
            className="group block bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all duration-300"
            id={`guide_link_${guide.slug}`}
          >
            <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-3">
              <span>{guide.category}</span>
              <span className="flex items-center gap-1 text-slate-400 normal-case font-medium">
                <Clock size={11} /> {guide.readTime}
              </span>
            </div>
            <h2 className="font-extrabold text-sm text-slate-850 dark:text-white group-hover:text-blue-500 transition-colors mb-2 line-clamp-2 leading-snug">
              {guide.title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
              {guide.description}
            </p>
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-500 mt-2">
              <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Read Complete Guide <ArrowRight size={12} />
              </span>
              <span className="text-[10px] text-gray-400 font-medium">{guide.date}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
