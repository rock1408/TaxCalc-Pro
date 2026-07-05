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
                  Terms of Use
                </h3>
                <p className="font-semibold text-slate-500 dark:text-slate-400">
                  Last updated: July 2026
                </p>
                <p>
                  Please read these Terms of Use ("Terms") carefully before using <strong>taxcalcpro.vercel.app</strong> (the "Site"). By accessing or using the Site, you agree to be bound by these Terms. If you do not agree, please do not use the Site.
                </p>
              </div>

              {/* Summary Highlights Table */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-850 dark:text-slate-100 uppercase tracking-widest text-[10px] flex items-center gap-1">
                  <Scale size={13} className="text-blue-500" />
                  Key Terms & Highlights Reference
                </h3>
                <div className="border border-slate-150 dark:border-slate-850 rounded-lg overflow-hidden">
                  <table className="w-full text-[11px] border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-150 dark:border-slate-800">
                        <th className="py-2 px-3 font-extrabold text-slate-700 dark:text-slate-300">Section</th>
                        <th className="py-2 px-3 font-extrabold text-slate-700 dark:text-slate-300">Quick Summary & Commitments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-400 font-medium">
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-850 dark:text-slate-200">1. Purpose</td>
                        <td className="py-2 px-3">Free online calculators for estimating India and US taxes for informational purposes only.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-850 dark:text-slate-200">2. Professional Advice</td>
                        <td className="py-2 px-3">We do not provide legal, tax, or financial advice. Consult a CA (India) or CPA (USA).</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-850 dark:text-slate-200">3. Accuracy</td>
                        <td className="py-2 px-3">No guarantee of 100% precision. Tax laws change and updates on the Site may lag.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-850 dark:text-slate-200">4. Liability</td>
                        <td className="py-2 px-3">No liability for direct or indirect losses. Site provided on an "as is" and "as available" basis.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-850 dark:text-slate-200">5. User Roles</td>
                        <td className="py-2 px-3">Independently verify figures. No scraping, disrupting, or reverse-engineering.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-850 dark:text-slate-200">10. Governing Law</td>
                        <td className="py-2 px-3">Governed by and construed in accordance with applicable local laws.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sections Breakdown */}
              <div className="space-y-5">
                {/* 1 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">1. Purpose of This Site</h4>
                  <p>
                    TaxCalc Pro provides free online calculators for estimating income tax, paycheck withholding, and related figures for India and the United States ("Tools"). The Tools are intended for <strong>general informational and educational purposes only</strong>.
                  </p>
                </div>

                {/* 2 */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">2. Not Professional Tax, Legal, or Financial Advice</h4>
                  <p className="font-bold text-slate-700 dark:text-slate-200">The Site does not provide tax, legal, accounting, or financial advice.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>All results produced by the Tools are <strong>estimates only</strong>, based on simplified assumptions and publicly available tax rates, slabs, and rules in effect at the time of calculation.</li>
                    <li>Results may not reflect your exact tax liability, withholding, or take-home pay, and may not account for every deduction, exemption, credit, local tax, or individual circumstance applicable to you.</li>
                    <li>You should not rely solely on the Tools to make financial, tax filing, or investment decisions.</li>
                    <li>Always consult a qualified Chartered Accountant (India), Certified Public Accountant / licensed tax professional (USA), or relevant government authority before making decisions based on any information from this Site.</li>
                  </ul>
                </div>

                {/* 3 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">3. No Guarantee of Accuracy</h4>
                  <p>
                    While we make reasonable efforts to keep tax rates, slabs, and calculations up to date (e.g., aligned with the applicable Union Budget in India or IRS inflation adjustments in the USA), we do not guarantee that:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>The information is accurate, complete, or current at all times</li>
                    <li>The Tools are free from errors, bugs, or interruptions</li>
                    <li>The Tools reflect the most recent legislative or regulatory changes</li>
                  </ul>
                  <p>
                    Tax laws and rates change periodically, and there may be a delay between an official change and its reflection on this Site.
                  </p>
                </div>

                {/* 4 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">4. Limitation of Liability</h4>
                  <p>
                    To the fullest extent permitted by applicable law, TaxCalc Pro, its owner(s), and any affiliated contributors shall not be liable for any direct, indirect, incidental, consequential, or special damages arising out of or in connection with:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Your use of, or inability to use, the Site or Tools</li>
                    <li>Any errors, omissions, or inaccuracies in the calculations or content</li>
                    <li>Any decisions made or actions taken based on information from the Site</li>
                    <li>Any penalties, interest, or losses arising from incorrect tax filings, underpayment, or overpayment based on estimates provided by the Tools</li>
                  </ul>
                  <p>
                    The Site is provided on an <strong>"as is" and "as available"</strong> basis, without warranties of any kind, either express or implied.
                  </p>
                </div>

                {/* 5 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">5. User Responsibilities</h4>
                  <p>By using the Site, you agree that:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You are responsible for independently verifying any figures before relying on them for filing, planning, or financial decisions</li>
                    <li>You will not use the Tools for any unlawful purpose</li>
                    <li>You will not attempt to disrupt, reverse-engineer, scrape at scale, or interfere with the normal operation of the Site</li>
                    <li>Any data you enter into the calculators is entered voluntarily and, per our Privacy Policy, is processed locally in your browser</li>
                  </ul>
                </div>

                {/* 6 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">6. Intellectual Property</h4>
                  <p>
                    All content, design, branding, and code on this Site (excluding publicly available tax rate data, which is sourced from government publications) are the property of TaxCalc Pro unless otherwise noted. You may not copy, reproduce, or redistribute the Site's design or code without permission. You are welcome to share links to the Site and its calculators.
                  </p>
                </div>

                {/* 7 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">7. Third-Party Links and Sources</h4>
                  <p>
                    The Site may reference or link to official sources (e.g., incometax.gov.in, irs.gov) for informational purposes. We are not responsible for the content, accuracy, or availability of external sites.
                  </p>
                </div>

                {/* 8 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">8. No Warranty of Fitness for a Particular Purpose</h4>
                  <p>
                    The Tools are general-purpose calculators and are not customized for complex tax situations (e.g., multiple business entities, cross-border income, alternative minimum tax scenarios, complex trusts, etc.). Users with complex financial situations should seek personalized professional advice.
                  </p>
                </div>

                {/* 9 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">9. Changes to the Site and Terms</h4>
                  <p>
                    We reserve the right to modify, suspend, or discontinue any part of the Site or Tools at any time without notice. We may also update these Terms periodically; continued use of the Site after changes constitutes acceptance of the revised Terms.
                  </p>
                </div>

                {/* 10 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">10. Governing Law</h4>
                  <p>
                    These Terms shall be governed by and construed in accordance with applicable local laws, without regard to conflict-of-law principles.
                  </p>
                </div>

                {/* 11 */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs">11. Contact Us</h4>
                  <p>
                    If you have questions about these Terms, please contact us at: <strong className="text-blue-600 dark:text-blue-400">legal-india@taxcalcpro.com</strong>
                  </p>
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
