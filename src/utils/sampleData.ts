/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndiaIncomeInputs, IndiaDeductions, UsaIncomeInputs, UsaAdjustments, UsaDeductions, UsaCredits, CryptoTransaction } from '../types';

export const defaultIndiaIncome: IndiaIncomeInputs = {
  grossSalary: 0,
  basicSalary: 0,
  dearnessAllowance: 0,
  hra: 0,
  transportAllowance: 0,
  medicalAllowance: 0,
  bonus: 0,
  leaveEncashment: 0,
  otherAllowances: 0,
  rentalIncome: 0,
  municipalTaxes: 0,
  homeLoanInterest: 0,
  businessReceipts: 0,
  professionalReceipts: 0,
  businessExpenses: 0,
  professionalExpenses: 0,
  stcgStocks: 0,
  ltcgStocks: 0,
  stcgMF: 0,
  ltcgMF: 0,
  otherCapitalGains: 0,
  interestIncome: 0,
  dividendIncome: 0,
  machineryRental: 0,
  familyPension: 0,
  otherSources: 0,
};

export const defaultIndiaDeductions: IndiaDeductions = {
  lifeInsurance: 0,
  ppf: 0,
  epf: 0,
  elss: 0,
  nsc: 0,
  sukanyaSamriddhi: 0,
  taxSavingFd: 0,
  homeLoanPrincipal: 0,
  tuitionFees: 0,
  stampDuty: 0,
  npsEmployee80CCD1: 0,
  npsEmployer80CCD2: 0,
  npsExtra80CCD1B: 0,
  healthPremiumSelf: 0,
  healthPremiumParents: 0,
  healthPremiumParentsSenior: false,
  preventiveCheckup: 0,
  disability80DD: 'none',
  medical80DDB: 'none',
  educationLoanInterest: 0,
  homeLoanInterest80EE: 0,
  donations80G100: 0,
  donations80G50: 0,
  rentPaid80GG: 0,
  politicalDonations80GGC: 0,
  savingsInterest80TTA: 0,
  seniorInterest80TTB: 0,
  disability80U: 'none',
  isSeniorCitizen: false,
  isSuperSeniorCitizen: false,
};

export const defaultUsaIncome: UsaIncomeInputs = {
  annualSalary: 0,
  bonusCommission: 0,
  overtime: 0,
  tips: 0,
  otherWages: 0,
  interestIncome: 0,
  ordinaryDividends: 0,
  qualifiedDividends: 0,
  stcg: 0,
  ltcg: 0,
  municipalInterest: 0,
  otherInvestments: 0,
  businessRevenue: 0,
  businessExpenses: 0,
  iraDistributions: 0,
  fourOhOneKDistributions: 0,
  pensionIncome: 0,
  socialSecurityBenefits: 0,
  socialSecurityTaxablePct: 0,
  rentalIncome: 0,
  royalties: 0,
  unemploymentComp: 0,
  alimonyReceived: 0,
  otherIncome: 0,
};

export const defaultUsaAdjustments: UsaAdjustments = {
  iraDeduction: 0,
  studentLoanInterest: 0,
  selfEmploymentTaxHalf: 0,
  seHealthInsurance: 0,
  alimonyPaid: 0,
  educatorExpenses: 0,
  hsaDeduction: 0,
  movingExpenses: 0,
};

export const defaultUsaDeductions: UsaDeductions = {
  isItemized: false,
  medicalExpensesExceedingCap: 0,
  medicalExpensesRaw: 0,
  stateIncomeTax: 0,
  realEstateTax: 0,
  personalPropertyTax: 0,
  mortgageInterestPrimary: 0,
  mortgageInterestEquity: 0,
  charityCash: 0,
  charityAssets: 0,
  casualtyLosses: 0,
  otherItemized: 0,
};

export const defaultUsaCredits: UsaCredits = {
  eitc: 0,
  childTaxCreditRefundable: 0,
  childTaxCreditNonRefundable: 0,
  numQualifyingChildren: 0,
  americanOpportunity: 0,
  premiumTaxCredit: 0,
  lifetimeLearning: 0,
  saversCredit: 0,
  foreignTaxCredit: 0,
  residentialCleanEnergy: 0,
  otherCredits: 0,
};

export const defaultCryptoTransactions = (isIndia: boolean): CryptoTransaction[] => {
  return [];
};
