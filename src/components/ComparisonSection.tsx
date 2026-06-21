/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Country, IndiaIncomeInputs, IndiaDeductions, UsaIncomeInputs, UsaAdjustments, UsaDeductions, UsaCredits, FilingStatus } from '../types';
import { calculateIndiaTax } from '../utils/indiaTaxCalculator';
import { calculateUsaTax } from '../utils/usaTaxCalculator';
import { HelpCircle, ArrowRightLeft, TrendingUp, Sparkles, Building, Landmark, Scale, HelpCircle as Help } from 'lucide-react';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ComparisonSectionProps {
  country: Country;
  indiaIncome: IndiaIncomeInputs;
  indiaDeductions: IndiaDeductions;
  usaIncome: UsaIncomeInputs;
  usaAdjustments: UsaAdjustments;
  usaDeductions: UsaDeductions;
  usaCredits: UsaCredits;
  usaSelectedState: string;
}

export default function ComparisonSection({
  country,
  indiaIncome,
  indiaDeductions,
  usaIncome,
  usaAdjustments,
  usaDeductions,
  usaCredits,
  usaSelectedState,
}: ComparisonSectionProps) {
  // USA state comparator state
  const [stateA, setStateA] = useState('CA');
  const [stateB, setStateB] = useState('TX');

  const currencySymbol = country === 'INDIA' ? '₹' : '$';

  // --- COMPUTE COMPARISONS ---
  const indiaCalculated = useMemo(() => {
    return calculateIndiaTax(indiaIncome, indiaDeductions);
  }, [indiaIncome, indiaDeductions]);

  const usaCalculatedStateA = useMemo(() => {
    return calculateUsaTax(usaIncome, usaAdjustments, usaDeductions, usaCredits, stateA);
  }, [usaIncome, usaAdjustments, usaDeductions, usaCredits, stateA]);

  const usaCalculatedStateB = useMemo(() => {
    return calculateUsaTax(usaIncome, usaAdjustments, usaDeductions, usaCredits, stateB);
  }, [usaIncome, usaAdjustments, usaDeductions, usaCredits, stateB]);

  // Marriage penalty comparative results
  const marriageComparison = useMemo(() => {
    if (country !== 'USA') return null;

    // Single individual calculation
    const singleRes = calculateUsaTax(usaIncome, usaAdjustments, usaDeductions, usaCredits, usaSelectedState);
    
    // MFJ individual calculation - we emulate joint by doubling wages, adjustments, itemized items & standard deductible
    const jointIncome = {
      ...usaIncome,
      annualSalary: usaIncome.annualSalary * 2,
      bonusCommission: usaIncome.bonusCommission * 2,
      socialSecurityTaxablePct: 2 // signifier to calculate as MFJ filing status inside calculator
    };
    const jointAdjustments = {
      ...usaAdjustments,
      iraDeduction: usaAdjustments.iraDeduction * 2,
    };
    const jointDeductions = {
      ...usaDeductions,
      stateIncomeTax: usaDeductions.stateIncomeTax * 2,
      realEstateTax: usaDeductions.realEstateTax * 2,
    };
    const jointCredits = {
      ...usaCredits,
      numQualifyingChildren: usaCredits.numQualifyingChildren,
    };

    const jointRes = calculateUsaTax(jointIncome, jointAdjustments, jointDeductions, jointCredits, usaSelectedState);
    
    // Combined tax of 2 singles vs 1 married joint
    const twoSinglesTax = singleRes.totalTaxLiability * 2;
    const jointTax = jointRes.totalTaxLiability;
    const difference = twoSinglesTax - jointTax; // Positive means bonus, negative means penalty
    const holdsPenalty = difference < 0;

    return {
      jointTax,
      twoSinglesTax,
      difference: Math.abs(difference),
      holdsPenalty,
    };
  }, [country, usaIncome, usaAdjustments, usaDeductions, usaCredits, usaSelectedState]);

  // Chart data
  const stateComparisonChartData = useMemo(() => {
    if (country !== 'USA') return [];
    return [
      {
        name: 'State Tax',
        [stateA]: usaCalculatedStateA.estimatedStateTax,
        [stateB]: usaCalculatedStateB.estimatedStateTax,
      },
      {
        name: 'Total Joint Tax',
        [stateA]: usaCalculatedStateA.totalTaxLiability,
        [stateB]: usaCalculatedStateB.totalTaxLiability,
      }
    ];
  }, [country, stateA, stateB, usaCalculatedStateA, usaCalculatedStateB]);

  const USA_STATES_OPT = [
    { code: 'CA', name: 'California (Max 13.3%)', note: 'High progressive' },
    { code: 'NY', name: 'New York (Max 10.9%)', note: 'High progressive' },
    { code: 'TX', name: 'Texas (0%)', note: 'No Income Tax' },
    { code: 'FL', name: 'Florida (0%)', note: 'No Income Tax' },
    { code: 'WA', name: 'Washington (0%)', note: 'No Income Tax' },
    { code: 'IL', name: 'Illinois (4.95%)', note: 'Flat standard' },
    { code: 'PA', name: 'Pennsylvania (3.07%)', note: 'Flat ultra-low' },
    { code: 'MA', name: 'Massachusetts (5.0%)', note: 'Flat average' },
  ];

  return (
    <div className="space-y-8 font-sans" id="comparison_section_wrapper">
      
      {/* 1. INDIA REGIME COMPARATOR UI */}
      {country === 'INDIA' && (
        <div className="space-y-6" id="india_regime_comparator">
          {/* Header Card */}
          <div className="p-6 rounded-3xl border bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 dark:from-slate-900 dark:to-slate-950 dark:border-slate-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">Regime Analyser</span>
                  <p className="text-[11px] font-serif font-semibold text-blue-700 dark:text-blue-300">Side-by-Side Model Optimization</p>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Old vs New Tax Regime comparison</h3>
                <p className="text-xs text-gray-500 max-w-xl">
                  Old Tax Regime grants dense exemptions (80C, 80D, HRA) but carries steep tax rates.
                  The New Regime cuts rates but limits deductions (with Standard Deduction of ₹75,000 preserved).
                </p>
              </div>

              {/* Dynamic recommendation badge */}
              <div className="p-4 rounded-2xl bg-white border border-blue-200/40 shadow-sm dark:bg-slate-900 dark:border-slate-800 text-center shrink-0 min-w-[200px]" id="recommendation_badge_box">
                <span className="text-[9px] font-black uppercase text-blue-600 block tracking-widest">Recommended Choice</span>
                <span className="text-sm font-black text-slate-800 dark:text-gray-100 block mt-1">
                  {indiaCalculated.betterRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}
                </span>
                <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                  Saves {currencySymbol} {indiaCalculated.taxSavings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown parameters table */}
          <div className="p-6 rounded-2xl border bg-white border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <h4 className="font-bold text-xs uppercase text-gray-400 tracking-wider mb-5">Comparison Parameters Ledger</h4>
            <div className="overflow-x-auto" id="india_comparison_table_wrapper">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wide">
                    <th className="py-3">Filing Parameter</th>
                    <th className="py-3 text-right">Old Regime</th>
                    <th className="py-3 text-right">New Regime</th>
                    <th className="py-3 text-right">Comparison Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-300">
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">Tax Slabs / Progressive Tiers</td>
                    <td className="py-3 text-right font-semibold text-slate-800 dark:text-slate-200">2.5L to 10L+ (5% to 30%)</td>
                    <td className="py-3 text-right font-semibold text-slate-800 dark:text-slate-200">3.0L to 15L+ (5% to 30% lower tiers)</td>
                    <td className="py-3 text-right font-bold text-blue-600 dark:text-blue-400">New Regime slabs are flatter</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">Standard salary Deduction</td>
                    <td className="py-3 text-right font-mono text-slate-800 dark:text-slate-200">₹ 75,000</td>
                    <td className="py-3 text-right font-mono text-slate-800 dark:text-slate-200">₹ 75,000</td>
                    <td className="py-3 text-right text-slate-500 dark:text-slate-400">Identical (Both Regimes)</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">HRA Exemption Exclusions</td>
                    <td className="py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">Allowed</td>
                    <td className="py-3 text-right font-mono text-rose-600 dark:text-rose-400">Not Allowed</td>
                    <td className="py-3 text-right text-amber-600 dark:text-amber-400 font-medium">Saves up to actual rent</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">Section 80C PF, LIC & Mutual Funds</td>
                    <td className="py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">Allowed (Capped 1.5L)</td>
                    <td className="py-3 text-right font-mono text-rose-600 dark:text-rose-400">Not Allowed</td>
                    <td className="py-3 text-right text-slate-500 dark:text-slate-400">Deduction basis drops to 0</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">Section 80D Family Medical Cover</td>
                    <td className="py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">Allowed (Up to 1.0L senior Parents)</td>
                    <td className="py-3 text-right font-mono text-rose-600 dark:text-rose-400">Not Allowed</td>
                    <td className="py-3 text-right text-slate-500 dark:text-slate-400">Disallowed completely</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">Sect 87A rebate Level Limit</td>
                    <td className="py-3 text-right font-mono text-slate-800 dark:text-slate-200">₹ 12,500 (Income &le; 5L)</td>
                    <td className="py-3 text-right font-mono text-slate-800 dark:text-slate-200">₹ 25,000 (Income &le; 7L)</td>
                    <td className="py-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">Zero Tax up to 7L Income</td>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-slate-800 font-bold bg-slate-50 border-b border-light-gray-200 dark:bg-slate-950/20 hover:bg-slate-100/50 dark:hover:bg-slate-950/40 transition-colors">
                    <td className="py-4 pl-3 text-slate-900 dark:text-slate-100 uppercase tracking-wide font-extrabold">Total Calculated Tax</td>
                    <td className="py-4 text-right font-mono text-[13px] text-slate-900 dark:text-white font-extrabold">{currencySymbol} {indiaCalculated.oldRegime.totalTaxPayable.toLocaleString()}</td>
                    <td className="py-4 text-right font-mono text-[13px] text-slate-900 dark:text-white font-extrabold">{currencySymbol} {indiaCalculated.newRegime.totalTaxPayable.toLocaleString()}</td>
                    <td className={`py-4 pr-3 text-right font-mono text-[13px] ${indiaCalculated.betterRegime === 'new' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-emerald-600 dark:text-emerald-400 font-extrabold'}`}>
                      {indiaCalculated.betterRegime === 'new' ? `New Saves ₹${indiaCalculated.taxSavings.toLocaleString()}` : `Old Saves ₹${indiaCalculated.taxSavings.toLocaleString()}`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Break-Even insights footer inside table card */}
            {indiaCalculated.betterRegime === 'new' && (
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800 text-xs text-slate-500 flex gap-2">
                <Sparkles size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Deduction Break-Even Point:</strong> You need to invest at least <strong>₹ {indiaCalculated.breakEvenPoints.deductionsNeeded.toLocaleString()}</strong> more
                  under Old Regime deductions to make the Old Regime financially superior to the New Regime at your current income.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. USA STATE COMPARATOR UI */}
      {country === 'USA' && (
        <div className="space-y-6" id="usa_state_comparator">
          
          {/* Card: Compare two US States */}
          <div className="p-6 rounded-3xl border bg-white border-gray-200/60 shadow-md dark:bg-slate-900 dark:border-slate-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5 mb-5">
              <div>
                <h3 className="text-md font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Building size={18} className="text-blue-500" />
                  <span>State-to-State Tax Burden comparison</span>
                </h3>
                <p className="text-xs text-gray-500">Pick two states to contrast your state level tax vs combined federal package.</p>
              </div>
              <div className="flex gap-2">
                <select
                  id="usa_select_state_a"
                  value={stateA}
                  onChange={(e) => setStateA(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border text-xs bg-white text-gray-900 font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                >
                  {USA_STATES_OPT.map(s => (
                    <option key={s.code} value={s.code} className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">{s.name}</option>
                  ))}
                </select>
                <div className="flex items-center text-gray-400 px-1">
                  <ArrowRightLeft size={14} />
                </div>
                <select
                  id="usa_select_state_b"
                  value={stateB}
                  onChange={(e) => setStateB(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border text-xs bg-white text-gray-900 font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                >
                  {USA_STATES_OPT.map(s => (
                    <option key={s.code} value={s.code} className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Split comparative boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Table comparisons */}
              <div className="overflow-x-auto" id="usa_state_comparison_ledger">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase">
                      <th className="py-2">Metric Details</th>
                      <th className="py-2 text-right text-slate-700 dark:text-slate-300">{stateA} Option</th>
                      <th className="py-2 text-right text-slate-700 dark:text-slate-300">{stateB} Option</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800/85 font-medium text-slate-700 dark:text-slate-300">
                    <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-900 dark:text-slate-100">Assessed Gross AGI</td>
                      <td className="py-2.5 text-right font-mono text-slate-800 dark:text-slate-200">{currencySymbol} {usaCalculatedStateA.adjustedGrossIncome.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-mono text-slate-800 dark:text-slate-200">{currencySymbol} {usaCalculatedStateB.adjustedGrossIncome.toLocaleString()}</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-900 dark:text-slate-100">Federal Tax Portion</td>
                      <td className="py-2.5 text-right font-mono text-slate-800 dark:text-slate-200">{currencySymbol} {usaCalculatedStateA.netFederalLiability.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-mono text-slate-800 dark:text-slate-200">{currencySymbol} {usaCalculatedStateB.netFederalLiability.toLocaleString()}</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-900 dark:text-slate-100">State Tax Portion</td>
                      <td className="py-2.5 text-right font-mono text-blue-600 dark:text-blue-400 font-bold">{currencySymbol} {usaCalculatedStateA.estimatedStateTax.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-mono text-blue-600 dark:text-blue-400 font-bold">{currencySymbol} {usaCalculatedStateB.estimatedStateTax.toLocaleString()}</td>
                    </tr>
                    <tr className="font-extrabold text-[13px] bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100/50 dark:hover:bg-slate-950/40 transition-colors border-t border-b border-gray-100 dark:border-slate-800">
                      <td className="py-3 pl-2 text-slate-900 dark:text-slate-100 font-extrabold">Total Liability Bill</td>
                      <td className="py-3 text-right font-mono text-rose-600 dark:text-rose-400 font-black">{currencySymbol} {usaCalculatedStateA.totalTaxLiability.toLocaleString()}</td>
                      <td className="py-3 text-right font-mono text-rose-600 dark:text-rose-400 font-black">{currencySymbol} {usaCalculatedStateB.totalTaxLiability.toLocaleString()}</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-900 dark:text-slate-100">Combined Effective Rate</td>
                      <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">{usaCalculatedStateA.effectiveTaxRate.toFixed(1)}%</td>
                      <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">{usaCalculatedStateB.effectiveTaxRate.toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Chart of split */}
              <div className="h-[180px] w-full" id="usa_state_bar_container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateComparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value) => `${currencySymbol} ${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#cbd5e1',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      }}
                      labelStyle={{
                        color: '#475569',
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px',
                      }}
                      itemStyle={{
                        fontSize: '12px',
                        fontWeight: '700',
                        padding: '2px 0',
                      }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey={stateA} fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey={stateB} fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card: US Marriage Penalty / Marriage Bonus */}
          {marriageComparison && (
            <div className="p-6 rounded-3xl border bg-gradient-to-tr from-rose-50/50 to-amber-50/30 border-rose-100 shadow-sm dark:from-slate-950 dark:to-slate-900 dark:border-slate-900">
              <div className="flex items-center space-x-2.5 mb-4">
                <Scale className="text-rose-500 shrink-0" size={20} />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Filing Status Marriage Impact Analysis</h4>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-2xl mb-4">
                The US Tax brackets double standard deduction limits for married couples, but high marginal tax tiers 
                can sometimes create a &ldquo;Marriage Penalty&rdquo; or a &ldquo;Marriage Bonus&rdquo; depending on how close 
                individual incomes are to each other.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="marriage_penalty_metrics">
                <div className="p-4 rounded-2xl bg-white border border-rose-100/50 dark:bg-slate-900 dark:border-slate-800">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-gray-400">Joint Filing Tax Bill</span>
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-1 block">
                    {currencySymbol} {marriageComparison.jointTax.toLocaleString()}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-rose-100/50 dark:bg-slate-900 dark:border-slate-800">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-gray-400">Combined Individual Taxes</span>
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-1 block">
                    {currencySymbol} {marriageComparison.twoSinglesTax.toLocaleString()}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-rose-100/50 dark:bg-slate-900 dark:border-slate-800">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-gray-400">Marriage Benefit Outcome</span>
                  <span className={`text-md font-bold block mt-1 ${marriageComparison.holdsPenalty ? 'text-rose-500' : 'text-emerald-500 dark:text-emerald-400'}`}>
                    {marriageComparison.holdsPenalty ? `Penalty of $${marriageComparison.difference.toLocaleString()}` : `Savings Bonus of $${marriageComparison.difference.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
