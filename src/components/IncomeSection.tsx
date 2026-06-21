/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Country, IndiaIncomeInputs, IndiaDeductions, UsaIncomeInputs, UsaAdjustments, UsaDeductions, UsaCredits, FilingStatus } from '../types';
import { calculateIndiaTax } from '../utils/indiaTaxCalculator';
import { calculateUsaTax } from '../utils/usaTaxCalculator';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Info, HelpCircle, ArrowRight, DollarSign, Percent, TrendingDown, ClipboardCheck, Wallet, ChevronDown, ChevronUp, FileCode } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';

interface IncomeSectionProps {
  country: Country;
  indiaIncome: IndiaIncomeInputs;
  setIndiaIncome: (i: IndiaIncomeInputs) => void;
  indiaDeductions: IndiaDeductions;
  setIndiaDeductions: (d: IndiaDeductions) => void;
  usaIncome: UsaIncomeInputs;
  setUsaIncome: (i: UsaIncomeInputs) => void;
  usaAdjustments: UsaAdjustments;
  setUsaAdjustments: (a: UsaAdjustments) => void;
  usaDeductions: UsaDeductions;
  setUsaDeductions: (d: UsaDeductions) => void;
  usaCredits: UsaCredits;
  setUsaCredits: (c: UsaCredits) => void;
  usaSelectedState: string;
  setUsaSelectedState: (s: string) => void;
}

const USA_STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  Single: 14600,
  MFJ: 29200,
  MFS: 14600,
  HoH: 21900,
  QSS: 29200,
};

export default function IncomeSection({
  country,
  indiaIncome,
  setIndiaIncome,
  indiaDeductions,
  setIndiaDeductions,
  usaIncome,
  setUsaIncome,
  usaAdjustments,
  setUsaAdjustments,
  usaDeductions,
  setUsaDeductions,
  usaCredits,
  setUsaCredits,
  usaSelectedState,
  setUsaSelectedState,
}: IncomeSectionProps) {
  // Collapsible accordion tabs state
  const [activeSection, setActiveSection] = useState<string>('salary');
  const [rentPaidForHra, setRentPaidForHra] = useState<number>(0);
  const [isMetro, setIsMetro] = useState<boolean>(true);
  
  // Custom filing status state for USA
  const [usaFilingStatus, setUsaFilingStatus] = useState<FilingStatus>('Single');

  const currencySymbol = country === 'INDIA' ? '₹' : '$';

  // --- CALCULATION RESULTS ---
  const indiaCalculated = useMemo(() => {
    return calculateIndiaTax(indiaIncome, indiaDeductions, rentPaidForHra, isMetro);
  }, [indiaIncome, indiaDeductions, rentPaidForHra, isMetro]);

  // Adjust USA calculation setup
  const usaCalculated = useMemo(() => {
    // Feed the custom filing status by overriding state or temporary variable inside USA calc
    // Since filing status in state represents Single, we treat usaFilingStatus explicitly
    // Let's pass it via socialSecurityTaxablePct to fit the typing or adjust custom benefits
    const adjustedUsaIncome = {
      ...usaIncome,
      socialSecurityTaxablePct: usaFilingStatus === 'Single' ? 1 : usaFilingStatus === 'MFJ' ? 2 : usaFilingStatus === 'MFS' ? 3 : usaFilingStatus === 'HoH' ? 4 : 5
    };
    return calculateUsaTax(adjustedUsaIncome, usaAdjustments, usaDeductions, usaCredits, usaSelectedState);
  }, [usaIncome, usaAdjustments, usaDeductions, usaCredits, usaSelectedState, usaFilingStatus]);

  // --- CHART DATA GENERATION ---
  const pieData = useMemo(() => {
    if (country === 'INDIA') {
      const sal = indiaCalculated.newRegime.salaryHead;
      const hp = Math.max(0, indiaCalculated.newRegime.housePropertyHead);
      const bus = indiaCalculated.newRegime.businessHead;
      const cap = indiaCalculated.newRegime.capitalGainsHead;
      const other = indiaCalculated.newRegime.otherSourcesHead;

      return [
        { name: 'Salary (Net)', value: sal, color: '#3B82F6' },
        { name: 'House Property (Net)', value: hp, color: '#10B981' },
         { name: 'Business Profit', value: bus, color: '#F59E0B' },
        { name: 'Capital Gains', value: cap, color: '#EC4899' },
        { name: 'Other Sources', value: other, color: '#8B5CF6' },
      ].filter(item => item.value > 0);
    } else {
      const wages = (usaIncome.annualSalary || 0) + (usaIncome.bonusCommission || 0) + (usaIncome.overtime || 0);
      const investment = (usaIncome.interestIncome || 0) + (usaIncome.ordinaryDividends || 0) + (usaIncome.stcg || 0) + (usaIncome.ltcg || 0);
      const business = Math.max(0, (usaIncome.businessRevenue || 0) - (usaIncome.businessExpenses || 0));
      const retirement = (usaIncome.iraDistributions || 0) + (usaIncome.fourOhOneKDistributions || 0);
      const other = (usaIncome.rentalIncome || 0) + (usaIncome.otherIncome || 0);

      return [
        { name: 'Wages', value: wages, color: '#3B82F6' },
        { name: 'Investment', value: investment, color: '#10B981' },
        { name: 'Business', value: business, color: '#F59E0B' },
        { name: 'Retirement', value: retirement, color: '#EC4899' },
        { name: 'Others', value: other, color: '#8B5CF6' },
      ].filter(item => item.value > 0);
    }
  }, [country, indiaCalculated, usaIncome]);

  // Bar chart old vs new regime (India)
  const regimeComparisonBarData = useMemo(() => {
    if (country !== 'INDIA') return [];
    return [
      {
        name: 'Old Regime',
        Taxable: indiaCalculated.oldRegime.taxableIncome,
        TaxPayable: indiaCalculated.oldRegime.totalTaxPayable,
      },
      {
        name: 'New Regime',
        Taxable: indiaCalculated.newRegime.taxableIncome,
        TaxPayable: indiaCalculated.newRegime.totalTaxPayable,
      }
    ];
  }, [country, indiaCalculated]);

  // USA Tax Components chart
  const usaComponentsBarData = useMemo(() => {
    if (country !== 'USA') return [];
    return [
      {
        name: 'Federal Income Tax',
        Amount: usaCalculated.federalTaxOnIncome,
      },
      {
        name: 'Capital Gains Tax',
        Amount: usaCalculated.capitalGainsTax,
      },
      {
        name: 'Self-Employment Tax',
        Amount: usaCalculated.selfEmploymentTax,
      },
      {
        name: 'State Tax Estimate',
        Amount: usaCalculated.estimatedStateTax,
      }
    ];
  }, [country, usaCalculated]);

  // --- ACTIONS ---
  const handleIndiaIncomeChange = (field: keyof IndiaIncomeInputs, val: string) => {
    const num = parseFloat(val) || 0;
    setIndiaIncome({ ...indiaIncome, [field]: num });
  };

  const handleIndiaDeductionsChange = (field: keyof IndiaDeductions, val: string | boolean) => {
    if (typeof val === 'boolean') {
      setIndiaDeductions({ ...indiaDeductions, [field]: val });
    } else {
      const num = parseFloat(val) || 0;
      setIndiaDeductions({ ...indiaDeductions, [field]: num });
    }
  };

  const handleIndiaDeductionDropdown = (field: 'disability80DD' | 'medical80DDB' | 'disability80U', val: any) => {
    setIndiaDeductions({ ...indiaDeductions, [field]: val });
  };

  const handleUsaIncomeChange = (field: keyof UsaIncomeInputs, val: string) => {
    const num = parseFloat(val) || 0;
    setUsaIncome({ ...usaIncome, [field]: num });
  };

  const handleUsaAdjustmentChange = (field: keyof UsaAdjustments, val: string) => {
    const num = parseFloat(val) || 0;
    setUsaAdjustments({ ...usaAdjustments, [field]: num });
  };

  const handleUsaDeductionChange = (field: keyof UsaDeductions, val: string | boolean) => {
    if (typeof val === 'boolean') {
      setUsaDeductions({ ...usaDeductions, [field]: val });
    } else {
      const num = parseFloat(val) || 0;
      setUsaDeductions({ ...usaDeductions, [field]: num });
    }
  };

  const handleUsaCreditChange = (field: keyof UsaCredits, val: string) => {
    const num = parseFloat(val) || 0;
    setUsaCredits({ ...usaCredits, [field]: num });
  };

  // Export PDF function
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('TAXCALC PRO SUMMARY REPORT', 24, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString()} | Jurisdiction: ${country}`, 24, 32);
    
    doc.setDrawColor(241, 245, 249);
    doc.line(24, 38, 186, 38);

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Tax Head Breakdown', 24, 48);

    doc.setFontSize(10);
    if (country === 'INDIA') {
      const r = indiaCalculated.betterRegime === 'new' ? indiaCalculated.newRegime : indiaCalculated.oldRegime;
      const data = [
        ['Total Gross Family Income', `${currencySymbol} ${r.grossTotalIncome.toLocaleString()}`],
        ['Heads of Salary Received', `${currencySymbol} ${r.salaryHead.toLocaleString()}`],
        ['House Property Net Value', `${currencySymbol} ${r.housePropertyHead.toLocaleString()}`],
        ['Business & Professional Profits', `${currencySymbol} ${r.businessHead.toLocaleString()}`],
        ['Capital Asset Gains (Stocks/MF)', `${currencySymbol} ${r.capitalGainsHead.toLocaleString()}`],
        ['Section Exemptions & Deductions', `${currencySymbol} ${r.totalDeductionsValue.toLocaleString()}`],
        ['Calculated Taxable Net', `${currencySymbol} ${r.taxableIncome.toLocaleString()}`],
        ['Total Tax + Cess Liability', `${currencySymbol} ${r.totalTaxPayable.toLocaleString()}`],
        ['Effective Percentage Rate', `${r.effectiveTaxRate.toFixed(2)} %`],
        ['Est Take-Home Pay (Annual)', `${currencySymbol} ${r.takeHomeAnnual.toLocaleString()}`],
      ];

      let y = 58;
      data.forEach(([label, val]) => {
        doc.text(label, 26, y);
        doc.text(val, 140, y);
        y += 8;
      });

      doc.setFontSize(11);
      doc.setFont('Helvetica', 'bold');
      doc.text(`Recommended Regime: ${indiaCalculated.betterRegime.toUpperCase()} REGIME`, 24, y + 10);
      doc.text(`Regime Benefit Savings: ${currencySymbol} ${indiaCalculated.taxSavings.toLocaleString()}`, 24, y + 18);
    } else {
      const res = usaCalculated;
      const data = [
        ['Joint Gross USA Wages', `${currencySymbol} ${res.grossIncome.toLocaleString()}`],
        ['Above-the-Line Adjustments', `${currencySymbol} ${res.totalAdjustments.toLocaleString()}`],
        ['Adjusted Gross Income (AGI)', `${currencySymbol} ${res.adjustedGrossIncome.toLocaleString()}`],
        ['Standard/Itemised Deduction', `${currencySymbol} ${res.standardOrItemizedDeductionValue.toLocaleString()}`],
        ['Taxable Income Basis', `${currencySymbol} ${res.taxableIncome.toLocaleString()}`],
        ['Calculated Federal Tax', `${currencySymbol} ${res.federalTaxOnIncome.toLocaleString()}`],
        ['Earned Investment (NIIT)', `${currencySymbol} ${res.niitTax.toLocaleString()}`],
        ['Estimated State Liability', `${currencySymbol} ${res.estimatedStateTax.toLocaleString()}`],
        ['Total US Tax Bill', `${currencySymbol} ${res.totalTaxLiability.toLocaleString()}`],
        ['Effective Rate', `${res.effectiveTaxRate.toFixed(2)} %`],
      ];

      let y = 58;
      data.forEach(([label, val]) => {
        doc.text(label, 26, y);
        doc.text(val, 140, y);
        y += 8;
      });
    }

    doc.save(`TaxCalcPro_${country}_Summary.pdf`);
  };

  const USA_STATES = [
    { code: 'CA', name: 'California (Progressive Max 13.3%)' },
    { code: 'NY', name: 'New York (Progressive Max 10.9%)' },
    { code: 'TX', name: 'Texas (0% State Tax)' },
    { code: 'FL', name: 'Florida (0% State Tax)' },
    { code: 'WA', name: 'Washington (0% State Tax)' },
    { code: 'IL', name: 'Illinois (4.95% Flat)' },
    { code: 'PA', name: 'Pennsylvania (3.07% Flat)' },
    { code: 'MA', name: 'Massachusetts (5.00% Flat)' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans" id="income_section_wrapper">
      {/* Left Column: Form Fields */}
      <div className="lg:col-span-7 space-y-6" id="form_container">
        
        {/* State/Status Header Controls */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {country === 'INDIA' ? 'India Tax Parameters' : 'US Tax Parameters'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Configure filing categories below. Slabs auto-adapt instantly.
              </p>
            </div>
            {country === 'INDIA' ? (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2 bg-white/70 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Senior Citizen:</span>
                  <input
                    type="checkbox"
                    id="senior_chk"
                    checked={indiaDeductions.isSeniorCitizen}
                    onChange={(e) => handleIndiaDeductionsChange('isSeniorCitizen', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded bg-gray-50 border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div className="flex items-center space-x-2 bg-white/70 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Super Senior (80+):</span>
                  <input
                    type="checkbox"
                    id="super_senior_chk"
                    checked={indiaDeductions.isSuperSeniorCitizen}
                    onChange={(e) => handleIndiaDeductionsChange('isSuperSeniorCitizen', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded bg-gray-50 border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 mb-1">Filing Status</label>
                  <select
                    id="usa_filing_status_select"
                    value={usaFilingStatus}
                    onChange={(e) => setUsaFilingStatus(e.target.value as FilingStatus)}
                    className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white text-slate-900 border-slate-200 focus:border-slate-400 focus:ring-0 focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 font-bold transition-colors"
                  >
                    <option value="Single" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Single</option>
                    <option value="MFJ" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Married Filing Jointly (MFJ)</option>
                    <option value="MFS" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Married Filing Separately (MFS)</option>
                    <option value="HoH" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Head of Household</option>
                    <option value="QSS" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Surviving Spouse (QSS)</option>
                  </select>
                </div>
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 mb-1">US Tax State</label>
                  <select
                    id="usa_state_select"
                    value={usaSelectedState}
                    onChange={(e) => setUsaSelectedState(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white text-slate-900 border-slate-200 focus:border-slate-400 focus:ring-0 focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 font-bold transition-colors"
                  >
                    {USA_STATES.map(s => (
                      <option key={s.code} value={s.code} className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- INDIA INPUT accordion --- */}
        {country === 'INDIA' && (
          <div className="space-y-4" id="india_inputs_accordion">
            {/* Salary inputs Card */}
            <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 font-bold text-sm text-gray-900 dark:text-gray-100"
                onClick={() => setActiveSection(activeSection === 'salary' ? '' : 'salary')}
              >
                <span>💼 1. Gross Salary Elements (Annual)</span>
                {activeSection === 'salary' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeSection === 'salary' && (
                <div className="p-5 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Basic Salary (₹)" id="in_basic" val={indiaIncome.basicSalary} onChange={(val) => handleIndiaIncomeChange('basicSalary', val)} />
                  <InputField label="Dearness Allowance (DA) (₹)" id="in_da" val={indiaIncome.dearnessAllowance} onChange={(val) => handleIndiaIncomeChange('dearnessAllowance', val)} />
                  <InputField label="HRA (₹)" id="in_hra" val={indiaIncome.hra} onChange={(val) => handleIndiaIncomeChange('hra', val)} />
                  <InputField label="Transport Allowance (₹)" id="in_transport" val={indiaIncome.transportAllowance} onChange={(val) => handleIndiaIncomeChange('transportAllowance', val)} />
                  <InputField label="Medical Allowance (₹)" id="in_medical" val={indiaIncome.medicalAllowance} onChange={(val) => handleIndiaIncomeChange('medicalAllowance', val)} />
                  <InputField label="Bonus & Ex-Gratia (₹)" id="in_bonus" val={indiaIncome.bonus} onChange={(val) => handleIndiaIncomeChange('bonus', val)} />
                  <InputField label="Leave Encashment (₹)" id="in_leave" val={indiaIncome.leaveEncashment} onChange={(val) => handleIndiaIncomeChange('leaveEncashment', val)} />
                  <InputField label="Other Allowances (₹)" id="in_other_allow" val={indiaIncome.otherAllowances} onChange={(val) => handleIndiaIncomeChange('otherAllowances', val)} />
                  
                  {/* HRA helper calculator */}
                  <div className="sm:col-span-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-2">HRA Exemption Helper (Rent Paid)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Annual Rent Paid to Landlord</label>
                        <input
                          type="number"
                          id="hra_rent_paid"
                          value={rentPaidForHra || ''}
                          placeholder="e.g. 180000"
                          onChange={(e) => setRentPaidForHra(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-3 pt-[22px]">
                        <label className="text-xs font-semibold text-gray-600 dark:text-slate-400">Metro City? (Delhi, Mumbai, etc.)</label>
                        <input
                          type="checkbox"
                          id="hra_metro_chk"
                          checked={isMetro}
                          onChange={(e) => setIsMetro(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded bg-gray-100 dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* House Property inputs Card */}
            <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 font-bold text-sm text-gray-900 dark:text-gray-100"
                onClick={() => setActiveSection(activeSection === 'property' ? '' : 'property')}
              >
                <span>🏠 2. Income from House Property</span>
                {activeSection === 'property' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeSection === 'property' && (
                <div className="p-5 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Annual Gross Rental Received (₹)" id="in_rent" val={indiaIncome.rentalIncome} onChange={(val) => handleIndiaIncomeChange('rentalIncome', val)} />
                  <InputField label="Municipal Taxes Paid (₹)" id="in_muni" val={indiaIncome.municipalTaxes} onChange={(val) => handleIndiaIncomeChange('municipalTaxes', val)} />
                  <InputField label="Interest on Housing Loan (S.24) (₹)" id="in_home_interest" val={indiaIncome.homeLoanInterest} onChange={(val) => handleIndiaIncomeChange('homeLoanInterest', val)} />
                </div>
              )}
            </div>

            {/* Other Heads: Capital gains & Business Card */}
            <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 font-bold text-sm text-gray-900 dark:text-gray-100"
                onClick={() => setActiveSection(activeSection === 'other_heads' ? '' : 'other_heads')}
              >
                <span>📈 3. Capital Gains, Business & Others</span>
                {activeSection === 'other_heads' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeSection === 'other_heads' && (
                <div className="p-5 bg-white dark:bg-slate-900 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="STCG Stocks (15% Slab) (₹)" id="in_stcg_st" val={indiaIncome.stcgStocks} onChange={(val) => handleIndiaIncomeChange('stcgStocks', val)} />
                    <InputField label="LTCG Stocks (10% exceeding 1.25L) (₹)" id="in_ltcg_st" val={indiaIncome.ltcgStocks} onChange={(val) => handleIndiaIncomeChange('ltcgStocks', val)} />
                    <InputField label="Business Receipts/Revenue (₹)" id="in_bus_rec" val={indiaIncome.businessReceipts} onChange={(val) => handleIndiaIncomeChange('businessReceipts', val)} />
                    <InputField label="Business Expenses (₹)" id="in_bus_exp" val={indiaIncome.businessExpenses} onChange={(val) => handleIndiaIncomeChange('businessExpenses', val)} />
                    <InputField label="Savings, deposit interest (₹)" id="in_oth_int" val={indiaIncome.interestIncome} onChange={(val) => handleIndiaIncomeChange('interestIncome', val)} />
                    <InputField label="Dividend Income (₹)" id="in_oth_div" val={indiaIncome.dividendIncome} onChange={(val) => handleIndiaIncomeChange('dividendIncome', val)} />
                  </div>
                </div>
              )}
            </div>

            {/* Deductions Card (Old tax regime only) */}
            <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 font-bold text-sm text-gray-900 dark:text-gray-100"
                onClick={() => setActiveSection(activeSection === 'deductions' ? '' : 'deductions')}
              >
                <span>🛡️ 4. India Deductions (Old Regime)</span>
                {activeSection === 'deductions' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeSection === 'deductions' && (
                <div className="p-5 bg-white dark:bg-slate-900 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Section 80C PPF, EPF, Life Premium (₹)" id="ded_80c_tot" val={indiaDeductions.ppf} onChange={(val) => handleIndiaDeductionsChange('ppf', val)} />
                    <InputField label="Section 80C Tuition Fees (₹)" id="ded_80c_tuit" val={indiaDeductions.tuitionFees} onChange={(val) => handleIndiaDeductionsChange('tuitionFees', val)} />
                    <InputField label="Section 80C Home Loan Principal (₹)" id="ded_80c_homep" val={indiaDeductions.homeLoanPrincipal} onChange={(val) => handleIndiaDeductionsChange('homeLoanPrincipal', val)} />
                    <InputField label="Section 80D Health Premium (Self) (₹)" id="ded_80d_self" val={indiaDeductions.healthPremiumSelf} onChange={(val) => handleIndiaDeductionsChange('healthPremiumSelf', val)} />
                    <InputField label="Section 80D Premium (Parents) (₹)" id="ded_80d_parents" val={indiaDeductions.healthPremiumParents} onChange={(val) => handleIndiaDeductionsChange('healthPremiumParents', val)} />
                    
                    <div className="flex items-center space-x-2 pt-5">
                      <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">Parents Senior Citizen?</span>
                      <input
                        type="checkbox"
                        id="ded_80d_parent_senior"
                        checked={indiaDeductions.healthPremiumParentsSenior}
                        onChange={(e) => handleIndiaDeductionsChange('healthPremiumParentsSenior', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded bg-gray-100"
                      />
                    </div>

                    <InputField label="Section 80CCD(1B) Extra NPS (₹)" id="ded_80ccd_nps" val={indiaDeductions.npsExtra80CCD1B} onChange={(val) => handleIndiaDeductionsChange('npsExtra80CCD1B', val)} />
                    <InputField label="Section 80DDB Medical Treatment (₹)" id="ded_80ddb" val={indiaDeductions.medical80DDB === 'senior' ? 100000 : 40000} onChange={(val) => handleIndiaDeductionsChange('medical80DDB', val)} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- US INPUT accordion --- */}
        {country === 'USA' && (
          <div className="space-y-4" id="usa_inputs_accordion">
            {/* Wages and Salary Card */}
            <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 font-bold text-sm text-gray-900 dark:text-gray-100"
                onClick={() => setActiveSection(activeSection === 'usa_salary' ? '' : 'usa_salary')}
              >
                <span>💼 1. Joint USA Wages / Salary</span>
                {activeSection === 'usa_salary' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeSection === 'usa_salary' && (
                <div className="p-5 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Annual Gross Base Salary ($)" id="us_sal" val={usaIncome.annualSalary} onChange={(val) => handleUsaIncomeChange('annualSalary', val)} />
                  <InputField label="Bonus & Commission Received ($)" id="us_bonus" val={usaIncome.bonusCommission} onChange={(val) => handleUsaIncomeChange('bonusCommission', val)} />
                  <InputField label="Overtime Wages Earned ($)" id="us_overtime" val={usaIncome.overtime} onChange={(val) => handleUsaIncomeChange('overtime', val)} />
                  <InputField label="Other Wages ($)" id="us_oth_wages" val={usaIncome.otherWages} onChange={(val) => handleUsaIncomeChange('otherWages', val)} />
                </div>
              )}
            </div>

            {/* Investments Card */}
            <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 font-bold text-sm text-gray-900 dark:text-gray-100"
                onClick={() => setActiveSection(activeSection === 'usa_invest' ? '' : 'usa_invest')}
              >
                <span>📈 2. USA Investments / Business</span>
                {activeSection === 'usa_invest' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeSection === 'usa_invest' && (
                <div className="p-5 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Interest Income ($)" id="us_interest" val={usaIncome.interestIncome} onChange={(val) => handleUsaIncomeChange('interestIncome', val)} />
                  <InputField label="Ordinary Dividends ($)" id="us_or_div" val={usaIncome.ordinaryDividends} onChange={(val) => handleUsaIncomeChange('ordinaryDividends', val)} />
                  <InputField label="Short-Term Capital Gains ($)" id="us_stcg" val={usaIncome.stcg} onChange={(val) => handleUsaIncomeChange('stcg', val)} />
                  <InputField label="Long-Term Capital Gains ($)" id="us_ltcg" val={usaIncome.ltcg} onChange={(val) => handleUsaIncomeChange('ltcg', val)} />
                  <InputField label="Schedule C Business revenue ($)" id="us_bus_rev" val={usaIncome.businessRevenue} onChange={(val) => handleUsaIncomeChange('businessRevenue', val)} />
                  <InputField label="Schedule C Business expenses ($)" id="us_bus_exp" val={usaIncome.businessExpenses} onChange={(val) => handleUsaIncomeChange('businessExpenses', val)} />
                </div>
              )}
            </div>

            {/* Above the line Adjustments */}
            <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 font-bold text-sm text-gray-900 dark:text-gray-100"
                onClick={() => setActiveSection(activeSection === 'usa_adjust' ? '' : 'usa_adjust')}
              >
                <span>🛡️ 3. USA Pre-AGI Adjustments</span>
                {activeSection === 'usa_adjust' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeSection === 'usa_adjust' && (
                <div className="p-5 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Traditional IRA Contribution ($)" id="us_adj_ira" val={usaAdjustments.iraDeduction} onChange={(val) => handleUsaAdjustmentChange('iraDeduction', val)} />
                  <InputField label="Student Loan Interest paid ($)" id="us_adj_student" val={usaAdjustments.studentLoanInterest} onChange={(val) => handleUsaAdjustmentChange('studentLoanInterest', val)} />
                  <InputField label="Health Savings Account (HSA) ($)" id="us_adj_hsa" val={usaAdjustments.hsaDeduction} onChange={(val) => handleUsaAdjustmentChange('hsaDeduction', val)} />
                  <InputField label="SE Health Insurance Premium ($)" id="us_adj_health" val={usaAdjustments.seHealthInsurance} onChange={(val) => handleUsaAdjustmentChange('seHealthInsurance', val)} />
                </div>
              )}
            </div>

            {/* Itemized vs Standard Deductions Card */}
            <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 font-bold text-sm text-gray-900 dark:text-gray-100"
                onClick={() => setActiveSection(activeSection === 'usa_ded' ? '' : 'usa_ded')}
              >
                <span>⚖️ 4. USA Deductions (Standard vs Itemised)</span>
                {activeSection === 'usa_ded' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeSection === 'usa_ded' && (
                <div className="p-5 bg-white dark:bg-slate-900 space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                    <input
                      type="checkbox"
                      id="usa_itemise_toggle"
                      checked={usaDeductions.isItemized}
                      onChange={(e) => handleUsaDeductionChange('isItemized', e.target.checked)}
                      className="w-4.5 h-4.5 text-blue-600 rounded bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block">Enable Itemised Deductions</span>
                      <span className="text-[10px] text-blue-700/80 dark:text-blue-400/80">Recommended only if total is &gt; standard deduction ({currencySymbol}{USA_STANDARD_DEDUCTIONS[usaFilingStatus] ? USA_STANDARD_DEDUCTIONS[usaFilingStatus].toLocaleString() : '14,600'})</span>
                    </div>
                  </div>
                  {usaDeductions.isItemized && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <InputField label="Qualifying Medical Expenses ($)" id="us_item_med" val={usaDeductions.medicalExpensesRaw} onChange={(val) => handleUsaDeductionChange('medicalExpensesRaw', val)} />
                      <InputField label="State & Local Income Tax (SALT) ($)" id="us_item_salt" val={usaDeductions.stateIncomeTax} onChange={(val) => handleUsaDeductionChange('stateIncomeTax', val)} />
                      <InputField label="Real Estate / Property Taxes ($)" id="us_item_real" val={usaDeductions.realEstateTax} onChange={(val) => handleUsaDeductionChange('realEstateTax', val)} />
                      <InputField label="Mortgage Interest Primary ($)" id="us_item_mort" val={usaDeductions.mortgageInterestPrimary} onChange={(val) => handleUsaDeductionChange('mortgageInterestPrimary', val)} />
                      <InputField label="Charitable Cash Collections ($)" id="us_item_char" val={usaDeductions.charityCash} onChange={(val) => handleUsaDeductionChange('charityCash', val)} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* US Credits Card */}
            <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 font-bold text-sm text-gray-900 dark:text-gray-100"
                onClick={() => setActiveSection(activeSection === 'usa_cred' ? '' : 'usa_cred')}
              >
                <span>🛡️ 5. US Credits & Tax Reductions</span>
                {activeSection === 'usa_cred' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeSection === 'usa_cred' && (
                <div className="p-5 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Number of Qualifying Kids (CTC)" id="us_cred_kids" val={usaCredits.numQualifyingChildren} onChange={(val) => handleUsaCreditChange('numQualifyingChildren', val)} />
                  <InputField label="Residential Clean Energy Credit ($)" id="us_cred_solar" val={usaCredits.residentialCleanEnergy} onChange={(val) => handleUsaCreditChange('residentialCleanEnergy', val)} />
                  <InputField label="Lifetime Learning/Education ($)" id="us_cred_edu" val={usaCredits.lifetimeLearning} onChange={(val) => handleUsaCreditChange('lifetimeLearning', val)} />
                  <InputField label="Savers Retirement Credit ($)" id="us_cred_sav" val={usaCredits.saversCredit} onChange={(val) => handleUsaCreditChange('saversCredit', val)} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Calculations & Interactive Layout */}
      <div className="lg:col-span-5 space-y-6" id="output_panel">

        {/* Dashboard Card */}
        <div className="p-6 rounded-3xl border bg-white border-gray-200/60 shadow-lg dark:bg-slate-900 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-sans font-extrabold text-indigo-950 dark:text-white uppercase tracking-wider text-xs flex items-center space-x-2">
              <ClipboardCheck size={18} className="text-blue-500" />
              <span>Liability Dashboard</span>
            </h3>
            <button
              id="export_report_btn"
              onClick={handleExportPDF}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <FileCode size={14} />
              <span>Export PDF</span>
            </button>
          </div>

          {/* Core metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {country === 'INDIA' ? (
              <>
                <MetricBox
                  label="Best Tax Payable (Cess incl.)"
                  val={`${currencySymbol} ${(indiaCalculated.betterRegime === 'new' ? indiaCalculated.newRegime.totalTaxPayable : indiaCalculated.oldRegime.totalTaxPayable).toLocaleString()}`}
                  isHighlight
                />
                <MetricBox
                  label="Regime Savings"
                  val={`${currencySymbol} ${indiaCalculated.taxSavings.toLocaleString()}`}
                  subtext={`Old vs New Regime`}
                  isPositive={indiaCalculated.taxSavings > 0}
                />
                <MetricBox
                  label="Effective Tax Rate"
                  val={`${(indiaCalculated.betterRegime === 'new' ? indiaCalculated.newRegime.effectiveTaxRate : indiaCalculated.oldRegime.effectiveTaxRate).toFixed(1)} %`}
                />
                <MetricBox
                  label="Est Monthly Take-Home"
                  val={`${currencySymbol} ${(indiaCalculated.betterRegime === 'new' ? indiaCalculated.newRegime.takeHomeMonthly : indiaCalculated.oldRegime.takeHomeMonthly).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
              </>
            ) : (
              <>
                <MetricBox
                  label="US Joint Tax Bill"
                  val={`${currencySymbol} ${usaCalculated.totalTaxLiability.toLocaleString()}`}
                  isHighlight
                />
                <MetricBox
                  label="Effective Marginal Rate"
                  val={`${usaCalculated.effectiveTaxRate.toFixed(1)} %`}
                  subtext="Combined Federal & State"
                />
                <MetricBox
                  label="Adjusted Gross (AGI)"
                  val={`${currencySymbol} ${usaCalculated.adjustedGrossIncome.toLocaleString()}`}
                />
                <MetricBox
                  label="Deduction Applied"
                  val={`${currencySymbol} ${usaCalculated.standardOrItemizedDeductionValue.toLocaleString()}`}
                  subtext={usaCalculated.usingItemized ? 'Itemised' : 'Standard'}
                />
              </>
            )}
          </div>

          {/* Interactive visualizer */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
            <h4 className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-4">Income Sources Mix</h4>
            <div className="h-[210px] w-full" id="pie_chart_container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
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
                  <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {country === 'INDIA' && (
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
              <h4 className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-4">Old vs New Regime Comparisons</h4>
              <div className="h-[180px] w-full" id="bar_chart_container_india">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regimeComparisonBarData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
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
                    <Bar dataKey="TaxPayable" name="Tax Burden" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {country === 'USA' && (
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
              <h4 className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-4">USA Tax Components Distribution ($)</h4>
              <div className="h-[180px] w-full" id="bar_chart_container_usa">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usaComponentsBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 9, fontWeight: 'bold' }} />
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
                    <Bar dataKey="Amount" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub components helper
interface InputFieldProps {
  label: string;
  id: string;
  val: number;
  onChange: (val: string) => void;
}

function InputField({ label, id, val, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1" htmlFor={id}>{label}</label>
      <input
        type="number"
        id={id}
        value={val === 0 ? '' : val}
        placeholder="0"
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:bg-slate-900 transition-all outline-none"
      />
    </div>
  );
}

interface MetricBoxProps {
  label: string;
  val: string;
  subtext?: string;
  isHighlight?: boolean;
  isPositive?: boolean;
}

function MetricBox({ label, val, subtext, isHighlight, isPositive }: MetricBoxProps) {
  let containerBg = 'bg-gray-50/50 border-gray-200 dark:bg-slate-800/40 dark:border-slate-800';
  if (isHighlight) {
    containerBg = 'bg-blue-600 border-blue-500 dark:bg-blue-600 dark:border-blue-500';
  }

  return (
    <div className={`p-4 rounded-2xl border ${containerBg}`}>
      <span className={`block text-[10px] font-bold uppercase tracking-wider ${isHighlight ? 'text-white/80' : 'text-gray-400'}`}>
        {label}
      </span>
      <span className={`block text-lg font-black tracking-tight mt-1 ${isHighlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
        {val}
      </span>
      {subtext && (
        <span className={`text-[10px] block mt-1 font-semibold ${isHighlight ? 'text-white/60' : 'text-gray-400'}`}>
          {subtext}
        </span>
      )}
      {isPositive !== undefined && isPositive && (
        <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
          Optimal Choice
        </span>
      )}
    </div>
  );
}
