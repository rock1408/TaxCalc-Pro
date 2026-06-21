/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, ArrowUpRight, Scale, ShieldAlert, Check } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  // Disable body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10" id="terms_modal_overlay">
          {/* Backdrop blur & fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/80"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden"
            id="terms_modal_box"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-850 dark:text-white leading-tight">
                    Terms & Conditions
                  </h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Last updated: June 2026 • TaxCalc Pro Platform
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                aria-label="Close modal"
                id="close_terms_modal_top_btn"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Summary Banner */}
            <div className="bg-amber-500/5 dark:bg-amber-400/5 border-b border-amber-500/10 px-6 py-3 shrink-0 flex items-start gap-2.5">
              <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400/80 font-medium">
                <strong>Attention:</strong> TaxCalc Pro is an informational estimation tool and does not constitute official CPA, financial, or certified legal tax counsel. Please verify all liabilities independently.
              </p>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 font-sans text-xs text-slate-600 dark:text-slate-350 leading-relaxed scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
              
              {/* Introduction */}
              <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                <h3 className="font-bold text-slate-850 dark:text-slate-100 uppercase tracking-wide text-[11px]">
                  Welcome to TaxCalc Pro
                </h3>
                <p>
                  BY ACCESSING, BROWSING, OR USING THE TAXCALC PRO WEBSITE ("THE WEBSITE") AND ITS ASSOCIATED SERVICES, YOU AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS ("TERMS"). IF YOU DO NOT AGREE TO THESE TERMS, PLEASE DO NOT USE THE WEBSITE.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you and TaxCalc Pro governing your use of the Website. By using the Website, you represent that you are at least 18 years of age and have the legal capacity to enter into this agreement. If you are using the Website on behalf of an organization, you represent that you have the authority to bind such organization to these Terms.
                </p>
              </div>

              {/* Summary Highlights Table */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-850 dark:text-slate-100 uppercase tracking-widest text-[10px] flex items-center gap-1">
                  <Scale size={13} className="text-blue-500" />
                  Terms Reference Highlights
                </h3>
                <div className="border border-slate-150 dark:border-slate-850 rounded-lg overflow-hidden">
                  <table className="w-full text-[11px] border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-150 dark:border-slate-800">
                        <th className="py-2 px-3 font-extrabold text-slate-700 dark:text-slate-300">Category</th>
                        <th className="py-2 px-3 font-extrabold text-slate-700 dark:text-slate-300">Key Terms & Commitments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-400 font-medium">
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-850 dark:text-slate-200">Nature of Service</td>
                        <td className="py-2 px-3">Informational tax calculator and liability estimation only</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-850 dark:text-slate-200">Not Professional Advice</td>
                        <td className="py-2 px-3">Always consult specialized CPAs or tax lawyers for actual legal submissions</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-850 dark:text-slate-200">Data Processing</td>
                        <td className="py-2 px-3">100% Client-side sandbox local browser storage (No remote server saving)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-850 dark:text-slate-200">Liability Cap</td>
                        <td className="py-2 px-3">Absolute cumulative liability capped strictly at ₹1,000 (India) or $100 (USA)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-850 dark:text-slate-200">Your Responsibility</td>
                        <td className="py-2 px-3">Review data settings, preserve records & perform independent evaluations</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-850 dark:text-slate-200">Governing Law</td>
                        <td className="py-2 px-3">Applicable standard laws of India or the United States, based on calculator used</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-850 dark:text-slate-200">Disputes</td>
                        <td className="py-2 px-3">Resolved strictly through friendly negotiation and individual arbitration first</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sections Breakdown */}
              <div className="space-y-5">
                {/* 1 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">1. Acceptance of Terms</h4>
                  <p>
                    By interacting with our system interface, you acknowledge that you have voluntarily read, fully comprehend, and definitively agree to remain completely bound by this legal service pact. Terms remain identical whether exploring as an individual resident or navigating parameters on behalf of an enterprise entity.
                  </p>
                </div>

                {/* 2 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">2. Description of Service</h4>
                  <p>TaxCalc Pro maintains an integrated suite of online responsive mathematical models allowing users to explore hypothetical scenarios:</p>
                  
                  <div className="pl-3.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-2">
                    <p><strong>2.1 Income Tax Calculators:</strong> Includes comparison engines modeling current year Indian tax laws (comparing step progressive Old Regime vs simplified bracket New Regime) and US Federal bracket limits mapped according to filing category statuses.</p>
                    <p><strong>2.2 Cryptocurrency Tax Calculators:</strong> Analyzes coin base trades under varying reporting standards. Under Section 115BBH for Indian accounts, VDAs gains are modeled with flat 30% without loss offset allowances. USA transactions model short/long-term asset periods with custom valuation.</p>
                    <p><strong>2.3 Comparison Tools:</strong> Displays interactive Old vs New Regime schedules, detailed multi-state tax charts for US configurations, and real-time ledger outputs.</p>
                    <p><strong>2.4 Tax Insights Hub:</strong> Automated rule-based heuristics mapping entered variables into relevant deduction notices and filing guidelines.</p>
                  </div>
                </div>

                {/* 3 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">3. No Professional Advice</h4>
                  <p>
                    <strong>IMPORTANT: TaxCalc Pro is an informational planning template only.</strong> The metrics shown do not represent actual audit reports, certified filings, or absolute declarations. Legislative provisions are subject to sudden shifts, and individual state variances, local surcharges, or custom deductions play dynamic roles. You are strictly expected to align and verify your final calculations with a certified CPA, recognized legal practitioner, or qualified financial planner before making irreversible payments or submissions to official governmental departments.
                  </p>
                </div>

                {/* 4 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">4. Disclaimer of Warranties</h4>
                  <p>We declare service delivery purely on an "AS IS" and "AS AVAILABLE" infrastructure basis, completely disclaiming any implied representational warranties:</p>
                  <div className="pl-3.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-1.5">
                    <p><strong>4.1 Accuracy:</strong> We cannot warrant 100% calculation accuracy due to potential rounding variances, edge-case exemptions, or localized tax rules.</p>
                    <p><strong>4.2 Completeness:</strong> Complex scenarios involving global asset transfers, detailed corporate payroll credits, or regional local municipality duties may not be fully contained.</p>
                    <p><strong>4.3 Currency:</strong> While calculations track updated 2024–2025 frameworks, updates may lag slightly behind unexpected emergency legislative mandates.</p>
                  </div>
                </div>

                {/* 5 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">5. Limitation of Liability</h4>
                  <p>In no event shall our engineers, contributors, or corporate affiliates be held liable for:</p>
                  <div className="pl-3.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-1.5">
                    <p><strong>5.1 Indirect Damages:</strong> Any secondary, special, consequential, or punitive damages including business disruption, missed capital investment returns, or financial stress.</p>
                    <p><strong>5.2 Calculation Errors:</strong> Losses incurred through misplaced confidence in calculator outputs or incorrect user data entries.</p>
                    <p><strong>5.3 Third-Party Actions:</strong> Unpredictable API deviations, public coin valuation shifts, or unexpected modifications in administrative tax rules.</p>
                    <p><strong>5.4 Liability Cap:</strong> Total cumulative financial liability arising from any connection with our services is strictly limited to an absolute cap of ₹1,000 (INR) in India, or $100 (USD) in the US.</p>
                  </div>
                </div>

                {/* 6 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">6. User Responsibilities</h4>
                  <p>As an active user of the platform, you specifically commit to the following:</p>
                  <div className="pl-3.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-1.5">
                    <p><strong>6.1 Accurate Information:</strong> Providing truthful data variables, checking currency decimals, and reviewing input totals before logging computations.</p>
                    <p><strong>6.2 Data Security:</strong> Safeguarding local state caches, utilizing locked browser instances when browsing from shared terminals, and clearing cache upon exit.</p>
                    <p><strong>6.3 Compliance:</strong> Maintaining operations block-aligned with statutory filing obligations and never utilizing the calculations for deceptive tax schemes.</p>
                    <p><strong>6.4 Independent Verification:</strong> Directly confirming calculations against IRS publications, CBDT schedules, and the manual guidelines provided by legislative tax agencies.</p>
                  </div>
                </div>

                {/* 7 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">7. Intellectual Property Rights</h4>
                  <p>
                    The TaxCalc Pro name, branding, styles, visual configurations, vector graphics layouts, custom CSS, scripts, and underlying calculation algorithms represent proprietary intellectual property. License is granted solely for non-profit personal sandbox evaluations. Reverse engineering formula matrices or harvesting layouts for competing portals is strictly prohibited.
                  </p>
                </div>

                {/* 8 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">8. Data Handling and Privacy</h4>
                  <p>We respect client anonymity and maintain a transparent, highly locked data architecture:</p>
                  <div className="pl-3.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-1.5">
                    <p><strong>8.1 Local Processing:</strong> Calculations run entirely on your local browser thread. Your sensitive data rows never traverse our remote machines.</p>
                    <p><strong>8.2 Data Storage:</strong> Inputs persist strictly within your local browser's storage bounds to allow rapid page refreshes, and are dropped on manual cache resets.</p>
                    <p><strong>8.3 Cookies:</strong> Minimal cookie headers are reserved solely for retaining core system choices such as selected country code or light/dark viewport state.</p>
                    <p><strong>8.4 Third-Party Services:</strong> External links lead users to official gov websites. Data handling is bound by those respective organizations.</p>
                    <p><strong>8.5 Data Retention:</strong> We store zero user transaction logs. You bear sole ownership of manually backing up your calculated tax worksheets.</p>
                  </div>
                </div>

                {/* 9 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">9. Tax Law Accuracy</h4>
                  <p>Our mathematical processors map structural policies from high-credibility legislative resources:</p>
                  <div className="pl-3.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-1.5">
                    <p><strong>9.1 India Tax Information:</strong> Implements provisions of the Income Tax Act, 1961, mapping Section 115BAC New Regime and standard Old Regime deductions.</p>
                    <p><strong>9.2 USA Tax Information:</strong> Maps standard deductions and tax tables authorized under IRC provisions adjust for fiscal year brackets.</p>
                    <p><strong>9.3 Cryptocurrency Taxation:</strong> Integrates flat-rate Indian capital gains models alongside short/long-term holding period logic aligned with IRS crypto rules.</p>
                  </div>
                </div>

                {/* 10 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">10. Acceptable Use</h4>
                  <p>
                    Use of the Website is limited to personal, planning, educational, and evaluation purposes. You may not utilize automation scrapers, load massive concurrent operations, deploy harmful scripts, or mock endpoints.
                  </p>
                </div>

                {/* 11 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">11. Third-Party Links</h4>
                  <p>
                    Any link pointing towards external tools or official tax agencies is provided purely for convenient research, without representing our endorsement of their content accuracy.
                  </p>
                </div>

                {/* 12-23 Details Shortened for elegant visual presentation */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <p><strong>12. Updates:</strong> Terms may adapt to reflect changing financial regulations. We reflect current revisions on the bottom footer section.</p>
                  <p><strong>13. Accounts:</strong> TaxCalc Pro provides unrestricted sandbox access without demanding account creation or sign-ups.</p>
                  <p><strong>14 & 15. Law & Disputes:</strong> Mapped to the laws of India and the United States respectively. Disputes must seek quick, friendly conciliation before pursuing binding arbitration procedures in parent jurisdictions.</p>
                  <p><strong>16 & 17. Indemnification & Severability:</strong> You agree to protect and indemnify TaxCalc Pro from claims due to misuse. If any term clause is deemed null, remaining components continue unimpaired.</p>
                  <p><strong>18 & 19. Entire Agreement:</strong> Represents the complete and singular pact between the user and the platform regarding informational simulations.</p>
                  <p><strong>22 & 23. Accessibility & Cohorts:</strong> Built to remain compliant with accessible screen standards, restricted from tracking details of visitors under the age of 13.</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl">
                <div>
                  <h5 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">India Contact</h5>
                  <p>Email: legal-india@taxcalcpro.com</p>
                  <p>Address: Level 4, Tech Hub, Bangalore, India</p>
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">USA Contact</h5>
                  <p>Email: legal-usa@taxcalcpro.com</p>
                  <p>Address: Suite 102, Tax Tower, San Francisco, CA</p>
                </div>
              </div>
            </div>

            {/* Footer triggers */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                id="close_terms_modal_bottom_btn"
              >
                Close View
              </button>
              <button
                onClick={onClose}
                className="px-4.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center space-x-1.5"
                id="accept_terms_modal_btn"
              >
                <Check size={14} className="stroke-[3]" />
                <span>I Understand & Accept</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
