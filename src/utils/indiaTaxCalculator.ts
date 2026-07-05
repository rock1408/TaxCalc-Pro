/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndiaIncomeInputs, IndiaDeductions, IndiaTaxResult, IndiaRegimeComparison } from '../types';
import { INDIA_TAX_CONFIG } from '../config/taxConfigIndia';

export function calculateIndiaTax(
  income: IndiaIncomeInputs,
  deductions: IndiaDeductions,
  rentPaidForHra: number = 0,
  isMetro: boolean = true,
  skipBreakEven: boolean = false
): IndiaRegimeComparison {
  // 1. Calculate Gross Salary and Heads of Income
  const grossSalary =
    income.grossSalary ||
    (income.basicSalary +
      income.dearnessAllowance +
      income.hra +
      income.transportAllowance +
      income.medicalAllowance +
      income.bonus +
      income.leaveEncashment +
      income.otherAllowances);

  // --- REGIME: OLD ---
  const oldSalaryHead = calculateSalaryHead(grossSalary, 'old', income, rentPaidForHra, isMetro);
  const oldHousePropertyHead = calculateHousePropertyHead(income, 'old', deductions);
  const oldBusinessHead = calculateBusinessHead(income);
  const oldCapitalGainsHead = calculateCapitalGainsHead(income);
  const oldOtherSourcesHead = calculateOtherSourcesHead(income, 'old', deductions);

  const oldGrossTotalIncome =
    oldSalaryHead + oldHousePropertyHead + oldBusinessHead + oldCapitalGainsHead + oldOtherSourcesHead;

  const { totalDeductions, deductionsDetail } = calculateOldRegimeDeductions(
    deductions,
    oldGrossTotalIncome,
    income,
    rentPaidForHra
  );

  const oldTaxableIncome = Math.max(0, oldGrossTotalIncome - totalDeductions);

  // Separate Capital Gains for Old Regime
  const oldSpecialSTCG = (income.stcgStocks || 0) + (income.stcgMF || 0);
  const oldSpecialLTCG = (income.ltcgStocks || 0) + (income.ltcgMF || 0);
  const oldSpecialGainsIncome = oldSpecialSTCG + oldSpecialLTCG;

  // Deductions cannot offset special rate capital gains
  const oldSlabTaxableIncome = Math.max(0, oldTaxableIncome - oldSpecialGainsIncome);
  const oldStandardSlabTax = calculateSlabTax(oldSlabTaxableIncome, 'old', deductions);

  // Special tax rates on equity capital gains
  const oldSTCGTax = oldSpecialSTCG * INDIA_TAX_CONFIG.stcgEquityRate;
  const oldLTCGTax = Math.max(0, oldSpecialLTCG - INDIA_TAX_CONFIG.ltcgEquityExemption) * INDIA_TAX_CONFIG.ltcgEquityRate;
  const oldCapitalGainsSpecialTax = oldSTCGTax + oldLTCGTax;

  const oldBasicTax = oldStandardSlabTax + oldCapitalGainsSpecialTax;
  const oldRebate = calculateRebate87A(oldTaxableIncome, oldBasicTax, 'old');
  const oldTaxAfterRebate = Math.max(0, oldBasicTax - oldRebate);
  const oldSurcharge = calculateSurcharge(oldTaxableIncome, oldTaxAfterRebate, 'old');
  const oldCess = Math.round((oldTaxAfterRebate + oldSurcharge) * INDIA_TAX_CONFIG.cessRate);
  const oldTaxPayable = oldTaxAfterRebate + oldSurcharge + oldCess;

  const oldResult: IndiaTaxResult = {
    regime: 'old',
    grossTotalIncome: oldGrossTotalIncome,
    salaryHead: oldSalaryHead,
    housePropertyHead: oldHousePropertyHead,
    businessHead: oldBusinessHead,
    capitalGainsHead: oldCapitalGainsHead,
    otherSourcesHead: oldOtherSourcesHead,
    deductions80C: deductionsDetail.c80,
    totalDeductionsValue: totalDeductions,
    taxableIncome: oldTaxableIncome,
    basicTax: oldBasicTax,
    rebate87A: oldRebate,
    taxAfterRebate: oldTaxAfterRebate,
    cess: oldCess,
    surcharge: oldSurcharge,
    totalTaxPayable: oldTaxPayable,
    effectiveTaxRate: oldGrossTotalIncome > 0 ? (oldTaxPayable / oldGrossTotalIncome) * 100 : 0,
    takeHomeAnnual: Math.max(0, oldGrossTotalIncome - oldTaxPayable),
    takeHomeMonthly: Math.max(0, (oldGrossTotalIncome - oldTaxPayable) / 12),
  };

  // --- REGIME: NEW ---
  const newSalaryHead = calculateSalaryHead(grossSalary, 'new', income, rentPaidForHra, isMetro);
  const newHousePropertyHead = calculateHousePropertyHead(income, 'new', deductions);
  const newBusinessHead = calculateBusinessHead(income);
  const newCapitalGainsHead = calculateCapitalGainsHead(income);
  const newOtherSourcesHead = calculateOtherSourcesHead(income, 'new', deductions);

  const newGrossTotalIncome =
    newSalaryHead + newHousePropertyHead + newBusinessHead + newCapitalGainsHead + newOtherSourcesHead;

  // New regime only allows standard deduction of Rs. 75,000 on Salary (already handled inside salary head),
  // family pension deduction (handled in other sources), and 80CCD(2) employer NPS contribution.
  const newEmployerNpsDeduction = Math.min(
    deductions.npsEmployer80CCD2 || 0,
    (income.basicSalary + income.dearnessAllowance) * 0.14
  );
  const newTotalDeductions = newEmployerNpsDeduction;

  const newTaxableIncome = Math.max(0, newGrossTotalIncome - newTotalDeductions);

  // Separate Capital Gains for New Regime
  const newSpecialSTCG = (income.stcgStocks || 0) + (income.stcgMF || 0);
  const newSpecialLTCG = (income.ltcgStocks || 0) + (income.ltcgMF || 0);
  const newSpecialGainsIncome = newSpecialSTCG + newSpecialLTCG;

  const newSlabTaxableIncome = Math.max(0, newTaxableIncome - newSpecialGainsIncome);
  const newStandardSlabTax = calculateSlabTax(newSlabTaxableIncome, 'new', deductions);

  // Special tax rates on equity capital gains
  const newSTCGTax = newSpecialSTCG * INDIA_TAX_CONFIG.stcgEquityRate;
  const newLTCGTax = Math.max(0, newSpecialLTCG - INDIA_TAX_CONFIG.ltcgEquityExemption) * INDIA_TAX_CONFIG.ltcgEquityRate;
  const newCapitalGainsSpecialTax = newSTCGTax + newLTCGTax;

  const newBasicTax = newStandardSlabTax + newCapitalGainsSpecialTax;
  const newRebate = calculateRebate87A(newTaxableIncome, newBasicTax, 'new');
  const newTaxAfterRebate = Math.max(0, newBasicTax - newRebate);
  const newSurcharge = calculateSurcharge(newTaxableIncome, newTaxAfterRebate, 'new');
  const newCess = Math.round((newTaxAfterRebate + newSurcharge) * INDIA_TAX_CONFIG.cessRate);
  const newTaxPayable = newTaxAfterRebate + newSurcharge + newCess;

  const newResult: IndiaTaxResult = {
    regime: 'new',
    grossTotalIncome: newGrossTotalIncome,
    salaryHead: newSalaryHead,
    housePropertyHead: newHousePropertyHead,
    businessHead: newBusinessHead,
    capitalGainsHead: newCapitalGainsHead,
    otherSourcesHead: newOtherSourcesHead,
    deductions80C: 0,
    totalDeductionsValue: newTotalDeductions,
    taxableIncome: newTaxableIncome,
    basicTax: newBasicTax,
    rebate87A: newRebate,
    taxAfterRebate: newTaxAfterRebate,
    cess: newCess,
    surcharge: newSurcharge,
    totalTaxPayable: newTaxPayable,
    effectiveTaxRate: newGrossTotalIncome > 0 ? (newTaxPayable / newGrossTotalIncome) * 100 : 0,
    takeHomeAnnual: Math.max(0, newGrossTotalIncome - newTaxPayable),
    takeHomeMonthly: Math.max(0, (newGrossTotalIncome - newTaxPayable) / 12),
  };

  const betterRegime = newTaxPayable < oldTaxPayable ? 'new' : 'old';
  const taxSavings = Math.abs(oldTaxPayable - newTaxPayable);

  // Calculate Break-Even Point of deductions required to make Old Regime better than New Regime.
  const breakEvenDeductions = skipBreakEven
    ? 0
    : findIndiaDeductionBreakEven(income, deductions, rentPaidForHra, isMetro);

  return {
    oldRegime: oldResult,
    newRegime: newResult,
    betterRegime,
    taxSavings,
    breakEvenPoints: {
      deductionsNeeded: breakEvenDeductions,
    },
  };
}

function calculateSalaryHead(
  grossSalary: number,
  regime: 'old' | 'new',
  income: IndiaIncomeInputs,
  rentPaid: number,
  isMetro: boolean
): number {
  if (grossSalary <= 0) return 0;

  // Standard Deduction: Rs. 75,000 for New Regime, Rs. 50,000 for Old Regime in FY 2025-26
  const stdDedLimit =
    regime === 'new'
      ? INDIA_TAX_CONFIG.newRegime.standardDeductionSalaried
      : INDIA_TAX_CONFIG.oldRegime.standardDeductionSalaried;
  const standardDeduction = Math.min(grossSalary, stdDedLimit);

  let hraExemption = 0;
  if (regime === 'old' && income.hra > 0 && rentPaid > 0) {
    const basicDA = income.basicSalary + income.dearnessAllowance;
    if (basicDA > 0) {
      const option1 = income.hra;
      const option2 = Math.max(0, rentPaid - 0.1 * basicDA);
      const option3 = (isMetro ? 0.5 : 0.4) * basicDA;
      hraExemption = Math.min(option1, option2, option3);
    }
  }

  const netSalary = Math.max(0, grossSalary - standardDeduction - hraExemption);
  return netSalary;
}

function calculateHousePropertyHead(
  income: IndiaIncomeInputs,
  regime: 'old' | 'new',
  deductions: IndiaDeductions
): number {
  const rental = income.rentalIncome || 0;
  const taxes = income.municipalTaxes || 0;

  const netAnnualValue = Math.max(0, rental - taxes);
  const standard30percent = netAnnualValue * 0.3;

  // Interest on Home Loan (Section 24b)
  // Capped at Rs. 2,00,000 for Old Regime.
  // Self-occupied home loan interest is fully disallowed under New Regime.
  const interest = income.homeLoanInterest || 0;

  if (regime === 'old') {
    const hpNet = netAnnualValue - standard30percent - interest;
    return hpNet < -INDIA_TAX_CONFIG.deductions.section24b_SelfOccupiedCap
      ? -INDIA_TAX_CONFIG.deductions.section24b_SelfOccupiedCap
      : hpNet;
  } else {
    // New regime: No self-occupied interest deduction allowed.
    // Interest on let-out property is allowed but cannot create a loss under HP head.
    if (rental > 0) {
      const hpNet = netAnnualValue - standard30percent - interest;
      return Math.max(0, hpNet); // cannot be negative
    }
    return 0;
  }
}

function calculateBusinessHead(income: IndiaIncomeInputs): number {
  const businessProfit = Math.max(0, (income.businessReceipts || 0) - (income.businessExpenses || 0));
  const professionalProfit = Math.max(0, (income.professionalReceipts || 0) - (income.professionalExpenses || 0));
  return businessProfit + professionalProfit;
}

function calculateCapitalGainsHead(income: IndiaIncomeInputs): number {
  const total =
    (income.stcgStocks || 0) +
    (income.ltcgStocks || 0) +
    (income.stcgMF || 0) +
    (income.ltcgMF || 0) +
    (income.otherCapitalGains || 0);
  return total;
}

function calculateOtherSourcesHead(
  income: IndiaIncomeInputs,
  regime: 'old' | 'new',
  deductions: IndiaDeductions
): number {
  let familyPensionValue = income.familyPension || 0;
  // Pension Standard Deduction: Mini of 1/3rd of pension or Rs. 15,000 / 25,000? Let's use standard Rs.15,000
  if (familyPensionValue > 0) {
    const deduction = Math.min(familyPensionValue / 3, 15000);
    familyPensionValue = Math.max(0, familyPensionValue - deduction);
  }

  const base =
    (income.interestIncome || 0) +
    (income.dividendIncome || 0) +
    (income.machineryRental || 0) +
    familyPensionValue +
    (income.otherSources || 0);

  return base;
}

function calculateOldRegimeDeductions(
  d: IndiaDeductions,
  grossTotalIncome: number,
  income: IndiaIncomeInputs,
  rentPaid: number
) {
  // 1. Section 80C caps
  const c80Sum =
    (d.lifeInsurance || 0) +
    (d.ppf || 0) +
    (d.epf || 0) +
    (d.elss || 0) +
    (d.nsc || 0) +
    (d.sukanyaSamriddhi || 0) +
    (d.taxSavingFd || 0) +
    (d.homeLoanPrincipal || 0) +
    (d.tuitionFees || 0) +
    (d.stampDuty || 0) +
    (d.npsEmployee80CCD1 || 0);

  const c80Deduction = Math.min(c80Sum, INDIA_TAX_CONFIG.deductions.section80C_Cap);

  // 2. Section 80CCD(1B) - Extra NPS up to 50,000
  const npsExtra = Math.min(d.npsExtra80CCD1B || 0, INDIA_TAX_CONFIG.deductions.section80CCD1B_Cap);

  // 3. Section 80CCD(2) - Employer NPS (Up to 14% of basic + DA)
  const basicPlusDa = (income.basicSalary || 0) + (income.dearnessAllowance || 0);
  const maxEmployerNps = basicPlusDa > 0 ? basicPlusDa * 0.14 : 99999999;
  const employerNps = Math.min(d.npsEmployer80CCD2 || 0, maxEmployerNps);

  // 4. Section 80D - Health Insurance
  // Self/Family: capped at 25,000 (or 50,000 if self is a senior)
  const familyLimit = d.isSeniorCitizen
    ? INDIA_TAX_CONFIG.deductions.section80D_SelfSeniorLimit
    : INDIA_TAX_CONFIG.deductions.section80D_SelfLimit;

  // Parents: capped at 25,000 (non-senior) or 50,000 (senior)
  const parentLimit = d.healthPremiumParentsSenior
    ? INDIA_TAX_CONFIG.deductions.section80D_ParentSeniorLimit
    : INDIA_TAX_CONFIG.deductions.section80D_ParentLimit;

  const familySpent = d.healthPremiumSelf || 0;
  const parentSpent = d.healthPremiumParents || 0;
  const preventive = Math.min(d.preventiveCheckup || 0, INDIA_TAX_CONFIG.deductions.section80D_PreventiveCap);

  // Preventive health checkup is inside family limit
  const healthDeduction =
    Math.min(familySpent + preventive, familyLimit) + Math.min(parentSpent, parentLimit);

  // 5. Section 80DD (Disability dependent)
  let ddValue = 0;
  if (d.disability80DD === 'normal') ddValue = 75000;
  if (d.disability80DD === 'severe') ddValue = 125000;

  // 6. Section 80DDB (Specified medical expenses)
  let ddbValue = 0;
  if (d.medical80DDB === 'normal') ddbValue = 40000;
  if (d.medical80DDB === 'senior') ddbValue = 100000;

  // 7. Section 80E (Education Interest)
  const eduLoan = d.educationLoanInterest || 0;

  // 8. Section 80EE (Home Loan Extra Interest)
  const extraHomeLoanInterest = Math.min(d.homeLoanInterest80EE || 0, 50000);

  // 9. Section 80G - Donations (capped at 10% of Gross Total Income)
  const gGrossCap = grossTotalIncome * 0.1;
  const preG80Sum = d.donations80G100 + 0.5 * d.donations80G50;
  const donationDeduction = Math.min(preG80Sum, gGrossCap);

  // 10. Section 80GG - HRA Deduction (Without HRA of employer)
  let ggValue = 0;
  if (rentPaid > 0 && (!income.hra || income.hra === 0)) {
    const totalIncomeApprox = Math.max(0, grossTotalIncome - c80Deduction);
    if (totalIncomeApprox > 0) {
      const term1 = 0.25 * totalIncomeApprox;
      const term2 = Math.max(0, rentPaid - 0.1 * totalIncomeApprox);
      const term3 = 60000; // Rs. 5000/month
      ggValue = Math.min(term1, term2, term3);
    }
  }

  // 11. Section 80GGC - Political Donations (100%)
  const politicalDonations = d.politicalDonations80GGC || 0;

  // 12. Section 80TTA / 80TTB - Savings interest
  let interestDeduction = 0;
  if (d.isSeniorCitizen) {
    interestDeduction = Math.min(
      d.seniorInterest80TTB || 0,
      INDIA_TAX_CONFIG.deductions.section80TTB_Cap
    );
  } else {
    interestDeduction = Math.min(
      d.savingsInterest80TTA || 0,
      INDIA_TAX_CONFIG.deductions.section80TTA_Cap
    );
  }

  // 13. Section 80U - Self disability
  let uValue = 0;
  if (d.disability80U === 'normal') uValue = 75000;
  if (d.disability80U === 'severe') uValue = 125000;

  const totalDeductions =
    c80Deduction +
    npsExtra +
    employerNps +
    healthDeduction +
    ddValue +
    ddbValue +
    eduLoan +
    extraHomeLoanInterest +
    donationDeduction +
    ggValue +
    politicalDonations +
    interestDeduction +
    uValue;

  return {
    totalDeductions: Math.min(totalDeductions, grossTotalIncome),
    deductionsDetail: {
      c80: c80Deduction,
      npsExtra,
      employerNps,
      health: healthDeduction,
      interestDeduction,
    },
  };
}

function calculateSlabTax(income: number, regime: 'old' | 'new', d: IndiaDeductions): number {
  if (income <= 0) return 0;

  if (regime === 'new') {
    return computeProgressiveTax(income, INDIA_TAX_CONFIG.newRegime.slabs);
  } else {
    // OLD Regime has age-based exemptions
    if (d.isSuperSeniorCitizen) {
      return computeProgressiveTax(income, INDIA_TAX_CONFIG.oldRegime.slabsSuperSenior);
    } else if (d.isSeniorCitizen) {
      return computeProgressiveTax(income, INDIA_TAX_CONFIG.oldRegime.slabsSenior);
    } else {
      return computeProgressiveTax(income, INDIA_TAX_CONFIG.oldRegime.slabsGeneral);
    }
  }
}

function computeProgressiveTax(income: number, slabs: Array<{ limit: number; rate: number }>): number {
  let tax = 0;
  let remaining = income;
  let lastLimit = 0;

  for (const slab of slabs) {
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
    tax += remaining * slabs[slabs.length - 1].rate;
  }

  return Math.round(tax);
}

function calculateRebate87A(income: number, tax: number, regime: 'old' | 'new'): number {
  if (income <= 0 || tax <= 0) return 0;

  if (regime === 'new') {
    // New regime rebate up to ₹12,00,000 (max ₹60,000) for FY 2025-26
    const limit = INDIA_TAX_CONFIG.newRegime.rebate87ALimit;
    if (income <= limit) {
      return tax; // full rebate
    }
    // Marginal relief logic: If taxable income > 12L,
    // the tax payable should not exceed the income earned over 12L.
    const excess = income - limit;
    if (tax > excess) {
      return tax - excess; // reduces final tax exactly to the excess income
    }
  } else {
    // Old regime rebate up to ₹5,00,000 (max ₹12,500)
    const limit = INDIA_TAX_CONFIG.oldRegime.rebate87ALimit;
    if (income <= limit) {
      return Math.min(tax, INDIA_TAX_CONFIG.oldRegime.rebate87AMax);
    }
  }
  return 0;
}

function calculateSurcharge(taxableIncome: number, taxAmount: number, regime: 'old' | 'new'): number {
  if (taxableIncome <= 5000000) return 0;

  let surchargeRate = 0;
  let threshold = 5000000;

  if (taxableIncome > 5000000 && taxableIncome <= 10000000) {
    surchargeRate = 0.10;
    threshold = 5000000;
  } else if (taxableIncome > 10000000 && taxableIncome <= 20000000) {
    surchargeRate = 0.15;
    threshold = 10000000;
  } else if (taxableIncome > 20000000) {
    // New regime caps surcharge at 25% max. Old regime has 37% above 5Cr.
    const maxSurcharge = regime === 'new' ? INDIA_TAX_CONFIG.newRegime.surchargeCap : INDIA_TAX_CONFIG.oldRegime.surchargeCap;
    if (taxableIncome > 50000000) {
      surchargeRate = maxSurcharge;
      threshold = regime === 'new' ? 20000000 : 50000000;
    } else {
      surchargeRate = 0.25;
      threshold = 20000000;
    }
  }

  const rawSurcharge = taxAmount * surchargeRate;

  // Marginal Relief on Surcharge:
  // Surcharge should not exceed the excess income over the threshold
  const excessIncome = taxableIncome - threshold;
  if (excessIncome > 0 && excessIncome < rawSurcharge) {
    return Math.max(0, excessIncome);
  }

  return Math.round(rawSurcharge);
}

function findIndiaDeductionBreakEven(
  income: IndiaIncomeInputs,
  deductions: IndiaDeductions,
  rentPaid: number,
  isMetro: boolean
): number {
  const simulationResult = calculateIndiaTax(income, deductions, rentPaid, isMetro, true);
  if (simulationResult.betterRegime === 'old') {
    return 0; // Old is already better
  }

  const oldTax = simulationResult.oldRegime.totalTaxPayable;
  const newTax = simulationResult.newRegime.totalTaxPayable;
  if (oldTax <= newTax) return 0;

  let addedDeductions = 0;
  const maxSimulation = 500000; // expand simulation space up to 5 Lakhs

  while (addedDeductions < maxSimulation) {
    addedDeductions += 5000;
    const simulatedDeductions: IndiaDeductions = {
      ...deductions,
      lifeInsurance: deductions.lifeInsurance + addedDeductions,
    };
    const sim = calculateIndiaTax(income, simulatedDeductions, rentPaid, isMetro, true);
    if (sim.oldRegime.totalTaxPayable <= newTax) {
      return addedDeductions;
    }
  }

  return maxSimulation;
}
