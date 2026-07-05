/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Country, IndiaIncomeInputs, IndiaDeductions, UsaIncomeInputs, UsaAdjustments, UsaDeductions, UsaCredits, FilingStatus } from '../types';
import { calculateIndiaTax } from '../utils/indiaTaxCalculator';
import { calculateUsaTax } from '../utils/usaTaxCalculator';
import { INDIA_TAX_CONFIG } from '../config/taxConfigIndia';
import { USA_TAX_CONFIG } from '../config/taxConfigUSA';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Info, HelpCircle, ArrowRight, DollarSign, Percent, TrendingDown, ClipboardCheck, Wallet, ChevronDown, ChevronUp, FileCode, Calendar, AlertTriangle, Check, Award } from 'lucide-react';
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
        name: 'Federal Income',
        Amount: usaCalculated.federalTaxOnIncome,
      },
      {
        name: 'Capital Gains',
        Amount: usaCalculated.capitalGainsTax,
      },
      {
        name: 'Self-Employment',
        Amount: usaCalculated.selfEmploymentTax,
      },
      {
        name: 'State Estimate',
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

    // Add a divider line and a 2-line disclaimer at the bottom
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(24, 250, 186, 250);

    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('This is an estimate for informational purposes only and does not constitute tax, legal, or financial advice.', 24, 258);
    doc.text('Please consult a qualified tax professional before making any filing or financial decisions.', 24, 263);

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

  // --- ADVANCED BREAKDOWN CALCULATIONS ---
  // HRA Breakdown
  const hraBreakdown = useMemo(() => {
    if (country !== 'INDIA') return null;
    const basicDA = (indiaIncome.basicSalary || 0) + (indiaIncome.dearnessAllowance || 0);
    const hraReceived = indiaIncome.hra || 0;
    const rentPaid = rentPaidForHra || 0;
    const option1 = hraReceived;
    const option2 = Math.max(0, rentPaid - 0.1 * basicDA);
    const option3 = (isMetro ? 0.5 : 0.4) * basicDA;
    const exempt = rentPaid > 0 && basicDA > 0 ? Math.min(option1, option2, option3) : 0;
    return { basicDA, hraReceived, rentPaid, option1, option2, option3, exempt };
  }, [country, indiaIncome, rentPaidForHra, isMetro]);

  // Section 80C Sum Check
  const section80CSum = useMemo(() => {
    if (country !== 'INDIA') return 0;
    return (
      (indiaDeductions.ppf || 0) +
      (indiaDeductions.epf || 0) +
      (indiaDeductions.lifeInsurance || 0) +
      (indiaDeductions.elss || 0) +
      (indiaDeductions.nsc || 0) +
      (indiaDeductions.sukanyaSamriddhi || 0) +
      (indiaDeductions.taxSavingFd || 0) +
      (indiaDeductions.homeLoanPrincipal || 0) +
      (indiaDeductions.tuitionFees || 0) +
      (indiaDeductions.stampDuty || 0) +
      (indiaDeductions.npsEmployee80CCD1 || 0)
    );
  }, [country, indiaDeductions]);

  // Section 80D Limits
  const section80DLimits = useMemo(() => {
    if (country !== 'INDIA') return null;
    const selfLimit = indiaDeductions.isSeniorCitizen
      ? INDIA_TAX_CONFIG.deductions.section80D_SelfSeniorLimit
      : INDIA_TAX_CONFIG.deductions.section80D_SelfLimit;
    const parentLimit = indiaDeductions.healthPremiumParentsSenior
      ? INDIA_TAX_CONFIG.deductions.section80D_ParentSeniorLimit
      : INDIA_TAX_CONFIG.deductions.section80D_ParentLimit;
    const selfSpent = indiaDeductions.healthPremiumSelf || 0;
    const parentSpent = indiaDeductions.healthPremiumParents || 0;
    const preventive = Math.min(indiaDeductions.preventiveCheckup || 0, INDIA_TAX_CONFIG.deductions.section80D_PreventiveCap);

    const selfApplied = Math.min(selfSpent + preventive, selfLimit);
    const parentApplied = Math.min(parentSpent, parentLimit);
    return { selfLimit, parentLimit, selfSpent, parentSpent, preventive, selfApplied, parentApplied, total: selfApplied + parentApplied };
  }, [country, indiaDeductions]);

  // Section 80TTB Limits
  const savingsInterestLimit = useMemo(() => {
    if (country !== 'INDIA') return 10000;
    return indiaDeductions.isSeniorCitizen
      ? INDIA_TAX_CONFIG.deductions.section80TTB_Cap
      : INDIA_TAX_CONFIG.deductions.section80TTA_Cap;
  }, [country, indiaDeductions.isSeniorCitizen]);

  // USA Standard vs Itemized Components
  const usaDeductionBreakdown = useMemo(() => {
    if (country !== 'USA') return null;
    const baseStd = USA_TAX_CONFIG.standardDeductions[usaFilingStatus] || 16100;
    let extra65 = 0;
    if (usaDeductions.isSenior65Plus) {
      extra65 += USA_TAX_CONFIG.additionalDeduction65Plus[usaFilingStatus] || 2050;
    }
    if (usaDeductions.spouseSenior65Plus && (usaFilingStatus === 'MFJ' || usaFilingStatus === 'QSS')) {
      extra65 += USA_TAX_CONFIG.additionalDeduction65Plus[usaFilingStatus] || 1650;
    }

    // OBBBA Senior Deduction
    let numSeniors = 0;
    if (usaDeductions.isSenior65Plus) numSeniors++;
    if (usaDeductions.spouseSenior65Plus && (usaFilingStatus === 'MFJ' || usaFilingStatus === 'QSS')) numSeniors++;

    let obbbaDeduction = 0;
    if (numSeniors > 0) {
      const totalObbba = numSeniors * USA_TAX_CONFIG.obbbaSeniorDeduction.amountPerSenior;
      const threshold = USA_TAX_CONFIG.obbbaSeniorDeduction.phaseOutThreshold[usaFilingStatus] || 75000;
      if (usaCalculated.adjustedGrossIncome > threshold) {
        const excess = usaCalculated.adjustedGrossIncome - threshold;
        obbbaDeduction = Math.max(0, totalObbba - excess * USA_TAX_CONFIG.obbbaSeniorDeduction.phaseOutRate);
      } else {
        obbbaDeduction = totalObbba;
      }
    }

    const totalStd = baseStd + extra65 + obbbaDeduction;

    // Itemized
    const medicalFloor = usaCalculated.adjustedGrossIncome * 0.075;
    const medicalExempt = Math.max(0, (usaDeductions.medicalExpensesRaw || 0) - medicalFloor);
    const saltCap = usaFilingStatus === 'MFS' ? 20200 : 40400;
    const saltSpent = (usaDeductions.stateIncomeTax || 0) + (usaDeductions.realEstateTax || 0) + (usaDeductions.personalPropertyTax || 0);
    const saltExempt = Math.min(saltSpent, saltCap);
    const mortgage = (usaDeductions.mortgageInterestPrimary || 0) + (usaDeductions.mortgageInterestEquity || 0);
    const charity = Math.min(usaDeductions.charityCash || 0, usaCalculated.adjustedGrossIncome * 0.6) + Math.min(usaDeductions.charityAssets || 0, usaCalculated.adjustedGrossIncome * 0.3);
    const totalItemized = medicalExempt + saltExempt + mortgage + charity + (usaDeductions.casualtyLosses || 0) + (usaDeductions.otherItemized || 0) + obbbaDeduction;

    return { baseStd, extra65, obbbaDeduction, totalStd, medicalFloor, medicalExempt, saltCap, saltSpent, saltExempt, mortgage, charity, totalItemized };
  }, [country, usaDeductions, usaFilingStatus, usaCalculated]);

  // USA FICA Breakdown
  const usaFicaBreakdown = useMemo(() => {
    if (country !== 'USA') return null;
    const salary = (usaIncome.annualSalary || 0) + (usaIncome.bonusCommission || 0) + (usaIncome.overtime || 0);
    const ssLimit = USA_TAX_CONFIG.fica.socialSecurity.wageBaseLimit;
    
    // Employee FICA
    const employeeSS = Math.min(salary, ssLimit) * USA_TAX_CONFIG.fica.socialSecurity.employeeRate;
    const employeeMed = salary * USA_TAX_CONFIG.fica.medicare.employeeRate;
    const medThreshold = USA_TAX_CONFIG.fica.additionalMedicare.thresholds[usaFilingStatus] || 200000;
    const employeeAddMed = salary > medThreshold ? (salary - medThreshold) * USA_TAX_CONFIG.fica.additionalMedicare.rate : 0;
    const employeeTotal = employeeSS + employeeMed + employeeAddMed;

    // Employer FICA
    const employerSS = Math.min(salary, ssLimit) * USA_TAX_CONFIG.fica.socialSecurity.employerRate;
    const employerMed = salary * USA_TAX_CONFIG.fica.medicare.employerRate;
    const employerTotal = employerSS + employerMed;

    return { employeeSS, employeeMed, employeeAddMed, employeeTotal, employerSS, employerMed, employerTotal };
  }, [country, usaIncome, usaFilingStatus]);

  // Active US Bracket Highlight
  const activeFederalBracketIndex = useMemo(() => {
    if (country !== 'USA') return -1;
    const brackets = USA_TAX_CONFIG.federalBrackets[usaFilingStatus] || USA_TAX_CONFIG.federalBrackets.Single;
    const taxableOrdinary = Math.max(0, usaCalculated.taxableIncome - (usaIncome.ltcg || 0) - (usaIncome.ordinaryDividends || 0));
    
    let activeIdx = brackets.length - 1;
    let prevLimit = 0;
    for (let i = 0; i < brackets.length; i++) {
      if (taxableOrdinary <= brackets[i].limit) {
        activeIdx = i;
        break;
      }
    }
    return activeIdx;
  }, [country, usaCalculated, usaIncome, usaFilingStatus]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans" id="income_section_wrapper">
      {/* Left Column: Form Fields */}
      <div className="lg:col-span-7 space-y-6" id="form_container">
        
        {/* State/Status Header Controls */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
                <span>{country === 'INDIA' ? 'India Tax Config (FY 2025-26)' : 'US Tax Config (Tax Year 2026)'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Configure filing categories below. Slabs auto-adapt instantly.
              </p>
            </div>
            {country === 'INDIA' ? (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2 bg-white/70 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Senior Citizen (60+):</span>
                  <input
                    type="checkbox"
                    id="senior_chk"
                    checked={indiaDeductions.isSeniorCitizen}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setIndiaDeductions({ ...indiaDeductions, isSeniorCitizen: true, isSuperSeniorCitizen: false });
                      } else {
                        setIndiaDeductions({ ...indiaDeductions, isSeniorCitizen: false });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded bg-gray-50 border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-slate-800 dark:border-slate-700 cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-2 bg-white/70 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Super Senior (80+):</span>
                  <input
                    type="checkbox"
                    id="super_senior_chk"
                    checked={indiaDeductions.isSuperSeniorCitizen}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setIndiaDeductions({ ...indiaDeductions, isSuperSeniorCitizen: true, isSeniorCitizen: false });
                      } else {
                        setIndiaDeductions({ ...indiaDeductions, isSuperSeniorCitizen: false });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded bg-gray-50 border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-slate-800 dark:border-slate-700 cursor-pointer"
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
                    className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white text-slate-900 border-slate-200 focus:border-slate-400 focus:ring-0 focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 font-bold cursor-pointer transition-colors"
                  >
                    <option value="Single">Single</option>
                    <option value="MFJ">Married Filing Jointly (MFJ)</option>
                    <option value="MFS">Married Filing Separately (MFS)</option>
                    <option value="HoH">Head of Household</option>
                    <option value="QSS">Surviving Spouse (QSS)</option>
                  </select>
                </div>
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 mb-1">US Tax State</label>
                  <select
                    id="usa_state_select"
                    value={usaSelectedState}
                    onChange={(e) => setUsaSelectedState(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white text-slate-900 border-slate-200 focus:border-slate-400 focus:ring-0 focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 font-bold cursor-pointer transition-colors"
                  >
                    {USA_STATES.map(s => (
                      <option key={s.code} value={s.code}>{s.name}</option>
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
                <span className="flex items-center space-x-2">
                  <span>💼</span>
                  <span>1. Gross Salary Elements (Annual)</span>
                </span>
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
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center space-x-1">
                      <Percent size={12} />
                      <span>HRA Exemption Helper (Rent Paid)</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-950/20">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1" htmlFor="hra_rent_paid">Annual Rent Paid to Landlord (₹)</label>
                        <input
                          type="number"
                          id="hra_rent_paid"
                          value={rentPaidForHra || ''}
                          placeholder="e.g. 180000"
                          onChange={(e) => setRentPaidForHra(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm rounded-xl border bg-white text-gray-900 border-gray-200 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-3 pt-6">
                        <input
                          type="checkbox"
                          id="hra_metro_chk"
                          checked={isMetro}
                          onChange={(e) => setIsMetro(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded bg-gray-100 dark:bg-gray-700 cursor-pointer"
                        />
                        <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 cursor-pointer" htmlFor="hra_metro_chk">Metro City? (Delhi, Mumbai, Chennai, Kolkata)</label>
                      </div>

                      {/* HRA exemption breakdown output */}
                      {hraBreakdown && rentPaidForHra > 0 && (
                        <div className="sm:col-span-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 mt-2 p-3 rounded-lg bg-white/80 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <span className="block font-bold text-slate-700 dark:text-slate-300">Exemption Assessment:</span>
                          <div className="grid grid-cols-3 gap-2">
                            <div>• HRA Allowance: <span className="font-semibold text-slate-800 dark:text-slate-200">₹{hraBreakdown.option1.toLocaleString()}</span></div>
                            <div>• Rent - 10% Salary: <span className="font-semibold text-slate-800 dark:text-slate-200">₹{hraBreakdown.option2.toLocaleString()}</span></div>
                            <div>• {isMetro ? '50%' : '40%'} basic + DA: <span className="font-semibold text-slate-800 dark:text-slate-200">₹{hraBreakdown.option3.toLocaleString()}</span></div>
                          </div>
                          <div className="pt-1 text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 text-xs">
                            <Check size={14} />
                            <span>Tax-Exempt HRA (Old Regime only): ₹{hraBreakdown.exempt.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
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
                <span className="flex items-center space-x-2">
                  <span>🏠</span>
                  <span>2. Income from House Property</span>
                </span>
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
                <span className="flex items-center space-x-2">
                  <span>📈</span>
                  <span>3. Capital Gains, Business & Others</span>
                </span>
                {activeSection === 'other_heads' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeSection === 'other_heads' && (
                <div className="p-5 bg-white dark:bg-slate-900 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="STCG Stocks (Listed 20%) (₹)" id="in_stcg_st" val={indiaIncome.stcgStocks} onChange={(val) => handleIndiaIncomeChange('stcgStocks', val)} />
                    <InputField label="LTCG Stocks (Listed 12.5% >1.25L) (₹)" id="in_ltcg_st" val={indiaIncome.ltcgStocks} onChange={(val) => handleIndiaIncomeChange('ltcgStocks', val)} />
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
                <span className="flex items-center space-x-2">
                  <span>🛡️</span>
                  <span>4. India Deductions (Old Regime)</span>
                </span>
                {activeSection === 'deductions' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeSection === 'deductions' && (
                <div className="p-5 bg-white dark:bg-slate-900 space-y-6">
                  {/* Interactive Section 80C Checklist */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
                      <span>📝 Interactive Section 80C Checklist</span>
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${section80CSum >= 150000 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'}`}>
                        Total: ₹{section80CSum.toLocaleString()} / ₹1,50,000
                      </span>
                    </h4>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full mb-4 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${section80CSum >= 150000 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, (section80CSum / 150000) * 100)}%` }}
                      ></div>
                    </div>

                    {section80CSum >= 150000 && (
                      <div className="mb-3 flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/10 p-2.5 border border-emerald-100/50 dark:border-emerald-950/20 rounded-lg">
                        <Check size={14} />
                        <span>Maximum 80C threshold achieved (₹1,50,000)! Additional inputs will be capped.</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <InputField label="Public Provident Fund (PPF) (₹)" id="c_ppf" val={indiaDeductions.ppf} onChange={(val) => handleIndiaDeductionsChange('ppf', val)} />
                      <InputField label="Employee Provident Fund (EPF) (₹)" id="c_epf" val={indiaDeductions.epf} onChange={(val) => handleIndiaDeductionsChange('epf', val)} />
                      <InputField label="Life Insurance Premium (₹)" id="c_life" val={indiaDeductions.lifeInsurance} onChange={(val) => handleIndiaDeductionsChange('lifeInsurance', val)} />
                      <InputField label="Equity Linked Savings (ELSS) (₹)" id="c_elss" val={indiaDeductions.elss} onChange={(val) => handleIndiaDeductionsChange('elss', val)} />
                      <InputField label="National Savings Cert. (NSC) (₹)" id="c_nsc" val={indiaDeductions.nsc} onChange={(val) => handleIndiaDeductionsChange('nsc', val)} />
                      <InputField label="Sukanya Samriddhi (₹)" id="c_ssy" val={indiaDeductions.sukanyaSamriddhi} onChange={(val) => handleIndiaDeductionsChange('sukanyaSamriddhi', val)} />
                      <InputField label="Tax Saving 5-Yr FD (₹)" id="c_fd" val={indiaDeductions.taxSavingFd} onChange={(val) => handleIndiaDeductionsChange('taxSavingFd', val)} />
                      <InputField label="Home Loan Principal Repayment (₹)" id="c_homep" val={indiaDeductions.homeLoanPrincipal} onChange={(val) => handleIndiaDeductionsChange('homeLoanPrincipal', val)} />
                      <InputField label="Children's Tuition Fees (₹)" id="c_tuit" val={indiaDeductions.tuitionFees} onChange={(val) => handleIndiaDeductionsChange('tuitionFees', val)} />
                      <InputField label="Stamp Duty & Reg. Fees (₹)" id="c_stamp" val={indiaDeductions.stampDuty} onChange={(val) => handleIndiaDeductionsChange('stampDuty', val)} />
                      <InputField label="NPS Employee (80CCD(1)) (₹)" id="c_nps" val={indiaDeductions.npsEmployee80CCD1} onChange={(val) => handleIndiaDeductionsChange('npsEmployee80CCD1', val)} />
                    </div>
                  </div>

                  {/* Section 80D Health Section */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
                      <span>🛡️ Section 80D Health Insurance</span>
                      {section80DLimits && (
                        <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                          Applied: ₹{section80DLimits.total.toLocaleString()}
                        </span>
                      )}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <InputField label={`Self / Spouse / Children Premium (₹)`} id="ded_80d_self" val={indiaDeductions.healthPremiumSelf} onChange={(val) => handleIndiaDeductionsChange('healthPremiumSelf', val)} />
                        <span className="text-[10px] text-slate-400 font-medium block mt-1">Capped at ₹{indiaDeductions.isSeniorCitizen ? '50,000' : '25,000'}</span>
                      </div>
                      <div>
                        <InputField label="Parents Health Premium (₹)" id="ded_80d_parents" val={indiaDeductions.healthPremiumParents} onChange={(val) => handleIndiaDeductionsChange('healthPremiumParents', val)} />
                        <span className="text-[10px] text-slate-400 font-medium block mt-1">Capped at ₹{indiaDeductions.healthPremiumParentsSenior ? '50,000' : '25,000'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2.5 pt-2">
                        <input
                          type="checkbox"
                          id="ded_80d_parent_senior"
                          checked={indiaDeductions.healthPremiumParentsSenior}
                          onChange={(e) => handleIndiaDeductionsChange('healthPremiumParentsSenior', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded bg-gray-100 cursor-pointer"
                        />
                        <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 cursor-pointer" htmlFor="ded_80d_parent_senior">Parents are Senior Citizens (60+)?</label>
                      </div>

                      <InputField label="Preventive Health Checkup (₹)" id="ded_80d_preventive" val={indiaDeductions.preventiveCheckup} onChange={(val) => handleIndiaDeductionsChange('preventiveCheckup', val)} />
                    </div>
                  </div>

                  {/* Other standard deductions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Section 80CCD(1B) Extra NPS (₹)" id="ded_80ccd_nps" val={indiaDeductions.npsExtra80CCD1B} onChange={(val) => handleIndiaDeductionsChange('npsExtra80CCD1B', val)} />
                    <div>
                      <InputField 
                        label={indiaDeductions.isSeniorCitizen ? 'Section 80TTB Savings/Deposit Interest (₹)' : 'Section 80TTA Savings Interest (₹)'} 
                        id="ded_80tta_ttb" 
                        val={indiaDeductions.isSeniorCitizen ? (indiaDeductions.seniorInterest80TTB || 0) : (indiaDeductions.savingsInterest80TTA || 0)} 
                        onChange={(val) => handleIndiaDeductionsChange(indiaDeductions.isSeniorCitizen ? 'seniorInterest80TTB' : 'savingsInterest80TTA', val)} 
                      />
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">
                        Capped at ₹{savingsInterestLimit.toLocaleString()} ({indiaDeductions.isSeniorCitizen ? '80TTB Senior limit raised to ₹1L' : '80TTA General limit'})
                      </span>
                    </div>
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
                <span className="flex items-center space-x-2">
                  <span>💼</span>
                  <span>1. Joint USA Wages / Salary</span>
                </span>
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
                <span className="flex items-center space-x-2">
                  <span>📈</span>
                  <span>2. USA Investments / Business</span>
                </span>
                {activeSection === 'usa_invest' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeSection === 'usa_invest' && (
                <div className="p-5 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Interest Income ($)" id="us_interest" val={usaIncome.interestIncome} onChange={(val) => handleUsaIncomeChange('interestIncome', val)} />
                  <InputField label="Ordinary Dividends ($)" id="us_or_div" val={usaIncome.ordinaryDividends} onChange={(val) => handleUsaIncomeChange('ordinaryDividends', val)} />
                  <InputField label="Short-Term Capital Gains ($)" id="us_stcg" val={usaIncome.stcg} onChange={(val) => handleUsaIncomeChange('stcg', val)} />
                  <InputField label="Long-Term Capital Gains ($)" id="us_ltcg" val={usaIncome.ltcg} onChange={(val) => handleUsaIncomeChange('ltcg', val)} />
                  <InputField label="Schedule C Business Revenue ($)" id="us_bus_rev" val={usaIncome.businessRevenue} onChange={(val) => handleUsaIncomeChange('businessRevenue', val)} />
                  <InputField label="Schedule C Business Expenses ($)" id="us_bus_exp" val={usaIncome.businessExpenses} onChange={(val) => handleUsaIncomeChange('businessExpenses', val)} />
                </div>
              )}
            </div>

            {/* Above the line Adjustments */}
            <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 font-bold text-sm text-gray-900 dark:text-gray-100"
                onClick={() => setActiveSection(activeSection === 'usa_adjust' ? '' : 'usa_adjust')}
              >
                <span className="flex items-center space-x-2">
                  <span>🛡️</span>
                  <span>3. USA Pre-AGI Adjustments</span>
                </span>
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
                <span className="flex items-center space-x-2">
                  <span>⚖️</span>
                  <span>4. USA Deductions & Senior Toggles</span>
                </span>
                {activeSection === 'usa_ded' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeSection === 'usa_ded' && (
                <div className="p-5 bg-white dark:bg-slate-900 space-y-6">
                  {/* Senior 65+ check-boxes */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center space-x-1">
                      <Award size={14} className="text-blue-500" />
                      <span>Seniors Age 65+ Benefits (Standard & OBBBA)</span>
                    </h4>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          id="us_senior_chk"
                          checked={usaDeductions.isSenior65Plus || false}
                          onChange={(e) => handleUsaDeductionChange('isSenior65Plus', e.target.checked)}
                          className="w-4.5 h-4.5 text-blue-600 rounded bg-gray-100 border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 cursor-pointer" htmlFor="us_senior_chk">Taxpayer is 65 or older</label>
                      </div>

                      {(usaFilingStatus === 'MFJ' || usaFilingStatus === 'QSS') && (
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            id="us_spouse_senior_chk"
                            checked={usaDeductions.spouseSenior65Plus || false}
                            onChange={(e) => handleUsaDeductionChange('spouseSenior65Plus', e.target.checked)}
                            className="w-4.5 h-4.5 text-blue-600 rounded bg-gray-100 border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 cursor-pointer" htmlFor="us_spouse_senior_chk">Spouse is 65 or older</label>
                        </div>
                      )}
                    </div>

                    {usaDeductionBreakdown && usaDeductionBreakdown.obbbaDeduction > 0 && (
                      <div className="mt-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/10 p-3 border border-emerald-100/50 dark:border-emerald-950/20 rounded-lg">
                        <Check size={12} className="inline mr-1" />
                        <span>OBBBA Senior Deduction of ${usaDeductionBreakdown.obbbaDeduction.toLocaleString()} applied! (Phases out above $75k/$150k MAGI).</span>
                      </div>
                    )}
                  </div>

                  {/* Standard vs Itemized comparator */}
                  {usaDeductionBreakdown && (
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/40 dark:border-blue-950/20 text-center">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Total Standard Deduction</span>
                        <span className="block text-base font-black text-slate-800 dark:text-slate-200 mt-1">
                          ${usaDeductionBreakdown.totalStd.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Base + Age Extras</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Calculated Itemized</span>
                        <span className="block text-base font-black text-slate-800 dark:text-slate-200 mt-1">
                          ${usaDeductionBreakdown.totalItemized.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Based on custom fields</span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-blue-100/50 dark:border-blue-950/20 text-xs text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center space-x-1">
                        <Award size={14} />
                        <span>
                          Optimal Selection: {usaDeductionBreakdown.totalStd >= usaDeductionBreakdown.totalItemized ? 'Standard Deduction' : 'Itemized Deduction'} (+${Math.abs(usaDeductionBreakdown.totalStd - usaDeductionBreakdown.totalItemized).toLocaleString()})
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-xl">
                    <input
                      type="checkbox"
                      id="usa_itemise_toggle"
                      checked={usaDeductions.isItemized}
                      onChange={(e) => handleUsaDeductionChange('isItemized', e.target.checked)}
                      className="w-4.5 h-4.5 text-blue-600 rounded bg-gray-100 border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Enable Itemised Deductions Form</span>
                      <span className="text-[10px] text-slate-500">Enable to write custom mortgage, property, and charity values.</span>
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
                <span className="flex items-center space-x-2">
                  <span>🛡️</span>
                  <span>5. US Credits & Tax Reductions</span>
                </span>
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
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
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
                  label="Best Tax Payable"
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
                  label="Combined Effective Rate"
                  val={`${usaCalculated.effectiveTaxRate.toFixed(1)} %`}
                  subtext="Combined Fed & State"
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

          {/* --- USA SPECIFIC FED BRACKET VISUALIZER --- */}
          {country === 'USA' && (
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 mb-6">
              <h4 className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-3 flex items-center justify-between">
                <span>🇺🇸 Federal Marginal Bracket visual</span>
                <span className="text-blue-600 dark:text-blue-400 font-black">
                  Current: {USA_TAX_CONFIG.federalBrackets[usaFilingStatus]?.[activeFederalBracketIndex]?.rate * 100 || 10}%
                </span>
              </h4>
              
              <div className="space-y-1.5" id="federal_bracket_visual_path">
                {(USA_TAX_CONFIG.federalBrackets[usaFilingStatus] || USA_TAX_CONFIG.federalBrackets.Single).map((b, idx) => {
                  const isActive = idx === activeFederalBracketIndex;
                  return (
                    <div 
                      key={idx} 
                      className={`p-2 rounded-lg text-xs flex justify-between items-center transition-all duration-300 ${isActive ? 'bg-blue-500/15 border border-blue-500/30 text-blue-900 dark:text-blue-300 font-bold shadow-sm' : 'bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-900 text-slate-500'}`}
                    >
                      <span>{b.rate * 100}% Bracket</span>
                      <span>
                        {idx === 0 ? 'Up to' : `$${(USA_TAX_CONFIG.federalBrackets[usaFilingStatus][idx-1].limit + 1).toLocaleString()} to`} {b.limit === 999999999 ? 'Over' : `$${b.limit.toLocaleString()}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

        {/* --- US FICA BREAKDOWN TABLE --- */}
        {country === 'USA' && usaFicaBreakdown && (
          <div className="p-6 rounded-3xl border bg-white border-gray-200/60 shadow-lg dark:bg-slate-900 dark:border-slate-800/80">
            <h3 className="font-sans font-extrabold text-indigo-950 dark:text-white uppercase tracking-wider text-xs flex items-center space-x-2 mb-4">
              <Calendar size={18} className="text-violet-500" />
              <span>FICA Payroll Contribution Breakdown (2026)</span>
            </h3>
            <div className="text-xs space-y-3">
              <div className="grid grid-cols-3 font-bold border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-400">
                <span>Category</span>
                <span className="text-right">Employee</span>
                <span className="text-right">Employer</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500 dark:text-slate-400">Social Security (6.2%)</span>
                <span className="text-right font-semibold">${usaFicaBreakdown.employeeSS.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                <span className="text-right font-semibold">${usaFicaBreakdown.employerSS.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500 dark:text-slate-400">Medicare (1.45%)</span>
                <span className="text-right font-semibold">${usaFicaBreakdown.employeeMed.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                <span className="text-right font-semibold">${usaFicaBreakdown.employerMed.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              {usaFicaBreakdown.employeeAddMed > 0 && (
                <div className="grid grid-cols-3 text-red-600 dark:text-red-400 font-semibold">
                  <span>Add. Medicare (0.9%)</span>
                  <span className="text-right">${usaFicaBreakdown.employeeAddMed.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                  <span className="text-right">$0</span>
                </div>
              )}
              <div className="grid grid-cols-3 font-extrabold border-t border-slate-100 dark:border-slate-800 pt-3 text-slate-800 dark:text-slate-200">
                <span>Total FICA Bill</span>
                <span className="text-right text-blue-600 dark:text-blue-400">${usaFicaBreakdown.employeeTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                <span className="text-right">${usaFicaBreakdown.employerTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                * SS taxed on salary up to $184,500. Add. Medicare triggers over $200k/$250k.
              </p>
            </div>
          </div>
        )}

        {/* --- INDIA ADVANCE TAX & TDS CALENDAR TRACKER --- */}
        {country === 'INDIA' && (
          <div className="p-6 rounded-3xl border bg-white border-gray-200/60 shadow-lg dark:bg-slate-900 dark:border-slate-800/80">
            <h3 className="font-sans font-extrabold text-indigo-950 dark:text-white uppercase tracking-wider text-xs flex items-center space-x-2 mb-4">
              <Calendar size={18} className="text-indigo-500" />
              <span>TDS & Advance Tax Calendar Calendar</span>
            </h3>

            {/* Advance Tax Assessment */}
            {(() => {
              const netTax = indiaCalculated.betterRegime === 'new' ? indiaCalculated.newRegime.totalTaxPayable : indiaCalculated.oldRegime.totalTaxPayable;
              const isLiable = netTax >= 10000;
              return (
                <div className="space-y-4 text-xs">
                  {isLiable ? (
                    <div className="flex items-start space-x-2 p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/20 rounded-xl">
                      <AlertTriangle size={16} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-indigo-950 dark:text-indigo-300 block">Advance Tax Liability Detected</span>
                        <span className="text-[10px] text-indigo-700/80 dark:text-indigo-400/80">Since annual tax exceeds ₹10,000, you are legally required to make quarterly advance tax deposits to prevent S. 234C interest penalties (1% simple per month on shortfalls).</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-950/20 rounded-xl">
                      <Check size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-950 dark:text-emerald-300 block">No Advance Tax Liability</span>
                        <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">Annual tax is below ₹10,000. You are exempt from standard quarterly advance tax schedules.</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="block font-bold text-[10px] uppercase text-slate-400">Quarterly Schedule Breakdown</span>
                    
                    <div className="grid grid-cols-3 py-1 font-semibold text-slate-400 border-b border-slate-50 dark:border-slate-800 pb-1.5">
                      <span>Due Date</span>
                      <span className="text-right">Accumulated</span>
                      <span className="text-right">Est. Deposit</span>
                    </div>

                    <div className="grid grid-cols-3 py-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">June 15</span>
                      <span className="text-right font-medium text-slate-500">15%</span>
                      <span className="text-right font-extrabold text-slate-800 dark:text-slate-200">₹{(netTax * 0.15).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>

                    <div className="grid grid-cols-3 py-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">September 15</span>
                      <span className="text-right font-medium text-slate-500">45%</span>
                      <span className="text-right font-extrabold text-slate-800 dark:text-slate-200">₹{(netTax * 0.30).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>

                    <div className="grid grid-cols-3 py-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">December 15</span>
                      <span className="text-right font-medium text-slate-500">75%</span>
                      <span className="text-right font-extrabold text-slate-800 dark:text-slate-200">₹{(netTax * 0.30).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>

                    <div className="grid grid-cols-3 py-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">March 15</span>
                      <span className="text-right font-medium text-slate-500">100%</span>
                      <span className="text-right font-extrabold text-slate-800 dark:text-slate-200">₹{(netTax * 0.25).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
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
