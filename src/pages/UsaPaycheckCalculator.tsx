import React, { useState } from 'react';
import ValidatedNumberInput from '../components/ValidatedNumberInput';
import HowWeCalculate from '../components/HowWeCalculate';
import { Percent, ArrowLeft, Landmark, DollarSign, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { USA_TAX_CONFIG } from '../config/taxConfigUSA';

type Frequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
type FilingStatus = 'Single' | 'MFJ' | 'HoH';

export default function UsaPaycheckCalculator() {
  const [grossPay, setGrossPay] = useState(5000); // pay per period
  const [frequency, setFrequency] = useState<Frequency>('biweekly');
  const [status, setStatus] = useState<FilingStatus>('Single');
  const [allowances, setAllowances] = useState(0);

  const periodsPerYear = {
    weekly: 52,
    biweekly: 26,
    semimonthly: 24,
    monthly: 12,
  }[frequency];

  // Annualize income
  const annualGross = grossPay * periodsPerYear;

  // 1. FICA Social Security (6.2% up to limit $184,500 in 2026)
  const ssLimit = USA_TAX_CONFIG.fica.socialSecurity.wageBaseLimit;
  const annualSsTaxable = Math.min(annualGross, ssLimit);
  const annualSsTax = annualSsTaxable * 0.062;
  const paycheckSsTax = annualSsTax / periodsPerYear;

  // 2. FICA Medicare (1.45% plus additional 0.9% above threshold)
  const medRate = 0.0145;
  const medThreshold = status === 'MFJ' ? 250000 : 200000;
  const annualMedTaxStandard = annualGross * medRate;
  const annualMedTaxAdditional = annualGross > medThreshold ? (annualGross - medThreshold) * 0.009 : 0;
  const annualMedTax = annualMedTaxStandard + annualMedTaxAdditional;
  const paycheckMedTax = annualMedTax / periodsPerYear;

  // 3. Federal Income Withholding
  // standard deduction for 2026
  const stdDeduction = USA_TAX_CONFIG.standardDeductions[status] || 16100;
  const annualTaxable = Math.max(0, annualGross - stdDeduction);

  // Progressive slabs calculation
  const brackets = USA_TAX_CONFIG.federalBrackets[status] || USA_TAX_CONFIG.federalBrackets.Single;
  let annualFederalTax = 0;
  let remaining = annualTaxable;
  let prevLimit = 0;

  for (const b of brackets) {
    const width = b.limit - prevLimit;
    if (remaining > width) {
      annualFederalTax += width * b.rate;
      remaining -= width;
      prevLimit = b.limit;
    } else {
      annualFederalTax += remaining * b.rate;
      remaining = 0;
      break;
    }
  }
  if (remaining > 0) {
    annualFederalTax += remaining * brackets[brackets.length - 1].rate;
  }

  const paycheckFederalWithholding = annualFederalTax / periodsPerYear;

  // Total deductions and net pay
  const totalDeductions = paycheckSsTax + paycheckMedTax + paycheckFederalWithholding;
  const netTakeHome = Math.max(0, grossPay - totalDeductions);

  const breakdowns = [
    {
      range: 'Gross Pay (Annualized)',
      rate: `${periodsPerYear} periods / year`,
      taxableAmountInSlab: annualGross,
      taxForSlab: annualGross,
    },
    {
      range: 'Standard Deduction (Annual)',
      rate: `Filing: ${status}`,
      taxableAmountInSlab: stdDeduction,
      taxForSlab: stdDeduction,
    },
    {
      range: 'Estimated Federal Tax (Annual)',
      rate: 'Slab Math',
      taxableAmountInSlab: annualTaxable,
      taxForSlab: Math.round(annualFederalTax),
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="paycheck_page_wrapper">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 text-gray-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">USA Paycheck Withholding Calculator</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Calculate net bi-weekly, semi-monthly or monthly paycheck take-home pay, FICA, and federal taxes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Parameters */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 rounded-2xl space-y-4">
          <h2 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <DollarSign size={14} className="text-blue-500" />
            Pay Period Details
          </h2>

          <div className="space-y-4">
            <ValidatedNumberInput
              id="paycheck_gross_amount"
              label="Gross Pay Per Pay Period"
              value={grossPay}
              onChange={setGrossPay}
              prefix="$"
              tooltip="Your salary amount before any federal, FICA, or optional deductions are subtracted."
            />

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                Pay Period Frequency
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'weekly', label: 'Weekly (52/yr)' },
                  { id: 'biweekly', label: 'Bi-Weekly (26/yr)' },
                  { id: 'semimonthly', label: 'Semi-Monthly (24/yr)' },
                  { id: 'monthly', label: 'Monthly (12/yr)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFrequency(f.id as Frequency)}
                    className={`py-2 px-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      frequency === f.id
                        ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                        : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                IRS Filing Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Single', 'MFJ', 'HoH'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatus(st as FilingStatus)}
                    className={`py-2 px-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      status === st
                        ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                        : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                    }`}
                  >
                    {st === 'MFJ' ? 'Married Joint' : st === 'HoH' ? 'Head of Household' : st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results layout */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 rounded-2xl space-y-6">
            <h2 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Estimated Paycheck Net</h2>

            <div className="p-4 bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-950/30 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-green-600 dark:text-green-400 tracking-wider">Net Take-Home Pay (Per Period)</span>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">$ {netTakeHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Wallet size={12} className="text-blue-500" />
                Withholding Deductions
              </h3>

              <div className="space-y-2.5">
                <div className="flex justify-between text-xs p-2.5 bg-slate-50/50 dark:bg-slate-950/30 rounded-lg">
                  <span className="text-gray-500 dark:text-slate-400 font-medium">Federal Income Tax:</span>
                  <span className="font-mono font-bold text-slate-850 dark:text-slate-100">$ {paycheckFederalWithholding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs p-2.5 bg-slate-50/50 dark:bg-slate-950/30 rounded-lg">
                  <span className="text-gray-500 dark:text-slate-400 font-medium">Social Security (6.2% FICA):</span>
                  <span className="font-mono font-bold text-slate-850 dark:text-slate-100">$ {paycheckSsTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs p-2.5 bg-slate-50/50 dark:bg-slate-950/30 rounded-lg">
                  <span className="text-gray-500 dark:text-slate-400 font-medium">Medicare (1.45% FICA):</span>
                  <span className="font-mono font-bold text-slate-850 dark:text-slate-100">$ {paycheckMedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 text-[10px] text-slate-400 leading-relaxed space-y-1">
              <p><strong>Filing:</strong> {status} status with standard deduction annualized at ${stdDeduction.toLocaleString()}.</p>
              <p><strong>Annualized Gross Salary:</strong> ${annualGross.toLocaleString()} for {periodsPerYear} pay periods.</p>
            </div>
          </div>

          <HowWeCalculate
            id="paycheck_calc"
            taxableIncome={annualTaxable}
            totalTax={annualFederalTax}
            currency="$"
            breakdowns={breakdowns}
          />
        </div>
      </div>
    </div>
  );
}
