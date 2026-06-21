/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Country, IndiaIncomeInputs, IndiaDeductions, UsaIncomeInputs, UsaAdjustments, UsaDeductions, UsaCredits, CryptoTransaction } from '../types';
import { calculateIndiaTax } from '../utils/indiaTaxCalculator';
import { calculateUsaTax } from '../utils/usaTaxCalculator';
import { calculateCryptoGains } from '../utils/cryptoCalculator';
import { Lightbulb, Calendar, BookOpen, AlertTriangle, HelpCircle, CheckCircle, ChevronDown, ChevronUp, DollarSign, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface InsightsSectionProps {
  country: Country;
  indiaIncome: IndiaIncomeInputs;
  indiaDeductions: IndiaDeductions;
  usaIncome: UsaIncomeInputs;
  usaAdjustments: UsaAdjustments;
  usaDeductions: UsaDeductions;
  usaCredits: UsaCredits;
  transactions: CryptoTransaction[];
  costBasisMethod: any;
}

export default function InsightsSection({
  country,
  indiaIncome,
  indiaDeductions,
  usaIncome,
  usaAdjustments,
  usaDeductions,
  usaCredits,
  transactions,
  costBasisMethod,
}: InsightsSectionProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const currencySymbol = country === 'INDIA' ? '₹' : '$';

  // --- DERIVE INTELLIGENT PERSONALISED INSIGHTS ---
  const activeTips = useMemo(() => {
    const list: { type: 'tip' | 'warning' | 'success'; title: string; desc: string }[] = [];

    if (country === 'INDIA') {
      const indiaCalc = calculateIndiaTax(indiaIncome, indiaDeductions);
      
      // 1. Regime Choice
      if (indiaCalc.betterRegime === 'new' && indiaCalc.taxSavings > 1000) {
        list.push({
          type: 'success',
          title: 'Regime Switching Advantage',
          desc: `Based on your elements, staying in the New Tax Regime saves you ₹ ${indiaCalc.taxSavings.toLocaleString()} annually. Stick to this default!`,
        });
      } else if (indiaCalc.betterRegime === 'old' && indiaCalc.taxSavings > 1000) {
        list.push({
          type: 'success',
          title: 'Exemption Optimization Success',
          desc: `Because you have entered high deductions, the Old Regime is currently better, saving you ₹ ${indiaCalc.taxSavings.toLocaleString()}. Ensure you maintain proof of ELSS, Rent, and LIC.`,
        });
      }

      // 2. 80C Opportunity
      const total80C = (indiaDeductions.ppf || 0) + (indiaDeductions.epf || 0) + (indiaDeductions.tuitionFees || 0) + (indiaDeductions.homeLoanPrincipal || 0);
      if (total80C < 150000 && indiaCalc.betterRegime === 'old') {
        const missing = 150000 - total80C;
        list.push({
          type: 'tip',
          title: 'Uncapped Section 80C limit',
          desc: `You have occupied ₹ ${total80C.toLocaleString()} out of the ₹ 1,50,000 Section 80C cap. Consider allocating ₹ ${missing.toLocaleString()} to ELSS Mutual Funds or PPF before March 31 to decrease net tax.`,
        });
      }

      // 3. Section 80CCD(1B) NPS Tip
      if ((indiaDeductions.npsExtra80CCD1B || 0) < 50000 && indiaCalc.betterRegime === 'old') {
        list.push({
          type: 'tip',
          title: 'Section 80CCD(1B) NPS Top-up',
          desc: 'You can claim an EXTRA deduction of up to ₹ 50,000 by subscribing to NPS Tier 1. This is over and above the ₹ 1.5 Lakhs 80C cap!',
        });
      }

      // 4. Section 80D parent policy
      if ((indiaDeductions.healthPremiumParents || 0) === 0 && indiaCalc.betterRegime === 'old') {
        list.push({
          type: 'tip',
          title: 'Section 80D Parents Medical cover',
          desc: 'Premiums paid for health policies of parents grant separate deductions of up to ₹ 25,000 (₹ 50,000 if parent is senior citizen). Consider optimizing family insurance.',
        });
      }
    } else {
      // --- USA ADVICE ---
      const usaCalc = calculateUsaTax(usaIncome, usaAdjustments, usaDeductions, usaCredits);

      // 1. Traditional IRA vs Roth
      if ((usaAdjustments.iraDeduction || 0) === 0 && usaCalc.taxableIncome > 50000) {
        list.push({
          type: 'tip',
          title: 'Maximize Traditional IRA Write-offs',
          desc: 'You currently have no Traditional IRA deductions logged. Standard contributions up to $7,000 ($8,000 if age 50+) can offset your joint Adjusted Gross Income directly.',
        });
      }

      // 2. HSA Contribution benefit
      if ((usaAdjustments.hsaDeduction || 0) === 0) {
        list.push({
          type: 'tip',
          title: 'Health Savings Account (HSA) Triple-Tax Advantage',
          desc: 'Subscribing to an HSA under High-Deductible Health Plans (HDHP) lets you deduct contributions, grow returns tax-free, and withdraw tax-free for qualified medical usage.',
        });
      }

      // 3. Itemized deduction status
      if (usaCalc.usingItemized) {
        list.push({
          type: 'success',
          title: 'Itemised Deductions Active',
          desc: `Your itemized schedule sums to $${usaCalc.standardOrItemizedDeductionValue.toLocaleString()} which exceeds the standard deduction of $${usaCalc.standardOrItemizedDeductionValue.toLocaleString()}. Ensure you retain receipts of SALT, mortgage interest, and charitable donations.`,
        });
      } else if (usaDeductions.isItemized && !usaCalc.usingItemized) {
        list.push({
          type: 'warning',
          title: 'Standard Deduction Recommended',
          desc: 'You enabled itemizing, but your cumulative itemized value is lower than the IRS standard deduction. The engine auto-applied the higher standard deductible to protect you.',
        });
      }
    }

    // --- CRYPTO GAINS SYSTEMIC ADVICE ---
    const cryptoSummary = calculateCryptoGains(transactions, costBasisMethod, country, country === 'INDIA' ? 30 : 22);
    
    // 1. Tax-loss Harvesting check
    let holdsLosses = false;
    cryptoSummary.gainsList.forEach(g => {
      if (g.gainOrLoss < 0) holdsLosses = true;
    });

    if (holdsLosses) {
      if (country === 'USA') {
        list.push({
          type: 'success',
          title: 'Tax-Loss Harvesting active',
          desc: `You have capital losses. In the USA, these offset your crypto capital gains directly. Any surplus losses up to $3,000 can also offset your ordinary salary income!`,
        });
      } else {
        list.push({
          type: 'warning',
          title: 'India Virtual Digital Asset (VDA) Restriction',
          desc: 'You have crypto transaction losses. Note that under Section 115BBH of the Indian Income Tax Act, losses from VDAs CANNOT be offset against other VDA gains or salary. You pay 30% flat on each profitable sale!',
        });
      }
    }

    // 2. STCG vs LTCG timing warning
    const shortTermSalesCount = cryptoSummary.gainsList.filter(g => g.classification === 'STCG' && g.gainOrLoss > 0).length;
    if (shortTermSalesCount > 1) {
      list.push({
        type: 'warning',
        title: 'High STCG Crypto Exposure',
        desc: `You have ${shortTermSalesCount} profitable sales marked as short-term. Holding coins for > 1 year transitions gains into LTCG, lowering tax from slab rates to preferential rates (${country === 'INDIA' ? '20%' : '15%'}).`,
      });
    }

    // Default return
    if (list.length === 0) {
      list.push({
        type: 'tip',
        title: 'Optimize inputs to receive tips',
        desc: 'Log salaries, deductions, or crypto transactions to unlock personalized tax optimization tips.',
      });
    }
    return list;
  }, [country, indiaIncome, indiaDeductions, usaIncome, usaAdjustments, usaDeductions, usaCredits, transactions, costBasisMethod]);

  // --- DEADLINE CALENDARS ---
  const calendarDeadlines = useMemo(() => {
    if (country === 'INDIA') {
      return [
        { date: 'April 01', title: 'Financial Year Begins', desc: 'Assess standard salary structures and plan initial Section 80C investment schemes.' },
        { date: 'July 31', title: 'ITR Filing Due (Non-Audit)', desc: 'Final date to file individual Income Tax Return for non-business cases.' },
        { date: 'September 15', title: 'Advance Tax installment 2', desc: 'Second advance tax payment due of 30% cumulative liability.' },
        { date: 'October 31', title: 'ITR Filing Due (Audit Cases)', desc: 'Filing deadline for self-employed professionals requiring audited audits.' },
        { date: 'March 15', title: 'Final Advance Tax installment', desc: 'Final day to clear 100% estimated advance tax for the current FY.' },
        { date: 'March 31', title: 'Tax-Saving Investment End', desc: 'Absolute final date to complete 80C, 80D investments to claim under the FY.' },
      ];
    } else {
      return [
        { date: 'January 01', title: 'Tax Year Begins', desc: 'W-2 earnings cycle starts and initial retirement planning accounts open.' },
        { date: 'April 15', title: 'IRS Filing & Contribution Due', desc: 'Federal filing due. Also final date for Traditional and Roth IRA contributions.' },
        { date: 'June 15', title: 'Q2 Estimated Payment Due', desc: 'Second installment due for self-employed freelancers paying quarterly.' },
        { date: 'September 15', title: 'Q3 Estimated Payment Due', desc: 'Third quarter estimated payment submission to IRS.' },
        { date: 'October 15', title: 'Extended ITR Filing Due', desc: 'Filing deadline for taxpayers who requested standard Form 4868 extensions.' },
        { date: 'January 15', title: 'Q4 Estimated Payment Due', desc: 'Final estimated tax payment for the previous calendar tax year.' },
      ];
    }
  }, [country]);

  // --- FAQS ---
  const FAQ_ITEMS = [
    {
      q: 'What is standard deduction vs itemised deduction?',
      a: 'The standard deduction is a fixed dollar amount ($14,600 Single, $29,200 MFJ for USA in 2024; ₹75,000 for India) that reduces tax liability with zero receipts needed. Itemizing involves logging actual expenses (Home mortgage interest, SALT, Charity) and applies only if the total exceeds the standard deduction of your status.'
    },
    {
      q: 'How is Crypto taxed in India vs the USA?',
      a: 'In the USA, crypto is treated as property subject to standard capital gains rules (tax-losses offset gains, holding > 1 year qualifies for 0/15/20% rates). In India, Virtual Digital Assets (VDA) are taxed under 115BBH at 30% flat on each gain, with absolutely no deduction for expenses (except purchase cost) and no offsetting of losses allowed.'
    },
    {
      q: 'How do FIFO, LIFO, and HIFO cost bases affect tax?',
      a: 'FIFO (First In, First Out) sells oldest coins first (often yields high gains in rising markets). LIFO (Last In, First Out) sells newest first. HIFO (Highest In, First Out) sells the most expensive lots first, which minimizes immediate capital gains, representing the most tax-optimized approach.'
    },
    {
      q: 'What are above-the-line adjustments?',
      a: 'Above-the-line deductions are adjustments (such as Student Loan Interest, traditional IRA, HSA) that subtract from your Gross Income to locate your Adjusted Gross Income (AGI). They are highly advantageous because they apply regardless of whether you claim the standard or itemized deduction!'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans" id="insights_section_wrapper">
      
      {/* Left Column: Personalized insights tips & Deadlines */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Personalized Tips Section */}
        <div className="p-6 rounded-3xl border bg-white border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center space-x-2 mb-6">
            <Lightbulb size={20} className="text-yellow-500 shrink-0" />
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Intelligent Tax Optimization Tips
            </h3>
          </div>

          <div className="space-y-4" id="insights_list">
            {activeTips.map((tip, index) => {
              const infoBg =
                tip.type === 'success'
                  ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-950 dark:text-emerald-300'
                  : tip.type === 'warning'
                  ? 'bg-rose-500/5 border-rose-500/10 text-rose-950 dark:text-rose-400'
                  : 'bg-blue-500/5 border-blue-500/10 text-blue-950 dark:text-blue-300';
              
              const iconColor =
                tip.type === 'success'
                  ? 'text-emerald-500'
                  : tip.type === 'warning'
                  ? 'text-rose-500'
                  : 'text-blue-500';

              return (
                <div key={`tip_${index}`} className={`p-4 rounded-2xl border flex gap-3 ${infoBg}`}>
                  <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                    {tip.type === 'success' ? (
                      <CheckCircle size={18} />
                    ) : tip.type === 'warning' ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <Lightbulb size={18} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">{tip.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 dark:text-slate-400 leading-relaxed font-semibold">
                      {tip.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic FAQ Explainer cards */}
        <div className="p-6 rounded-3xl border bg-white border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center space-x-2 mb-6">
            <BookOpen size={20} className="text-indigo-500 shrink-0" />
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Educational Explainer FAQs
            </h3>
          </div>

          <div className="space-y-3" id="faq_accordion">
            {FAQ_ITEMS.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div key={`faq_${idx}`} className="border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-gray-800 dark:text-gray-200 bg-gray-50/50 dark:bg-slate-800/10 outline-none hover:bg-gray-50"
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  >
                    <span>{faq.q}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-4 bg-white text-xs dark:bg-slate-900 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800 leading-relaxed font-semibold"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Deadlines / Tax Calendars */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-6 rounded-3xl border bg-gradient-to-b from-gray-50 to-white border-gray-200/80 shadow-md dark:from-slate-900 dark:to-slate-950 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 mb-5 border-b border-gray-100 dark:border-slate-800 pb-4">
            <Calendar size={18} className="text-blue-500 shrink-0" />
            <h4 className="text-xs font-black uppercase text-gray-900 tracking-wider dark:text-slate-100">
              Tax Planning Calendar
            </h4>
          </div>

          <div className="space-y-4" id="calendar_list">
            {calendarDeadlines.map((dl, idx) => {
              return (
                <div key={`dl_${idx}`} className="flex items-start gap-3 border-b border-gray-50 dark:border-slate-900 pb-3 last:border-0 last:pb-0">
                  <div className="px-2 py-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono text-[10px] font-black shrink-0 text-center uppercase min-w-[55px]">
                    {dl.date}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{dl.title}</h5>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-normal font-semibold">
                      {dl.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
