/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ShieldCheck, ExternalLink, HelpCircle, FileLock2, Info } from 'lucide-react';
import { Country } from '../types';
import TermsModal from './TermsModal';

interface FooterProps {
  country: Country;
}

export default function Footer({ country }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <footer className="mt-16 border-t font-sans transition-colors duration-300 bg-gray-50 border-gray-200 text-gray-500 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-400" id="app_footer">
      {/* Privacy Banner */}
      <div className="bg-blue-50/50 dark:bg-blue-950/20 border-b border-gray-200/60 dark:border-slate-900/60 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center space-x-3 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <ShieldCheck size={18} className="text-blue-500 shrink-0" />
            <span>Secure Offline Computation: All inputs remain strictly inside your browser’s localStorage.</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-gray-400 dark:text-slate-500 font-mono">
            <FileLock2 size={14} />
            <span>0 KB of third-party network egress</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-sm font-bold tracking-wider uppercase text-gray-900 dark:text-gray-100 flex items-center space-x-1.5">
              <span>About TaxCalc Pro</span>
            </h2>
            <p className="text-xs leading-relaxed max-w-sm">
              TaxCalc Pro is a non-governmental, client-side, interactive dual-country planning utility.
              We simplify multi-head income calculations, deductions optimization, and capital asset gain logging
              (under FIFO, LIFO, and HIFO standards) to empower citizens with automated, visual liability simulations.
            </p>
            <div className="text-[11px] leading-snug text-amber-600/80 dark:text-amber-400/70 p-3 rounded-lg bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/10 max-w-sm flex gap-2">
              <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Disclaimer:</strong> Content is for simulation purposes only. Information does not substitute professional legal, financial, or certified tax practitioner counselling.
              </span>
            </div>
          </div>

          {/* Quick Links / Official Portals Column */}
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-gray-900 dark:text-gray-100 mb-4">
              Official Tax Portals
            </h2>
            <ul className="space-y-2.5 text-xs">
              {country === 'INDIA' ? (
                <>
                  <li>
                    <a
                      href="https://eportal.incometax.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>e-Filing India Portal</span>
                      <ExternalLink size={12} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="http://www.incometaxindia.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <span>Income Tax Department</span>
                      <ExternalLink size={12} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.tin-nsdl.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <span>TIN NSDL Services</span>
                      <ExternalLink size={12} />
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a
                      href="https://www.irs.gov"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>Official IRS Homepage</span>
                      <ExternalLink size={12} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.irs.gov/filing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <span>IRS e-Filing Guidelines</span>
                      <ExternalLink size={12} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.irs.gov/advocate/local-taxpayer-advocate"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <span>Taxpayer Advocate Services</span>
                      <ExternalLink size={12} />
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact & Legal Column */}
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-gray-900 dark:text-gray-100 mb-4">
              Resources & Privacy
            </h2>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="block text-[11px] text-gray-400 dark:text-slate-500 uppercase font-mono tracking-wider">
                  Data Privacy Policy
                </span>
                <span className="block mt-0.5 text-gray-700 dark:text-slate-300">
                  Local-only sandbox state. Cleared instantly on cache wipe.
                </span>
              </li>
              <li>
                <span className="block text-[11px] text-gray-400 dark:text-slate-500 uppercase font-mono tracking-wider">
                  Supported Laws
                </span>
                <span className="block mt-0.5 text-gray-700 dark:text-slate-300">
                  {country === 'INDIA' ? 'Union Budget 2024 / FY 2024-25' : 'US Federal Tax brackets Year 2024'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-8 pt-8 border-t border-gray-200/50 dark:border-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p>© {currentYear} TaxCalc Pro Platform. Apache-2.0 License.</p>
          <div className="flex space-x-4">
            <span
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer text-blue-600 dark:text-blue-400 font-bold"
              id="footer_terms_of_use_link"
            >
              Terms of Use
            </span>
            <span>•</span>
            <span className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Security Auditing</span>
          </div>
        </div>
      </div>
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </footer>
  );
}
