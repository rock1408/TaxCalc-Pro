import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { guidesData } from './GuidesHub';

export default function GuideArticle() {
  const { slug } = useParams<{ slug: string }>();

  if (slug === 'old-vs-new-regime') {
    return (
      <article className="max-w-3xl mx-auto space-y-8 py-4 text-slate-800 dark:text-slate-300 leading-relaxed" id="guide_article_old_new">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link to="/guides" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors">
              <ArrowLeft size={13} /> Back to Guides Hub
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Old vs New Tax Regime in India (FY 2025-26) — Complete Comparison & Slabs Analysis
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1"><Calendar size={13} /> Updated February 2025</span>
            <span className="flex items-center gap-1"><User size={13} /> TaxCalc Pro Editorial</span>
            <span className="flex items-center gap-1"><Clock size={13} /> 6 min read</span>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-850 pt-6 space-y-4 text-xs sm:text-sm">
          <p>
            The Union Budget 2025 presented substantial modifications to India’s income tax structure under Section 115BAC, commonly referred to as the <strong>New Tax Regime</strong>. With these updates taking full effect for the Financial Year (FY) 2025-26 (Assessment Year 2026-27), salaried employees are facing a vital financial question: <em>Should you opt for the Old Regime and claim exemptions, or switch to the New Regime?</em>
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">1. Key Changes Introduced in FY 2025-26</h2>
          <p>
            Under FY 2025-26 tax adjustments, the Government of India has significantly enhanced the attractiveness of the New Tax Regime through several specific measures:
          </p>
          <ul className="list-disc pl-5 space-y-2.5">
            <li><strong>Standard Deduction Increase:</strong> The standard deduction for salaried individuals under the New Regime was raised to <strong>₹75,000</strong> (from ₹50,000), while remaining capped at <strong>₹50,000</strong> under the Old Regime.</li>
            <li><strong>Slab Boundaries Widened:</strong> Slabs are now spaced at ₹4 Lakh intervals (0% up to ₹4L, 5% up to ₹8L, 10% up to ₹12L, etc.), creating larger individual tax slabs.</li>
            <li><strong>Section 87A Rebate Cap:</strong> The 87A rebate limit under the New Regime was maintained up to <strong>₹12 Lakhs</strong> of taxable income, providing 100% tax relief (max ₹60,000 rebate) for taxpayers below this threshold, supplemented by a marginal relief mechanism.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">2. Side-by-Side Slab Rates (FY 2025-26)</h2>
          <div className="overflow-x-auto border border-gray-150 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-150 dark:border-slate-850 text-slate-500 font-bold">
                  <th className="p-3">Slab Ranges (New Regime)</th>
                  <th className="p-3">Rate (New)</th>
                  <th className="p-3">Slab Ranges (Old Regime)</th>
                  <th className="p-3">Rate (Old)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
                <tr>
                  <td className="p-3">₹0 to ₹4,00,000</td>
                  <td className="p-3 text-green-600 font-bold">0% (Nil)</td>
                  <td className="p-3">₹0 to ₹2,50,000</td>
                  <td className="p-3 text-green-600 font-bold">0% (Nil)</td>
                </tr>
                <tr>
                  <td className="p-3">₹4,00,001 to ₹8,00,000</td>
                  <td className="p-3 text-blue-500">5%</td>
                  <td className="p-3">₹2,50,001 to ₹5,00,000</td>
                  <td className="p-3 text-blue-500">5%</td>
                </tr>
                <tr>
                  <td className="p-3">₹8,00,001 to ₹12,00,000</td>
                  <td className="p-3 text-blue-500">10%</td>
                  <td className="p-3">₹5,00,001 to ₹10,00,000</td>
                  <td className="p-3 text-blue-500">20%</td>
                </tr>
                <tr>
                  <td className="p-3">₹12,00,001 to ₹16,00,000</td>
                  <td className="p-3 text-blue-500">15%</td>
                  <td className="p-3">Above ₹10,00,000</td>
                  <td className="p-3 text-blue-500">30%</td>
                </tr>
                <tr>
                  <td className="p-3">₹16,00,001 to ₹20,00,000</td>
                  <td className="p-3 text-blue-500">20%</td>
                  <td className="p-3">-</td>
                  <td className="p-3">-</td>
                </tr>
                <tr>
                  <td className="p-3">₹20,00,001 to ₹24,00,000</td>
                  <td className="p-3 text-blue-500">25%</td>
                  <td className="p-3">-</td>
                  <td className="p-3">-</td>
                </tr>
                <tr>
                  <td className="p-3">Above ₹24,00,000</td>
                  <td className="p-3 text-blue-500">30%</td>
                  <td className="p-3">-</td>
                  <td className="p-3">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">3. Worked Numeric Case Studies</h2>
          
          <div className="space-y-4">
            {/* Case Study 1 */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-500 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full">Case Study A</span>
              <h3 className="font-bold text-slate-950 dark:text-white text-xs sm:text-sm">Income: ₹15,00,000 (Salaried)</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Let\'s assume a salaried individual earning ₹15 Lakhs annual gross. Under the Old Regime, they claim typical deductions of ₹1.5 Lakhs (Section 80C) and ₹50,000 (Section 80D), plus the standard deduction of ₹50,000, reducing taxable income to ₹12.5 Lakhs.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
                <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-gray-100 dark:border-slate-900">
                  <p className="font-bold text-red-500">Old Regime Tax:</p>
                  <p className="text-slate-800 dark:text-white">Taxable: ₹12,50,000</p>
                  <p className="font-extrabold">Final Tax: ₹1,95,000</p>
                  <p className="text-[10px] text-gray-400 font-medium">(Plus 4% cess = ₹2,02,800)</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-gray-100 dark:border-slate-900">
                  <p className="font-bold text-green-500">New Regime Tax:</p>
                  <p className="text-slate-800 dark:text-white">Taxable: ₹14,25,000</p>
                  <p className="font-extrabold">Final Tax: ₹1,13,750</p>
                  <p className="text-[10px] text-gray-400 font-medium">(Plus 4% cess = ₹1,18,300)</p>
                </div>
              </div>
              <p className="text-xs font-bold text-green-600 dark:text-green-400 pt-1">
                Savings choosing New Regime: ₹84,500!
              </p>
            </div>

            {/* Case Study 2 */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-500 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full">Case Study B</span>
              <h3 className="font-bold text-slate-950 dark:text-white text-xs sm:text-sm">Income: ₹25,00,000 (Salaried)</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                With a higher bracket gross of ₹25 Lakhs, Old Regime deductions must exceed ₹4,25,000 (such as home loan interest, HRA exemptions, and Section 80C) to break even with the New Regime.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
                <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-gray-100 dark:border-slate-900">
                  <p className="font-bold text-red-500">Old Regime Tax (Standard Decs):</p>
                  <p className="font-extrabold">Tax: ₹5,07,000</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-gray-100 dark:border-slate-900">
                  <p className="font-bold text-green-500">New Regime Tax:</p>
                  <p className="font-extrabold">Tax: ₹3,97,800</p>
                </div>
              </div>
              <p className="text-xs font-bold text-green-600 dark:text-green-400 pt-1">
                Savings choosing New Regime: ₹1,09,200!
              </p>
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">4. Final Decision Rule of Thumb</h2>
          <p>
            As a broad rule of thumb, if your total itemized deductions (under Section 80C, 80D, Section 24b home loan interest, and HRA) are less than <strong>₹3,75,000</strong> annually, you will almost always pay significantly less tax under the <strong>New Tax Regime</strong>.
          </p>
        </div>
      </article>
    );
  }

  // Handle fallback or other articles
  const currentGuide = guidesData.find(g => g.slug === slug) || guidesData[0];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 text-slate-800 dark:text-slate-300 leading-relaxed" id="guide_article_fallback">
      <div className="space-y-4">
        <Link to="/guides" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={13} /> Back to Guides Hub
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          {currentGuide.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-medium">
          <span className="flex items-center gap-1"><Calendar size={13} /> Updated January 2026</span>
          <span className="flex items-center gap-1"><User size={13} /> TaxCalc Pro Editorial</span>
          <span className="flex items-center gap-1"><Clock size={13} /> {currentGuide.readTime}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-slate-850 pt-6 space-y-4 text-xs sm:text-sm">
        <p className="font-medium text-slate-700 dark:text-slate-350 italic">
          "{currentGuide.description}"
        </p>
        
        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-2">Comprehensive Policy Overview</h2>
        <p>
          Managing tax optimization strategies requires a concrete understanding of local and national schedules. Under progressive taxation models, every earned block of money is mapped directly into dedicated slabs, each taxed at incremental percentages.
        </p>

        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100/30 text-xs text-blue-800 dark:text-blue-400 space-y-1">
          <p className="font-bold">Key Filing Principle:</p>
          <p>Always align your standard deduction caps, investment pools (like Roth accounts or PPF options), and standard exemptions to avoid paying penalty tax rates.</p>
        </div>

        <p>
          Tax regulations require consistent tracking. Use our built-in interactive simulator tables to evaluate your custom earnings models safely and export your results to PDF files.
        </p>
      </div>
    </div>
  );
}
export { guidesData };
