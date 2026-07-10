import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, Globe, Percent, DollarSign, Wallet, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="space-y-12 py-4" id="home_page_container">
      {/* Hero Banner Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto px-4" id="home_hero">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full border border-blue-100/50 dark:border-blue-900/30 uppercase tracking-widest"
        >
          <Globe size={12} />
          Dual-Country Tax Simulation Hub
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none"
        >
          Plan Your Salary, Optimize Your <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Tax Strategy</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-sm sm:text-base text-gray-500 dark:text-slate-400 max-w-xl mx-auto"
        >
          Secure, client-side, and highly accurate estimates for paycheck withholding, income tax slabs, cryptocurrency reporting, and allowances in India & the United States.
        </motion.p>
      </section>

      {/* Grid of Calculators */}
      <section className="space-y-6" id="home_calculators_grid_section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-900 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calculator size={18} className="text-blue-500" />
              Tax Estimation Tools
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Select any module to compute accurate estimates based on current laws.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* India Main Income */}
          <Link
            to="/india"
            className="group block bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
            id="link_india_tax"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                <span className="font-extrabold text-sm">₹</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 bg-blue-50/50 dark:bg-blue-950/30 px-2.5 py-0.5 rounded-full">FY 2025-26</span>
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors mb-1">
              India Income Tax
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-4">
              Compare the progressive Old Regime versus the new slab structures under Section 115BAC. Estimate TDS and marginal relief.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-500 group-hover:translate-x-1 transition-transform">
              Launch Calculator <ArrowRight size={12} />
            </span>
          </Link>

          {/* USA Main Income */}
          <Link
            to="/usa"
            className="group block bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
            id="link_usa_tax"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <DollarSign size={16} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 px-2.5 py-0.5 rounded-full">Tax Year 2026</span>
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors mb-1">
              USA Federal Income Tax
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-4">
              Determine AGI, standard/itemized deductions, Child Tax Credits, SE tax, and state-level approximations.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-500 group-hover:translate-x-1 transition-transform">
              Launch Calculator <ArrowRight size={12} />
            </span>
          </Link>

          {/* US Paycheck Calculator */}
          <Link
            to="/usa/paycheck-calculator"
            className="group block bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
            id="link_usa_paycheck"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Wallet size={16} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-full">Paycheck</span>
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors mb-1">
              USA Paycheck Estimator
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-4">
              Evaluate FICA Social Security base caps, Medicare surcharges, federal withholding taxes, and state taxes dynamically.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 group-hover:translate-x-1 transition-transform">
              Launch Calculator <ArrowRight size={12} />
            </span>
          </Link>

          {/* India HRA Exemption */}
          <Link
            to="/india/hra-calculator"
            className="group block bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300"
            id="link_hra"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-all">
                <Percent size={16} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-50/50 dark:bg-amber-950/30 px-2.5 py-0.5 rounded-full">Exemptions</span>
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors mb-1">
              India HRA Exemption Calculator
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-4">
              Verify house rent allowance exemptions under old regime rules. Calculates using city tier, rent, and basic wage.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 group-hover:translate-x-1 transition-transform">
              Launch Calculator <ArrowRight size={12} />
            </span>
          </Link>

          {/* India TDS on Rent */}
          <Link
            to="/india/tds-calculator"
            className="group block bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
            id="link_tds"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-all">
                <ShieldCheck size={16} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-violet-500 bg-violet-50/50 dark:bg-violet-950/30 px-2.5 py-0.5 rounded-full">Compliance</span>
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-violet-500 transition-colors mb-1">
              India TDS On Rent Calculator
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-4">
              Verify if monthly rent exceeds the ₹50,000 threshold under section 194-I and compute TDS obligation.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-500 group-hover:translate-x-1 transition-transform">
              Launch Calculator <ArrowRight size={12} />
            </span>
          </Link>

          {/* India GST Calculator */}
          <Link
            to="/india/gst-calculator"
            className="group block bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
            id="link_gst"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 rounded-xl group-hover:bg-cyan-600 group-hover:text-white transition-all">
                <Percent size={16} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 px-2.5 py-0.5 rounded-full">GST</span>
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-cyan-500 transition-colors mb-1">
              India GST Slab Calculator
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-4">
              Perform forward GST calculations or reverse-extract base rates of 5%, 12%, 18%, or 28% from gross sums.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-500 group-hover:translate-x-1 transition-transform">
              Launch Calculator <ArrowRight size={12} />
            </span>
          </Link>
        </div>
      </section>

      {/* Featured Educational Article Content Section */}
      <section className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 sm:p-8 rounded-3xl space-y-6" id="home_guides_preview">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" />
              Tax Insights & Guides
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Read comprehensive editorial guides on complex tax policies.</p>
          </div>
          <Link
            to="/guides"
            className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            View All Guides <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Main Guide article */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 rounded-full">Featured Guide</span>
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 tracking-tight leading-snug">
              Old vs New Tax Regime in India (FY 2025-26) — Which Should You Choose?
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              Union Budget 2025 introduced major adjustments to India's tax structures. From expanded Section 87A rebate limits to updated standard deductions, learn which tax regime fits your income levels.
            </p>
            <Link
              to="/guides/old-vs-new-regime"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors pt-1"
            >
              Read Article <ArrowRight size={13} />
            </Link>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-800/80 md:pl-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">More Helpful Insights</h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <Link to="/guides/understanding-us-paycheck-withholding" className="block text-xs font-bold text-slate-850 dark:text-slate-200 hover:text-blue-500 transition-colors">
                  How Federal Withholding Slabs Impact Your Biweekly Take-Home Pay
                </Link>
                <p className="text-[11px] text-gray-400 dark:text-slate-500">Understand filing exemptions, standard deductions, and FICA wage caps.</p>
              </div>
              <div className="space-y-1">
                <Link to="/guides/india-vda-crypto-taxation" className="block text-xs font-bold text-slate-850 dark:text-slate-200 hover:text-blue-500 transition-colors">
                  Navigating Virtual Digital Assets (VDA) Surcharge Rules in India
                </Link>
                <p className="text-[11px] text-gray-400 dark:text-slate-500">How gains from coin trading under Section 115BBH are taxed at a flat 30% rate.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Local Data Processing */}
      <section className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="local_data_guarantee">
        <div className="flex gap-3">
          <div className="p-3 bg-white dark:bg-slate-900 text-green-600 dark:text-green-400 border border-gray-150 dark:border-slate-800 rounded-xl shrink-0 h-fit">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Client-Side Calculations Sandbox</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 max-w-xl">
              We value your security. 100% of your salary details, investment amounts, and transaction items are calculated locally in your web browser. No remote servers ever capture your financial secrets.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-gray-100 dark:border-slate-800">
          <Heart size={10} className="text-red-500" /> Made for taxpayers
        </div>
      </section>
    </div>
  );
}
