/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ⚠️ UPDATE EVERY BUDGET CYCLE — see source URLs below
// Source: https://www.incometax.gov.in

export const indiaTaxMeta = {
  lastUpdated: 'February 2025',
  sourceUrl: 'https://www.incometax.gov.in',
  actName: 'Income Tax Act 2025',
  financialYear: 'FY 2025-26',
  assessmentYear: 'AY 2026-27',
};

export const INDIA_TAX_CONFIG = {
  // --- New Tax Regime (FY 2025-26) ---
  newRegime: {
    slabs: [
      { limit: 400000, rate: 0.00 },
      { limit: 800000, rate: 0.05 },
      { limit: 1200000, rate: 0.10 },
      { limit: 1600000, rate: 0.15 },
      { limit: 2000000, rate: 0.20 },
      { limit: 2400000, rate: 0.25 },
      { limit: Infinity, rate: 0.30 },
    ],
    standardDeductionSalaried: 75000,
    rebate87ALimit: 1200000,
    rebate87AMax: 60000,
    surchargeCap: 0.25, // capped at 25% max under new regime
  },

  // --- Old Tax Regime (FY 2025-26) ---
  oldRegime: {
    slabsGeneral: [
      { limit: 250000, rate: 0.00 },
      { limit: 500000, rate: 0.05 },
      { limit: 1000000, rate: 0.20 },
      { limit: Infinity, rate: 0.30 },
    ],
    slabsSenior: [
      { limit: 300000, rate: 0.00 },
      { limit: 500000, rate: 0.05 },
      { limit: 1000000, rate: 0.20 },
      { limit: Infinity, rate: 0.30 },
    ],
    slabsSuperSenior: [
      { limit: 500000, rate: 0.00 },
      { limit: 1000000, rate: 0.20 },
      { limit: Infinity, rate: 0.30 },
    ],
    standardDeductionSalaried: 50000,
    rebate87ALimit: 500000,
    rebate87AMax: 12500,
    surchargeCap: 0.37, // top surcharge rate remains up to 37% (>5Cr) in old regime
  },

  // --- Shared Surcharge Limits ---
  surcharges: [
    { limit: 5000000, rate: 0.00 },
    { limit: 10000000, rate: 0.10 },
    { limit: 20000000, rate: 0.15 },
    { limit: 50000000, rate: 0.25 },
    { limit: Infinity, rate: 0.37 }, // only applies to old regime above 5Cr, new regime caps at 25%
  ],

  // --- Deductions Limits (Old Regime) ---
  deductions: {
    section80C_Cap: 150000,
    section80CCD1B_Cap: 50000,
    section80D_SelfLimit: 25000,
    section80D_SelfSeniorLimit: 50000,
    section80D_ParentLimit: 25000,
    section80D_ParentSeniorLimit: 50000,
    section80D_PreventiveCap: 5000,
    section80TTB_Cap: 100000, // Senior savings interest limit
    section80TTA_Cap: 10000, // General savings interest limit
    section24b_SelfOccupiedCap: 200000,
  },

  // --- Reference Rates ---
  cessRate: 0.04, // 4% Health & Education Cess
  tdsOnRentThreshold: 50000, // Rs. 50,000 per month
  tcsLrsThreshold: 1000000, // Rs. 10 Lakh
  stcgEquityRate: 0.20, // 20% post July 2024
  ltcgEquityRate: 0.125, // 12.5% post July 2024
  ltcgEquityExemption: 125000, // Exemption threshold of 1.25L for listed equity LTCG

  // --- State Professional Taxes (Monthly Approximations) ---
  professionalTaxByState: {
    MH: { name: 'Maharashtra', amount: 200, specialFeb: 300, minSalary: 7500 }, // Rs.200/mo, 300 in Feb
    KA: { name: 'Karnataka', amount: 200, minSalary: 25000 }, // Rs.200/mo above 25k
    WB: { name: 'West Bengal', amount: 200, minSalary: 15000 },
    TN: { name: 'Tamil Nadu', amount: 208, minSalary: 12000 }, // half yearly slabs averaged
    AP: { name: 'Andhra Pradesh', amount: 200, minSalary: 15000 },
    GJ: { name: 'Gujarat', amount: 200, minSalary: 12000 },
    MP: { name: 'Madhya Pradesh', amount: 208, minSalary: 18000 },
    TS: { name: 'Telangana', amount: 200, minSalary: 15000 },
    AS: { name: 'Assam', amount: 208, minSalary: 15000 },
    KL: { name: 'Kerala', amount: 200, minSalary: 12000 },
    OD: { name: 'Odisha', amount: 200, minSalary: 13000 },
  } as Record<string, { name: string; amount: number; specialFeb?: number; minSalary: number }>,
};
