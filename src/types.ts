/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Country = 'INDIA' | 'USA';

export type TabId = 'income' | 'crypto' | 'compare' | 'insights';

// --- INDIA TYPES ---
export interface IndiaIncomeInputs {
  // Salary Income
  grossSalary: number;
  basicSalary: number;
  dearnessAllowance: number;
  hra: number;
  transportAllowance: number;
  medicalAllowance: number;
  bonus: number;
  leaveEncashment: number;
  otherAllowances: number;

  // House Property
  rentalIncome: number;
  municipalTaxes: number;
  homeLoanInterest: number;

  // Business/Profession
  businessReceipts: number;
  professionalReceipts: number;
  businessExpenses: number;
  professionalExpenses: number;

  // Capital Gains
  stcgStocks: number;
  ltcgStocks: number;
  stcgMF: number;
  ltcgMF: number;
  otherCapitalGains: number;

  // Other Sources
  interestIncome: number;
  dividendIncome: number;
  machineryRental: number;
  familyPension: number;
  otherSources: number;
}

export interface IndiaDeductions {
  // 80C
  lifeInsurance: number;
  ppf: number;
  epf: number;
  elss: number;
  nsc: number;
  sukanyaSamriddhi: number;
  taxSavingFd: number;
  homeLoanPrincipal: number;
  tuitionFees: number;
  stampDuty: number;

  // Other Sections
  npsEmployee80CCD1: number;
  npsEmployer80CCD2: number;
  npsExtra80CCD1B: number; // up to 50k extra NPS
  healthPremiumSelf: number;
  healthPremiumParents: number; // under 60 or above 60
  healthPremiumParentsSenior: boolean;
  preventiveCheckup: number;
  disability80DD: 'none' | 'normal' | 'severe'; // normal = 75k, severe = 125k
  medical80DDB: 'none' | 'normal' | 'senior'; // normal = up to 40k, senior = up to 100k
  educationLoanInterest: number;
  homeLoanInterest80EE: number; // up to 50k
  donations80G100: number; // 100% deduction
  donations80G50: number; // 50% deduction
  rentPaid80GG: number;
  politicalDonations80GGC: number;
  savingsInterest80TTA: number; // up to 10,000 (non-seniors)
  seniorInterest80TTB: number; // up to 50,000 (seniors)
  disability80U: 'none' | 'normal' | 'severe'; // self disability
  isSeniorCitizen: boolean; // 60-80 years
  isSuperSeniorCitizen: boolean; // 80+ years
}

export interface IndiaTaxResult {
  regime: 'old' | 'new';
  grossTotalIncome: number;
  salaryHead: number;
  housePropertyHead: number;
  businessHead: number;
  capitalGainsHead: number;
  otherSourcesHead: number;
  deductions80C: number;
  totalDeductionsValue: number;
  taxableIncome: number;
  basicTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  cess: number;
  surcharge: number;
  totalTaxPayable: number;
  effectiveTaxRate: number;
  takeHomeAnnual: number;
  takeHomeMonthly: number;
}

export interface IndiaRegimeComparison {
  oldRegime: IndiaTaxResult;
  newRegime: IndiaTaxResult;
  betterRegime: 'old' | 'new';
  taxSavings: number;
  breakEvenPoints: {
    deductionsNeeded: number;
  };
}

// --- USA TYPES ---
export type FilingStatus = 'Single' | 'MFJ' | 'MFS' | 'HoH' | 'QSS';

export interface UsaIncomeInputs {
  // Wages/Salary
  annualSalary: number;
  bonusCommission: number;
  overtime: number;
  tips: number;
  otherWages: number;

  // Investment
  interestIncome: number;
  ordinaryDividends: number;
  qualifiedDividends: number;
  stcg: number;
  ltcg: number;
  municipalInterest: number;
  otherInvestments: number;

  // Business
  businessRevenue: number;
  businessExpenses: number;

  // Retirement
  iraDistributions: number;
  fourOhOneKDistributions: number;
  pensionIncome: number;
  socialSecurityBenefits: number;
  socialSecurityTaxablePct: number; // custom taxable percentage

  // Other
  rentalIncome: number;
  royalties: number;
  unemploymentComp: number;
  alimonyReceived: number;
  otherIncome: number;
}

export interface UsaAdjustments {
  iraDeduction: number;
  studentLoanInterest: number;
  selfEmploymentTaxHalf: number; // typically auto-calculated but user can inspect/override
  seHealthInsurance: number;
  alimonyPaid: number;
  educatorExpenses: number; // capped at $300
  hsaDeduction: number;
  movingExpenses: number;
}

export interface UsaDeductions {
  isItemized: boolean;
  // Itemized fields
  medicalExpensesExceedingCap: number; // actual amount (we verify > 7.5% inside calc)
  medicalExpensesRaw: number;
  stateIncomeTax: number;
  realEstateTax: number;
  personalPropertyTax: number;
  mortgageInterestPrimary: number; // primary capped
  mortgageInterestEquity: number; // equity capped
  charityCash: number;
  charityAssets: number;
  casualtyLosses: number;
  otherItemized: number;
  // Senior citizen status fields (OBBBA & Standard Additional Deduction)
  isSenior65Plus?: boolean;
  spouseSenior65Plus?: boolean;
}

export interface UsaCredits {
  eitc: number;
  childTaxCreditRefundable: number;
  childTaxCreditNonRefundable: number; // standard $2,000/child
  numQualifyingChildren: number;
  americanOpportunity: number;
  premiumTaxCredit: number;
  lifetimeLearning: number;
  saversCredit: number;
  foreignTaxCredit: number;
  residentialCleanEnergy: number;
  otherCredits: number;
}

export interface UsaTaxResult {
  filingStatus: FilingStatus;
  selectedState: string;
  grossIncome: number;
  totalAdjustments: number;
  adjustedGrossIncome: number;
  standardOrItemizedDeductionValue: number;
  usingItemized: boolean;
  taxableIncome: number;
  federalTaxOnIncome: number;
  capitalGainsTax: number;
  niitTax: number;
  selfEmploymentTax: number;
  totalTaxBeforeCredits: number;
  totalCredits: number;
  netFederalLiability: number;
  estimatedStateTax: number;
  totalTaxLiability: number;
  effectiveTaxRate: number;
  takeHomeAnnual: number;
  takeHomeMonthly: number;
}

// --- CRYPTO TYPES ---
export type CryptoTxType = 'BUY' | 'SELL' | 'MINING' | 'STAKING' | 'AIRDROP' | 'NFT_BUY' | 'NFT_SELL' | 'GIFT_IN' | 'GIFT_OUT';

export type CostBasisMethod = 'FIFO' | 'LIFO' | 'HIFO' | 'AVG';

export interface CryptoTransaction {
  id: string;
  timestamp: string; // ISO String
  type: CryptoTxType;
  currency: string; // e.g., 'BTC', 'ETH', 'SOL'
  quantity: number;
  unitPrice: number; // in INR/USD based on country
  fee: number;
  platform: string;
  txHash?: string;
  walletAddress?: string; // USA specific
  details?: string; // memo or notes
}

export interface CryptoGainResult {
  txId: string;
  timestamp: string;
  currency: string;
  quantity: number;
  saleProceeds: number;
  costBasis: number;
  gainOrLoss: number;
  holdingPeriodDays: number;
  classification: 'STCG' | 'LTCG';
  taxRatePercent: number;
  estimatedTax: number;
}

export interface CryptoPortfolioSummary {
  totalInvestment: number;
  totalProceeds: number;
  stcgGains: number;
  ltcgGains: number;
  totalGains: number;
  stcgTax: number;
  ltcgTax: number;
  totalCryptoTax: number;
  gainsList: CryptoGainResult[];
}

// --- APP LOCALSTORAGE PREFERENCE ---
export interface AppState {
  country: Country;
  theme: 'light' | 'dark';
  indiaIncome: IndiaIncomeInputs;
  indiaDeductions: IndiaDeductions;
  usaIncome: UsaIncomeInputs;
  usaAdjustments: UsaAdjustments;
  usaDeductions: UsaDeductions;
  usaCredits: UsaCredits;
  usaSelectedState: string;
  cryptoTransactions: CryptoTransaction[];
  cryptoCostBasisMethod: CostBasisMethod;
}
