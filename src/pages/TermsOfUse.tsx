import React from 'react';
import { ShieldAlert, BookOpen, AlertCircle } from 'lucide-react';

export default function TermsOfUse() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto py-4 text-xs sm:text-sm text-slate-800 dark:text-slate-300 leading-relaxed" id="terms_page">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Terms of Use</h1>
        <p className="text-xs text-gray-400 font-medium">Last updated: July 2026</p>
      </div>

      <div className="border-t border-gray-100 dark:border-slate-850 pt-6 space-y-4">
        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 text-xs text-amber-850 dark:text-amber-400 rounded-xl flex gap-2.5 items-start">
          <AlertCircle size={18} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="block mb-1">Disclaimer of Professional Liability</strong>
            TaxCalc Pro provides free mathematical simulators for estimation purposes only. All calculations must be verified by a qualified tax practitioner or official national filings before making financial or reporting decisions.
          </div>
        </div>

        <p>
          Please read these Terms of Use ("Terms") carefully before using taxcalcpro.vercel.app (the "Site"). By accessing or using the Site, you agree to be bound by these Terms. If you do not agree, please do not use the Site.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pt-2">
          <BookOpen size={16} className="text-blue-500" />
          1. Purpose of This Site
        </h2>
        <p>
          TaxCalc Pro provides free online calculators for estimating income tax, paycheck withholding, and related figures for India and the United States ("Tools"). The Tools are intended for <strong>general informational and educational purposes only</strong>.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pt-2">
          <ShieldAlert size={16} className="text-blue-500" />
          2. Not Professional Tax, Legal, or Financial Advice
        </h2>
        <p>
          <strong>The Site does not provide tax, legal, accounting, or financial advice.</strong>
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>All results produced by the Tools are <strong>estimates only</strong>, based on simplified assumptions and publicly available tax rates, slabs, and rules in effect at the time of calculation.</li>
          <li>Results may not reflect your exact tax liability, withholding, or take-home pay, and may not account for every deduction, exemption, credit, local tax, or specific tax situation applicable to you.</li>
          <li>No attorney-client, tax professional-client, or fiduciary relationship is created by your use of the Site or Tools.</li>
        </ul>

        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-2">3. Accuracy of Calculations & "As-Is" Warranties</h2>
        <p>
          While we strive to keep our calculation engines up-to-date with official Union Budgets in India and IRS bulletins in the United States, we cannot guarantee the complete accuracy, adequacy, or completeness of any computed values. The Tools are provided on an "as-is" and "as-available" basis without warranties of any kind.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-2">4. Third-Party Placements & AdSense</h2>
        <p>
          We rely on non-intrusive AdSense placements to support our free operations. We are not responsible for any external services, software, or sites advertised through Google’s ad slots.
        </p>
      </div>
    </div>
  );
}
