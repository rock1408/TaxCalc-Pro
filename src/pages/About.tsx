import React from 'react';
import { ShieldCheck, Heart, Users, Compass, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 text-slate-800 dark:text-slate-300" id="about_page">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About TaxCalc Pro
        </h1>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Our mission is to democratize tax planning. We provide high-fidelity, completely secure, client-side tools to help taxpayers optimize their take-home income.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="space-y-4 text-xs sm:text-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass size={18} className="text-blue-500" />
            Our Core Vision
          </h2>
          <p>
            Tax codes are notoriously complex, wordy, and intimidating. For most salaried individuals or freelancers, navigating standard deductions, rebate brackets, FICA limits, and local state withholdings feels like reading an alien language.
          </p>
          <p>
            TaxCalc Pro was built to change that. We design elegant, human-readable, and highly interactive simulators that clarify your financial math instantly. No hidden fees, no paywalls, and no complicated jargon.
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users size={18} className="text-blue-500" />
            Designed For Taxpayers
          </h2>
          <p>
            Whether you are a software developer evaluating standard vs itemized deductions in California, a freelancer mapping GST rates in Mumbai, or a salaried officer choosing old vs new regime slabs, our calculators are built specifically for your day-to-day workflow.
          </p>
          <p>
            We compile official IRS withholding regulations and Indian Income Tax Department budget schedules directly into our local React engines, providing instant outputs on every keystroke.
          </p>
        </div>
      </div>

      {/* Values Grid */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 sm:p-8 rounded-3xl space-y-6 pt-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-center">Our Core Commitments</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-blue-100/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-white">100% Privacy-First</h4>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">All computations execute strictly in your browser. We never capture or upload your salary details.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-green-100/50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full">
              <Globe size={20} />
            </div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-white">Dual-Country Support</h4>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">Seamless transitions between United States federal codes and India income tax rules.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-red-100/50 dark:bg-red-950/20 text-red-600 dark:text-red-450 rounded-full">
              <Heart size={20} />
            </div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-white">Absolutely Free</h4>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">Free, open, educational tools supported solely by non-intrusive AdSense placements.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
