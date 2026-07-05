/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UsaIncomeInputs, UsaAdjustments, UsaDeductions, UsaCredits, UsaTaxResult, FilingStatus } from '../types';
import { USA_TAX_CONFIG } from '../config/taxConfigUSA';

export function calculateUsaTax(
  income: UsaIncomeInputs,
  adjustments: UsaAdjustments,
  deductions: UsaDeductions & { isSenior65Plus?: boolean; spouseSenior65Plus?: boolean },
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

  // 2. Map Filing Status from socialSecurityTaxablePct parameter (originally mapped in IncomeSection)
  const numStatus = income.socialSecurityTaxablePct || 1;
  const statusMap: Record<number, FilingStatus> = {
    1: 'Single',
    2: 'MFJ',
    3: 'MFS',
    4: 'HoH',
    5: 'QSS'
  };
  const filingStatus = statusMap[numStatus] || 'Single';

  // 3. Self-Employment Tax (SE Tax) for 2026
  let selfEmploymentTax = 0;
  let halfSeTaxDeduction = 0;

  if (netBusinessIncome > 0) {
    const taxableSeIncome = netBusinessIncome * 0.9235;
    // Limit for Social Security under 2026: $184,500
    const ssLimit = USA_TAX_CONFIG.fica.socialSecurity.wageBaseLimit;
    const ssTaxable = Math.min(taxableSeIncome, ssLimit);
    const ssTax = ssTaxable * (USA_TAX_CONFIG.fica.socialSecurity.employeeRate * 2); // 12.4% total SE
    const medicareTax = taxableSeIncome * (USA_TAX_CONFIG.fica.medicare.employeeRate * 2); // 2.9% total SE

    // Additional Medicare threshold
    const addMedThreshold = USA_TAX_CONFIG.fica.additionalMedicare.thresholds[filingStatus] || 200000;
    const totalEarningsForMed = wages + taxableSeIncome;
    const additionalMedicare = totalEarningsForMed > addMedThreshold ? (totalEarningsForMed - addMedThreshold) * USA_TAX_CONFIG.fica.additionalMedicare.rate : 0;

    selfEmploymentTax = Math.round(ssTax + medicareTax + additionalMedicare);
    halfSeTaxDeduction = Math.round(selfEmploymentTax / 2);
  }

  // 4. Above-the-Line Adjustments (Deductions to get AGI)
  const traditionalIraLim = adjustments.iraDeduction || 0;
  const studentLoanLim = Math.min(
    adjustments.studentLoanInterest || 0,
    USA_TAX_CONFIG.fringeBenefits.studentLoanInterestMaxDeduction
  );
  const seHealthInsurance = adjustments.seHealthInsurance || 0;
  const alimonyPaid = adjustments.alimonyPaid || 0;
  const educatorExpenses = Math.min(
    adjustments.educatorExpenses || 0,
    USA_TAX_CONFIG.fringeBenefits.educatorExpensesMaxDeduction
  );
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

  // 5. Calculate Standard vs Itemized Deductions
  let standardDeductionValue = USA_TAX_CONFIG.standardDeductions[filingStatus] || 16100;

  // Additional deduction for age 65+
  if (deductions.isSenior65Plus) {
    const extra = USA_TAX_CONFIG.additionalDeduction65Plus[filingStatus] || 2050;
    standardDeductionValue += extra;
  }
  if (deductions.spouseSenior65Plus && (filingStatus === 'MFJ' || filingStatus === 'QSS')) {
    const extra = USA_TAX_CONFIG.additionalDeduction65Plus[filingStatus] || 1650;
    standardDeductionValue += extra;
  }

  // OBBBA Senior Deduction ($6,000 per senior, phases out at 6% rate above thresholds)
  let obbbaSeniorDeductionValue = 0;
  let numSeniors = 0;
  if (deductions.isSenior65Plus) numSeniors++;
  if (deductions.spouseSenior65Plus && (filingStatus === 'MFJ' || filingStatus === 'QSS')) numSeniors++;

  if (numSeniors > 0) {
    const totalObbbaDeduction = numSeniors * USA_TAX_CONFIG.obbbaSeniorDeduction.amountPerSenior;
    const phaseOutThreshold = USA_TAX_CONFIG.obbbaSeniorDeduction.phaseOutThreshold[filingStatus] || 75000;
    
    if (agi > phaseOutThreshold) {
      const excess = agi - phaseOutThreshold;
      const phaseOut = excess * USA_TAX_CONFIG.obbbaSeniorDeduction.phaseOutRate;
      obbbaSeniorDeductionValue = Math.max(0, totalObbbaDeduction - phaseOut);
    } else {
      obbbaSeniorDeductionValue = totalObbbaDeduction;
    }
  }

  // Add OBBBA senior deduction directly onto standard deduction value
  standardDeductionValue += obbbaSeniorDeductionValue;

  // Itemized deductions
  let itemizedDeductionValue = 0;
  if (deductions.isItemized) {
    // Medical & Dental: Only amount exceeding 7.5% of AGI
    const medicalFloor = agi * 0.075;
    const medicalDeduction = Math.max(0, (deductions.medicalExpensesRaw || 0) - medicalFloor);

    // SALT cap is $40,400 combined per 2026 OBBBA rules
    const saltCap = filingStatus === 'MFS' ? 20200 : 40400;
    const saltSum = (deductions.stateIncomeTax || 0) + (deductions.realEstateTax || 0) + (deductions.personalPropertyTax || 0);
    const saltDeduction = Math.min(saltSum, saltCap);

    // Interest on debt
    const mortgageDeduction = (deductions.mortgageInterestPrimary || 0) + (deductions.mortgageInterestEquity || 0);

    // Charity: up to 60% of AGI for cash, up to 30% for assets
    const charityDeduction = Math.min(deductions.charityCash || 0, agi * 0.6) + Math.min(deductions.charityAssets || 0, agi * 0.3);

    const casualty = deductions.casualtyLosses || 0;
    const other = deductions.otherItemized || 0;

    itemizedDeductionValue = medicalDeduction + saltDeduction + mortgageDeduction + charityDeduction + casualty + other;
    
    // Add OBBBA senior deduction onto itemized too if applicable
    itemizedDeductionValue += obbbaSeniorDeductionValue;
  }

  const usingItemized = deductions.isItemized && itemizedDeductionValue > standardDeductionValue;
  const selectedDeductionValue = usingItemized ? itemizedDeductionValue : standardDeductionValue;

  // 6. Taxable Income
  const taxableIncome = Math.max(0, agi - selectedDeductionValue);

  // Separate Ordinary Income and Capital Gains
  // LTCG and Qualified Dividends are taxed at preferred rates
  const preferredIncome = (income.ltcg || 0) + (income.ordinaryDividends || 0);
  const ordinaryTaxableIncome = Math.max(0, taxableIncome - preferredIncome);

  // 7. Federal Taxes
  const federalTaxOnIncome = calculateProgressiveTax(ordinaryTaxableIncome, filingStatus);
  const capitalGainsTax = calculateCapitalGainsTax(preferredIncome, ordinaryTaxableIncome, filingStatus);

  // Net Investment Income Tax (NIIT) - 3.8% on lesser of net investment income OR AGI excess
  let niitThreshold = 200000;
  if (filingStatus === 'MFJ' || filingStatus === 'QSS') niitThreshold = 250000;
  if (filingStatus === 'MFS') niitThreshold = 125000;

  let niitTax = 0;
  if (agi > niitThreshold) {
    const magiExcess = agi - niitThreshold;
    const netInvestmentIncome = investmentIncome;
    const taxableNii = Math.min(netInvestmentIncome, magiExcess);
    niitTax = Math.round(taxableNii * 0.038);
  }

  const totalRawTax = federalTaxOnIncome + capitalGainsTax + niitTax;

  // 8. Tax Credits
  const calculatedCtc = (credits.numQualifyingChildren || 0) * 2000;
  const refundableCtcCap = (credits.numQualifyingChildren || 0) * 1600;

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

  const nonRefundableCreditsSum = inputCreditsNonRefundable + calculatedCtc;
  const appliedNonRefundable = Math.min(totalRawTax, nonRefundableCreditsSum);
  const remainingLiability = Math.max(0, totalRawTax - appliedNonRefundable);

  const appliedRefundable = inputCreditsRefundable + (nonRefundableCreditsSum > totalRawTax ? Math.min(refundableCtcCap, nonRefundableCreditsSum - appliedNonRefundable) : 0);

  const netFederalLiability = Math.round(remainingLiability - appliedRefundable);

  // 9. State Tax Estimates
  const estimatedStateTax = calculateStateTax(taxableIncome, selectedState, filingStatus);

  const totalTaxLiability = netFederalLiability + selfEmploymentTax + estimatedStateTax;

  return {
    filingStatus,
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

function calculateProgressiveTax(taxableOrdinary: number, status: FilingStatus): number {
  if (taxableOrdinary <= 0) return 0;

  const brackets = USA_TAX_CONFIG.federalBrackets[status] || USA_TAX_CONFIG.federalBrackets.Single;
  let tax = 0;
  let remaining = taxableOrdinary;
  let lastBracket = 0;

  for (const slab of brackets) {
    const width = slab.limit - lastBracket;
    if (remaining > width) {
      tax += width * slab.rate;
      remaining -= width;
      lastBracket = slab.limit;
    } else {
      tax += remaining * slab.rate;
      remaining = 0;
      break;
    }
  }

  if (remaining > 0) {
    tax += remaining * brackets[brackets.length - 1].rate;
  }

  return Math.round(tax);
}

function calculateCapitalGainsTax(preferred: number, ordinaryTaxable: number, status: FilingStatus): number {
  if (preferred <= 0) return 0;

  const tiers = USA_TAX_CONFIG.ltcgThresholds[status] || USA_TAX_CONFIG.ltcgThresholds.Single;
  let cgTax = 0;
  let currentLayer = ordinaryTaxable;
  let remainingPreferred = preferred;
  let lastLimit = 0;

  for (const tier of tiers) {
    if (remainingPreferred <= 0) break;

    const layerTop = currentLayer + remainingPreferred;
    if (layerTop > lastLimit) {
      const startInTier = Math.max(currentLayer, lastLimit);
      const endInTier = Math.min(layerTop, tier.limit);

      if (endInTier > startInTier) {
        const taxableAmt = endInTier - startInTier;
        cgTax += taxableAmt * tier.rate;
        currentLayer += taxableAmt;
        remainingPreferred -= taxableAmt;
      }
    }
    lastLimit = tier.limit;
  }

  return Math.round(cgTax);
}

function calculateStateTax(taxableIncome: number, state: string, status: FilingStatus): number {
  if (taxableIncome <= 0) return 0;

  const stateConfig = USA_TAX_CONFIG.stateTaxes[state];
  if (!stateConfig) {
    // Standard flat fallback for unspecified states
    return Math.round(taxableIncome * 0.05);
  }

  if (stateConfig.type === 'none') {
    return 0;
  }

  if (stateConfig.type === 'flat') {
    return Math.round(taxableIncome * (stateConfig.rate || 0.05));
  }

  if (stateConfig.type === 'progressive' && stateConfig.brackets) {
    // Standard NY or CA progressive calculation
    const key = (status === 'MFJ' || status === 'QSS') ? 'MFJ' : 'Single';
    const brackets = stateConfig.brackets[key] || stateConfig.brackets.Single;

    let tax = 0;
    let remaining = taxableIncome;
    let lastLimit = 0;

    for (const slab of brackets) {
      const width = slab.limit - lastLimit;
      if (remaining > width) {
        tax += width * slab.rate;
        remaining -= width;
        lastLimit = slab.limit;
      } else {
        tax += remaining * slab.rate;
        remaining = 0;
        break;
      }
    }

    if (remaining > 0) {
      tax += remaining * brackets[brackets.length - 1].rate;
    }

    return Math.round(tax);
  }

  return Math.round(taxableIncome * 0.05);
}
