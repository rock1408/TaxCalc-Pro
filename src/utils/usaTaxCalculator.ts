/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UsaIncomeInputs, UsaAdjustments, UsaDeductions, UsaCredits, UsaTaxResult, FilingStatus } from '../types';

export function calculateUsaTax(
  income: UsaIncomeInputs,
  adjustments: UsaAdjustments,
  deductions: UsaDeductions,
  credits: UsaCredits,
  selectedState: string = 'CA'
): UsaTaxResult {
  // 1. Calculate Gross Income
  const wages =
    (income.annualSalary || 0) +
    (income.bonusCommission || 0) +
    (income.overtime || 0) +
    (income.tips || 0) +
    (income.otherWages || 0);

  const netBusinessIncome = Math.max(0, (income.businessRevenue || 0) - (income.businessExpenses || 0));

  const investmentIncome =
    (income.interestIncome || 0) +
    (income.ordinaryDividends || 0) +
    (income.stcg || 0) +
    (income.ltcg || 0) +
    (income.otherInvestments || 0);

  const retirementIncome =
    (income.iraDistributions || 0) +
    (income.fourOhOneKDistributions || 0) +
    (income.pensionIncome || 0) +
    (income.socialSecurityBenefits || 0) * ((income.socialSecurityTaxablePct || 85) / 100);

  const otherIncomeSum =
    (income.rentalIncome || 0) +
    (income.royalties || 0) +
    (income.unemploymentComp || 0) +
    (income.alimonyReceived || 0) +
    (income.otherIncome || 0);

  const grossIncome = wages + netBusinessIncome + investmentIncome + retirementIncome + otherIncomeSum;

  // 2. Self-Employment Tax (SE Tax)
  // Taxable SE income is net profit * 0.9235.
  // Social Security: 12.4% on first $168,600.
  // Medicare: 2.9% on all.
  // Additional Medicare: 0.9% on self-employment income + wages exceeding limits.
  let selfEmploymentTax = 0;
  let halfSeTaxDeduction = 0;

  if (netBusinessIncome > 0) {
    const taxableSeIncome = netBusinessIncome * 0.9235;
    const ssTaxable = Math.min(taxableSeIncome, 168600);
    const ssTax = ssTaxable * 0.124;
    const medicareTax = taxableSeIncome * 0.029;

    // Additional Medicare threshold
    let addMedThreshold = 200000;
    if (income.socialSecurityTaxablePct) { // fallback
      if (wages + taxableSeIncome > 250000) addMedThreshold = 250000;
    }
    const totalEarningsForMed = wages + taxableSeIncome;
    const additionalMedicare = totalEarningsForMed > addMedThreshold ? (totalEarningsForMed - addMedThreshold) * 0.009 : 0;

    selfEmploymentTax = Math.round(ssTax + medicareTax + additionalMedicare);
    // Half of SE tax is an above-the-line deduction
    halfSeTaxDeduction = Math.round(selfEmploymentTax / 2);
  }

  // 3. Above-the-Line Adjustments (Deductions to get AGI)
  const traditionalIraLim = adjustments.iraDeduction || 0;
  const studentLoanLim = Math.min(adjustments.studentLoanInterest || 0, 2500);
  const seHealthInsurance = adjustments.seHealthInsurance || 0;
  const alimonyPaid = adjustments.alimonyPaid || 0;
  const educatorExpenses = Math.min(adjustments.educatorExpenses || 0, 300);
  const hsaDeduction = adjustments.hsaDeduction || 0;
  const movingExpenses = adjustments.movingExpenses || 0;

  const totalAdjustments =
    traditionalIraLim +
    studentLoanLim +
    halfSeTaxDeduction +
    seHealthInsurance +
    alimonyPaid +
    educatorExpenses +
    hsaDeduction +
    movingExpenses;

  const agi = Math.max(0, grossIncome - totalAdjustments);

  // 4. Standard vs Itemized Deductions (2024 levels)
  const status = income.socialSecurityTaxablePct ? 'Single' : 'Single'; // fallback filing status definition
  const filingStatus = translateFilingStatus(status);
  
  const standardDeductionsMap: Record<FilingStatus, number> = {
    Single: 14600,
    MFJ: 29200,
    MFS: 14600,
    HoH: 21900,
    QSS: 29200,
  };

  const status_real = filingStatus;
  const standardDeductionValue = standardDeductionsMap[status_real];

  // Itemized calculations
  let itemizedDeductionValue = 0;
  if (deductions.isItemized) {
    // Medical & Dental: Only amount exceeding 7.5% of AGI
    const medicalFloor = agi * 0.075;
    const medicalDeduction = Math.max(0, (deductions.medicalExpensesRaw || 0) - medicalFloor);

    // SALT cap is $10k (or $5k for MFS)
    const saltCap = status_real === 'MFS' ? 5000 : 10000;
    const saltSum = (deductions.stateIncomeTax || 0) + (deductions.realEstateTax || 0) + (deductions.personalPropertyTax || 0);
    const saltDeduction = Math.min(saltSum, saltCap);

    // Interest on debt capped. Let's sum the interest values directly as requested
    const mortgageDeduction = (deductions.mortgageInterestPrimary || 0) + (deductions.mortgageInterestEquity || 0);

    // Charity: up to 60% of AGI for cash, up to 30% for assets
    const charityDeduction = Math.min(deductions.charityCash || 0, agi * 0.6) + Math.min(deductions.charityAssets || 0, agi * 0.3);

    const casualty = deductions.casualtyLosses || 0;
    const other = deductions.otherItemized || 0;

    itemizedDeductionValue = medicalDeduction + saltDeduction + mortgageDeduction + charityDeduction + casualty + other;
  }

  const usingItemized = deductions.isItemized && itemizedDeductionValue > standardDeductionValue;
  const selectedDeductionValue = usingItemized ? itemizedDeductionValue : standardDeductionValue;

  // 5. Taxable Income
  const taxableIncome = Math.max(0, agi - selectedDeductionValue);

  // Separate Ordinarry Income and Capital Gains
  // Long-Term Capital Gains (LTCG) and Qualified Dividends are taxed at preferential rates (0%, 15%, 20%).
  // Other gains are taxed at ordinary rates.
  const preferredIncome = (income.ltcg || 0) + (income.ordinaryDividends || 0); // we lump qualifying dividends inside preferred
  const ordinaryTaxableIncome = Math.max(0, taxableIncome - preferredIncome);

  // 6. Federal Taxes
  const federalTaxOnIncome = calculateProgressiveTax(ordinaryTaxableIncome, status_real);
  const capitalGainsTax = calculateCapitalGainsTax(preferredIncome, ordinaryTaxableIncome, status_real);

  // 7. Net Investment Income Tax (NIIT) - 3.8% on lesser of net investment income OR MAGI excess
  // Thresholds: $200k (Single), $250k (MFJ), $125k (MFS)
  let niitThreshold = 200000;
  if (status_real === 'MFJ' || status_real === 'QSS') niitThreshold = 250000;
  if (status_real === 'MFS') niitThreshold = 125000;

  let niitTax = 0;
  if (agi > niitThreshold) {
    const magiExcess = agi - niitThreshold;
    // Net investment income elements
    const netInvestmentIncome = investmentIncome; // sum of STCG, LTCG, interest, ordinary dividends
    const taxableNii = Math.min(netInvestmentIncome, magiExcess);
    niitTax = Math.round(taxableNii * 0.038);
  }

  const totalRawTax = federalTaxOnIncome + capitalGainsTax + niitTax;

  // 8. Tax Credits (Child benefits, education, renewable)
  // Let's compute Child tax credits: $2000 per qualifying child
  const calculatedCtc = (credits.numQualifyingChildren || 0) * 2000;
  const refundableCtcCap = (credits.numQualifyingChildren || 0) * 1600; // max refundable standard

  const inputCreditsNonRefundable =
    (credits.childTaxCreditNonRefundable || 0) +
    (credits.lifetimeLearning || 0) +
    (credits.saversCredit || 0) +
    (credits.foreignTaxCredit || 0) +
    (credits.residentialCleanEnergy || 0);

  const inputCreditsRefundable =
    (credits.eitc || 0) +
    (credits.childTaxCreditRefundable || 0) +
    (credits.americanOpportunity || 0) +
    (credits.premiumTaxCredit || 0) +
    (credits.otherCredits || 0);

  // CTC offset split
  // Capped by liability first
  const nonRefundableCreditsSum = inputCreditsNonRefundable + calculatedCtc;
  const appliedNonRefundable = Math.min(totalRawTax, nonRefundableCreditsSum);
  const remainingLiability = Math.max(0, totalRawTax - appliedNonRefundable);

  // Refundable credits can create negative tax liability (refund)
  const appliedRefundable = inputCreditsRefundable + (nonRefundableCreditsSum > totalRawTax ? Math.min(refundableCtcCap, nonRefundableCreditsSum - appliedNonRefundable) : 0);

  const netFederalLiability = Math.round(remainingLiability - appliedRefundable);

  // 9. State Tax Estimates
  const estimatedStateTax = calculateStateTax(taxableIncome, selectedState, status_real);

  const totalTaxLiability = netFederalLiability + selfEmploymentTax + estimatedStateTax;

  return {
    filingStatus: status_real,
    selectedState,
    grossIncome,
    totalAdjustments,
    adjustedGrossIncome: agi,
    standardOrItemizedDeductionValue: selectedDeductionValue,
    usingItemized,
    taxableIncome,
    federalTaxOnIncome,
    capitalGainsTax,
    niitTax,
    selfEmploymentTax,
    totalTaxBeforeCredits: totalRawTax,
    totalCredits: nonRefundableCreditsSum + appliedRefundable,
    netFederalLiability,
    estimatedStateTax,
    totalTaxLiability,
    effectiveTaxRate: grossIncome > 0 ? (totalTaxLiability / grossIncome) * 100 : 0,
    takeHomeAnnual: Math.max(0, grossIncome - totalTaxLiability),
    takeHomeMonthly: Math.max(0, (grossIncome - totalTaxLiability) / 12),
  };
}

function translateFilingStatus(status: string): FilingStatus {
  if (['Single', 'MFJ', 'MFS', 'HoH', 'QSS'].includes(status)) {
    return status as FilingStatus;
  }
  return 'Single';
}

function calculateProgressiveTax(taxableOrdinary: number, status: FilingStatus): number {
  if (taxableOrdinary <= 0) return 0;

  // 2024 IRS Progressive Tax Brackets
  let brackets: number[] = [];
  let rates: number[] = [];

  if (status === 'Single' || status === 'MFS') {
    brackets = [11600, 47150, 100525, 191950, 243725, 609350];
    rates = [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
  } else if (status === 'MFJ' || status === 'QSS') {
    brackets = [23200, 94300, 201050, 383900, 487450, 731200];
    rates = [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
  } else {
    // HoH
    brackets = [16550, 63100, 100500, 191950, 243700, 609350];
    rates = [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
  }

  let tax = 0;
  let remaining = taxableOrdinary;
  let lastBracket = 0;

  for (let i = 0; i < brackets.length; i++) {
    const limit = brackets[i];
    const width = limit - lastBracket;
    if (remaining > width) {
      tax += width * rates[i];
      remaining -= width;
      lastBracket = limit;
    } else {
      tax += remaining * rates[i];
      remaining = 0;
      break;
    }
  }

  if (remaining > 0) {
    tax += remaining * rates[rates.length - 1];
  }

  return Math.round(tax);
}

function calculateCapitalGainsTax(preferred: number, ordinaryTaxable: number, status: FilingStatus): number {
  if (preferred <= 0) return 0;

  // Capital gains brackets thresholds (2024 Levels)
  let t0 = 47025;
  let t1 = 518900;

  if (status === 'MFJ' || status === 'QSS') {
    t0 = 94050;
    t1 = 583750;
  } else if (status === 'HoH') {
    t0 = 63000;
    t1 = 551350;
  } else if (status === 'MFS') {
    t0 = 47025;
    t1 = 291850;
  }

  // Captial gains are layyerred on top of ordinary income
  let cgTax = 0;
  let currentLayer = ordinaryTaxable;

  // Let's integrate with standard rate tiers
  // Section 0 - up to t0 is 0%
  // Section 1 - t0 to t1 is 15%
  // Section 2 - above t1 is 20%
  const preferredArray = [
    { start: 0, end: t0, rate: 0.0 },
    { start: t0, end: t1, rate: 0.15 },
    { start: t1, end: Infinity, rate: 0.20 }
  ];

  let remainingPreferred = preferred;

  for (const tier of preferredArray) {
    if (remainingPreferred <= 0) break;

    const layerTop = currentLayer + remainingPreferred;
    if (layerTop > tier.start) {
      // Calculate what portion of this tier's span we fall into
      const startInTier = Math.max(currentLayer, tier.start);
      const endInTier = Math.min(layerTop, tier.end);

      if (endInTier > startInTier) {
        const taxableAmt = endInTier - startInTier;
        cgTax += taxableAmt * tier.rate;
        currentLayer += taxableAmt;
        remainingPreferred -= taxableAmt;
      }
    }
  }

  return Math.round(cgTax);
}

function calculateStateTax(taxableIncome: number, state: string, status: FilingStatus): number {
  if (taxableIncome <= 0) return 0;

  // Support popular states
  switch (state) {
    case 'TX':
    case 'FL':
    case 'WA':
    case 'NV':
    case 'WY':
    case 'SD':
    case 'AK':
    case 'TN':
      return 0; // No State Income Tax!

    case 'IL':
      return Math.round(taxableIncome * 0.0495); // Flat 4.95%

    case 'PA':
      return Math.round(taxableIncome * 0.0307); // Flat 3.07%

    case 'MA':
      return Math.round(taxableIncome * 0.05); // Flat 5.0%

    case 'NY': {
      // Simple progressive NY State Tax (approx)
      // Slabs: 4% up to 17k, 4.5% up to 23k, 5.25% up to 80k, 5.85% up to 215k, 6.25% above NY
      let nySlabs = [17150, 23600, 80650, 215400, 1077550];
      let nyRates = [0.04, 0.045, 0.0525, 0.0585, 0.0625, 0.0685];
      if (status === 'MFJ' || status === 'QSS') {
        nySlabs = [34300, 47200, 161300, 430800, 2155100];
      }
      return computeFittedTax(taxableIncome, nySlabs, nyRates);
    }

    case 'CA': {
      // California Progressive Tax brackets
      // Slabs: 1% up to 10k, 2% up to 24k, 4% up to 38k, 6% up to 53k, 8% up to 67k, 9.3% up to 346k, 10.3% up to 416k, 11.3% up to 693k, 12.3% above.
      let caSlabs = [10412, 24684, 38959, 54081, 68350, 349137, 418961, 698271];
      let caRates = [0.01, 0.02, 0.04, 0.06, 0.08, 0.093, 0.103, 0.113, 0.123];
      if (status === 'MFJ' || status === 'QSS') {
        caSlabs = caSlabs.map(val => val * 2);
      }
      return computeFittedTax(taxableIncome, caSlabs, caRates);
    }

    default:
      // Generic progressive average state tax (5% approximation)
      return Math.round(taxableIncome * 0.05);
  }
}

function computeFittedTax(taxable: number, slabs: number[], rates: number[]): number {
  let tax = 0;
  let remaining = taxable;
  let lastSlab = 0;

  for (let i = 0; i < slabs.length; i++) {
    const limit = slabs[i];
    const width = limit - lastSlab;
    if (remaining > width) {
      tax += width * rates[i];
      remaining -= width;
      lastSlab = limit;
    } else {
      tax += remaining * rates[i];
      remaining = 0;
      break;
    }
  }

  if (remaining > 0) {
    tax += remaining * rates[rates.length - 1];
  }

  return Math.round(tax);
}
