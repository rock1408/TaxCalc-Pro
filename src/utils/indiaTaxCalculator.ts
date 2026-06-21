/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndiaIncomeInputs, IndiaDeductions, IndiaTaxResult, IndiaRegimeComparison } from '../types';

export function calculateIndiaTax(
  income: IndiaIncomeInputs,
  deductions: IndiaDeductions,
  rentPaidForHra: number = 0,
  isMetro: boolean = true,
  skipBreakEven: boolean = false
): IndiaRegimeComparison {
  // 1. Calculate Gross Heads
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
  const oldBasicTax = calculateSlabTax(oldTaxableIncome, 'old', deductions);
  const oldRebate = calculateRebate87A(oldTaxableIncome, oldBasicTax, 'old');
  const oldTaxAfterRebate = Math.max(0, oldBasicTax - oldRebate);
  const oldSurcharge = calculateSurcharge(oldTaxableIncome, oldTaxAfterRebate);
  const oldCess = Math.round((oldTaxAfterRebate + oldSurcharge) * 0.04);
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

  // --- REGIME: NEW (FY 2024-25 Default) ---
  const newSalaryHead = calculateSalaryHead(grossSalary, 'new', income, rentPaidForHra, isMetro);
  const newHousePropertyHead = calculateHousePropertyHead(income, 'new', deductions);
  const newBusinessHead = calculateBusinessHead(income);
  const newCapitalGainsHead = calculateCapitalGainsHead(income);
  const newOtherSourcesHead = calculateOtherSourcesHead(income, 'new', deductions);

  const newGrossTotalIncome =
    newSalaryHead + newHousePropertyHead + newBusinessHead + newCapitalGainsHead + newOtherSourcesHead;

  // New regime only allows standard deduction of Rs. 75,000 on Salary (already handled inside salary head),
  // family pension deduction, and 80CCD(2) employer NPS contribution.
  const newEmployerNpsDeduction = Math.min(
    deductions.npsEmployer80CCD2 || 0,
    (income.basicSalary + income.dearnessAllowance) * 0.14
  );
  const newTotalDeductions = newEmployerNpsDeduction;

  const newTaxableIncome = Math.max(0, newGrossTotalIncome - newTotalDeductions);
  const newBasicTax = calculateSlabTax(newTaxableIncome, 'new', deductions);
  const newRebate = calculateRebate87A(newTaxableIncome, newBasicTax, 'new');
  const newTaxAfterRebate = Math.max(0, newBasicTax - newRebate);
  const newSurcharge = calculateSurcharge(newTaxableIncome, newTaxAfterRebate);
  const newCess = Math.round((newTaxAfterRebate + newSurcharge) * 0.04);
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

  // Calculate generic Break-Even Point of deductions required to make Old Regime better than New Regime.
  // This is the additional deduction value needed under Old Regime.
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
  
  // Standard Deduction: Rs. 75,000 for FY 2024-25 in both Old and New regime (was increased in Union Budget)
  const standardDeduction = Math.min(grossSalary, 75000);
  
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
  // Not allowed in New Regime for self-occupied, but standard deduction is allowed.
  // Let's assume if there's rental income, interest can be set off up to let-out properties rules.
  // Under New Regime, interest on let-out property can be deducted to the extent of its rental income, 
  // but cannot create a loss under the HP head. Self-occupied home loan interest is fully disallowed.
  const interest = income.homeLoanInterest || 0;
  
  if (regime === 'old') {
    // Loss under HB head capped at 2,00,000 max negative
    const hpNet = netAnnualValue - standard30percent - interest;
    return hpNet < -200000 ? -200000 : hpNet;
  } else {
    // New regime: No self-occupied loan interest, let-out interest allowed but cannot make HP head negative.
    if (rental > 0) {
      const hpNet = netAnnualValue - standard30percent - interest;
      return Math.max(0, hpNet); // cannot be negative (no HP loss carryforward/setoff in new regime)
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
  // Pension Standard Deduction: Mini of 1/3rd of pension or Rs. 15,000
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

  const c80Deduction = Math.min(c80Sum, 150000);

  // 2. Section 80CCD(1B) - Extra NPS up to 50,000
  const npsExtra = Math.min(d.npsExtra80CCD1B || 0, 50000);

  // 3. Section 80CCD(2) - Employer NPS
  // Max 14% of basic + DA
  const basicPlusDa = (income.basicSalary || 0) + (income.dearnessAllowance || 0);
  const maxEmployerNps = basicPlusDa > 0 ? basicPlusDa * 0.14 : 99999999;
  const employerNps = Math.min(d.npsEmployer80CCD2 || 0, maxEmployerNps);

  // 4. Section 80D - Health Insurance
  // Self/Family capped at 25,000 (or 50,000 if parent senior)
  // Parent premium capped at 25,000 (non-senior) or 50,000 (senior)
  // Preventive health checkup (max 5,000) is included within the caps.
  let familyLimit = 25000;
  if (d.isSeniorCitizen) familyLimit = 50000;
  
  const parentLimit = d.healthPremiumParentsSenior ? 50000 : 25000;
  
  const familySpent = d.healthPremiumSelf || 0;
  const parentSpent = d.healthPremiumParents || 0;
  const preventive = Math.min(d.preventiveCheckup || 0, 5000);
  
  // Distribute preventive health checkup (let's check self and caps)
  const healthDeduction =
    Math.min(familySpent + preventive, familyLimit) + Math.min(parentSpent, parentLimit);

  // 5. Section 80DD (Disability dependent)
  let ddValue = 0;
  if (d.disability80DD === 'normal') ddValue = 75000;
  if (d.disability80DD === 'severe') ddValue = 125000;

  // 6. Section 80DDB (Specified medical expenses)
  let ddbValue = 0;
  if (d.medical80DDB === 'normal') ddbValue = Math.min(40000, 40000);
  if (d.medical80DDB === 'senior') ddbValue = 100000;

  // 7. Section 80E (Education Interest)
  const eduLoan = d.educationLoanInterest || 0;

  // 8. Section 80EE (Home Loan Extra Interest)
  const extraHomeLoanInterest = Math.min(d.homeLoanInterest80EE || 0, 50000);

  // 9. Section 80G - Donations
  // Capped at 10% of Gross Total Income
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

  // 12. Section 80TTA - Savings interest up to 10k (non-senior)
  // 13. Section 80TTB - Deposit interest up to 50k (senior)
  let interestDeduction = 0;
  if (d.isSeniorCitizen) {
    interestDeduction = Math.min(d.seniorInterest80TTB || 0, 50000);
  } else {
    interestDeduction = Math.min(d.savingsInterest80TTA || 0, 10000);
  }

  // 14. Section 80U - Self disability
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
    totalDeductions: Math.min(totalDeductions, grossTotalIncome), // cannot exceed total income
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
  let tax = 0;

  if (regime === 'new') {
    // Slabs:
    // Up to 3,00,000 : Nil
    // 3,00,001 - 7,00,000: 5% (reabte applies below)
    // 7,00,001 - 10,00,000: 10%
    // 10,00,001 - 12,00,000: 15%
    // 12,00,001 - 15,00,000: 20%
    // Above 15,00,000: 30%
    if (income <= 300000) return 0;
    
    if (income <= 700000) {
      tax = (income - 300000) * 0.05;
    } else if (income <= 1000000) {
      tax = 400000 * 0.05 + (income - 700000) * 0.10;
    } else if (income <= 1200000) {
      tax = 400000 * 0.05 + 300000 * 0.10 + (income - 1000000) * 0.15;
    } else if (income <= 1500000) {
      tax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + (income - 1200000) * 0.20;
    } else {
      tax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + 300000 * 0.20 + (income - 1500000) * 0.30;
    }
  } else {
    // OLD Regime
    // Determine slab based on age
    let limit1 = 250000;
    let limit2 = 500000;
    let limit3 = 1000000;

    if (d.isSuperSeniorCitizen) {
      // 80+ years
      limit1 = 500000;
      if (income <= 500000) return 0;
      if (income <= 1000000) {
        tax = (income - 500000) * 0.20;
      } else {
        tax = 500000 * 0.20 + (income - 1000000) * 0.30;
      }
    } else if (d.isSeniorCitizen) {
      // 60-80 years
      limit1 = 300000;
      if (income <= 300000) return 0;
      if (income <= 500000) {
        tax = (income - limit1) * 0.05;
      } else if (income <= 1000000) {
        tax = 200000 * 0.05 + (income - 500000) * 0.20;
      } else {
        tax = 200000 * 0.05 + 500000 * 0.20 + (income - 1000000) * 0.30;
      }
    } else {
      // General Public (Below 60)
      if (income <= 250000) return 0;
      if (income <= 500000) {
        tax = (income - 250000) * 0.05;
      } else if (income <= 1000000) {
        tax = 250000 * 0.05 + (income - 500000) * 0.20;
      } else {
        tax = 250000 * 0.05 + 500000 * 0.20 + (income - 1000000) * 0.30;
      }
    }
  }

  return Math.round(tax);
}

function calculateRebate87A(income: number, tax: number, regime: 'old' | 'new'): number {
  if (income <= 0 || tax <= 0) return 0;
  
  if (regime === 'new') {
    // New regime rebate is available up to taxable income of Rs. 7,00,000
    // Rebate covers tax fully up to taxable income of Rs. 7,00,000 (max rebate Rs. 25,000)
    // There is marginal relief for taxable income slightly above 7 Lakhs under the current budget rules.
    // Standard Rebate:
    if (income <= 700000) {
      return tax; // full rebate
    }
    // Marginal relief logic: If taxable income > 7,00,000, 
    // the tax payable should not exceed the income exceeding 7,00,000.
    // e.g. if income is 7,15,000, tax under standard slab is 21,500. 
    // Excess income is 15,000. The rebate will be: tax (21,500) - excess income (15,000) = 6,500.
    // This reduces the liability to exactly the excess income (15,000) which saves tax!
    const excess = income - 700000;
    if (tax > excess) {
      return tax - excess; // reduce tax to exactly excess income
    }
  } else {
    // Old regime: rebate is available up to taxable income of Rs. 5,00,000
    // Max rebate Rs. 12,500
    if (income <= 500000) {
      return Math.min(tax, 12500);
    }
  }
  return 0;
}

function calculateSurcharge(taxableIncome: number, taxAmount: number): number {
  // Surcharges on high incomes
  // 50L - 1cr: 10%
  // 1cr - 2cr: 15%
  // 2cr - 5cr: 25%
  // New Regime FY 24-25 caps surcharge at 25% (previously 37% in old regime above 5cr)
  if (taxableIncome <= 5000000) return 0;
  
  let rate = 0;
  if (taxableIncome > 5000000 && taxableIncome <= 10000000) rate = 0.10;
  else if (taxableIncome > 10000000 && taxableIncome <= 20000000) rate = 0.15;
  else if (taxableIncome > 20000000) rate = 0.25; // standard cap of 25% in new regime and old regime usually now
  
  return Math.round(taxAmount * rate);
}

function findIndiaDeductionBreakEven(
  income: IndiaIncomeInputs,
  deductions: IndiaDeductions,
  rentPaid: number,
  isMetro: boolean
): number {
  // Simple numerical solver to estimate what amount of additional general 80C/80D/etc. deductions is needed
  // under the Old regime to match the tax liability of the New regime.
  // We run a simulation with increasing additional deductions in steps of Rs 5,000 until Old <= New
  
  const simulationResult = calculateIndiaTax(income, deductions, rentPaid, isMetro, true);
  if (simulationResult.betterRegime === 'old') {
    return 0; // Old is already better!
  }

  const oldTax = simulationResult.oldRegime.totalTaxPayable;
  const newTax = simulationResult.newRegime.totalTaxPayable;
  if (oldTax <= newTax) return 0;

  // Simulate increasing 80C/other deductions up to Rs. 5 Lakhs
  let addedDeductions = 0;
  const maxSimulation = 350000; // reasonable limit of additional deductions possible
  
  while (addedDeductions < maxSimulation) {
    addedDeductions += 5000;
    const simulatedDeductions: IndiaDeductions = {
      ...deductions,
      lifeInsurance: deductions.lifeInsurance + addedDeductions, // simulate increasing deductions
    };
    const sim = calculateIndiaTax(income, simulatedDeductions, rentPaid, isMetro, true);
    if (sim.oldRegime.totalTaxPayable <= newTax) {
      return addedDeductions;
    }
  }

  return maxSimulation; // if even 3.5L can't breach it
}
