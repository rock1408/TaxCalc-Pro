/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ⚠️ UPDATE EVERY BUDGET CYCLE — see source URLs below
// Source: IRS Rev. Proc. 2025-32, SSA.gov, OBBBA (One Big Beautiful Bill Act)

export const usaTaxMeta = {
  lastUpdated: 'November 2025',
  sourceUrl: 'https://www.irs.gov',
  actName: 'One Big Beautiful Bill Act (OBBBA) / TCJA 2026',
  taxYear: 'Tax Year 2026',
};

export const USA_TAX_CONFIG = {
  // --- 2026 Standard Deductions ---
  standardDeductions: {
    Single: 16100,
    MFJ: 32200,
    HoH: 24150,
    MFS: 16100,
    QSS: 32200,
  },

  // --- 65+ Additional Standard Deduction ---
  additionalDeduction65Plus: {
    Single: 2050,
    MFS: 2050,
    HoH: 2050,
    MFJ: 1650, // per qualifying spouse
    QSS: 1650,
  },

  // --- OBBBA Senior Deduction ($6,000 per senior, phases out at 6% above thresholds) ---
  obbbaSeniorDeduction: {
    amountPerSenior: 6000,
    phaseOutRate: 0.06, // 6% phaseout rate
    phaseOutThreshold: {
      Single: 75000,
      MFS: 75000,
      HoH: 75000, // standard single threshold
      MFJ: 150000,
      QSS: 150000,
    },
  },

  // --- 2026 Federal Income Tax Brackets ---
  federalBrackets: {
    Single: [
      { limit: 12400, rate: 0.10 },
      { limit: 50400, rate: 0.12 },
      { limit: 105700, rate: 0.22 },
      { limit: 201775, rate: 0.24 },
      { limit: 256225, rate: 0.32 },
      { limit: 640600, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ],
    MFJ: [
      { limit: 24800, rate: 0.10 },
      { limit: 100800, rate: 0.12 },
      { limit: 211400, rate: 0.22 },
      { limit: 403550, rate: 0.24 },
      { limit: 512450, rate: 0.32 },
      { limit: 768700, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ],
    HoH: [
      { limit: 17700, rate: 0.10 },
      { limit: 67450, rate: 0.12 },
      { limit: 105700, rate: 0.22 },
      { limit: 201775, rate: 0.24 },
      { limit: 256200, rate: 0.32 },
      { limit: 640600, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ],
    MFS: [
      { limit: 12400, rate: 0.10 },
      { limit: 50400, rate: 0.12 },
      { limit: 105700, rate: 0.22 },
      { limit: 201775, rate: 0.24 },
      { limit: 256225, rate: 0.32 },
      { limit: 384350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ],
    QSS: [
      { limit: 24800, rate: 0.10 },
      { limit: 100800, rate: 0.12 },
      { limit: 211400, rate: 0.22 },
      { limit: 403550, rate: 0.24 },
      { limit: 512450, rate: 0.32 },
      { limit: 768700, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ],
  },

  // --- 2026 Long-Term Capital Gains Brackets ---
  ltcgThresholds: {
    Single: [
      { limit: 47025, rate: 0.00 },
      { limit: 518900, rate: 0.15 },
      { limit: Infinity, rate: 0.20 },
    ],
    MFJ: [
      { limit: 94050, rate: 0.00 },
      { limit: 583750, rate: 0.15 },
      { limit: Infinity, rate: 0.20 },
    ],
    HoH: [
      { limit: 63000, rate: 0.00 },
      { limit: 551350, rate: 0.15 },
      { limit: Infinity, rate: 0.20 },
    ],
    MFS: [
      { limit: 47025, rate: 0.00 },
      { limit: 291850, rate: 0.15 },
      { limit: Infinity, rate: 0.20 },
    ],
    QSS: [
      { limit: 94050, rate: 0.00 },
      { limit: 583750, rate: 0.15 },
      { limit: Infinity, rate: 0.20 },
    ],
  },

  // --- FICA / Payroll Rates (2026) ---
  fica: {
    socialSecurity: {
      employeeRate: 0.062,
      employerRate: 0.062,
      wageBaseLimit: 184500, // 2026 SSA Wage Base
    },
    medicare: {
      employeeRate: 0.0145,
      employerRate: 0.0145,
    },
    additionalMedicare: {
      rate: 0.009,
      thresholds: {
        Single: 200000,
        MFS: 125000,
        MFJ: 250000,
        HoH: 200000,
        QSS: 250000,
      },
    },
  },

  // --- Other Pre-Tax limits ---
  fringeBenefits: {
    qualifiedTransportationMonthlyLimit: 340,
    healthFsaLimit: 3400,
    healthFsaCarryover: 680,
    foreignEarnedIncomeExclusion: 132900,
    annualGiftExclusion: 19000,
    annualGiftExclusionNonCitizenSpouse: 194000,
    studentLoanInterestMaxDeduction: 2500,
    educatorExpensesMaxDeduction: 300,
  },

  // --- State Income Taxes (Config-driven estimator for Top 15 States) ---
  stateTaxes: {
    // No-income-tax states
    TX: { name: 'Texas', type: 'none' },
    FL: { name: 'Florida', type: 'none' },
    WA: { name: 'Washington', type: 'none' }, // WA has capital gains tax, but 0 on wage income
    NV: { name: 'Nevada', type: 'none' },
    TN: { name: 'Tennessee', type: 'none' },
    WY: { name: 'Wyoming', type: 'none' },
    SD: { name: 'South Dakota', type: 'none' },
    AK: { name: 'Alaska', type: 'none' },
    NH: { name: 'New Hampshire', type: 'none' }, // NH phasing out interest/dividend tax

    // Flat rate states
    IL: { name: 'Illinois', type: 'flat', rate: 0.0495 },
    PA: { name: 'Pennsylvania', type: 'flat', rate: 0.0307 },
    MA: { name: 'Massachusetts', type: 'flat', rate: 0.05 },
    MI: { name: 'Michigan', type: 'flat', rate: 0.0425 },
    NC: { name: 'North Carolina', type: 'flat', rate: 0.045 },
    AZ: { name: 'Arizona', type: 'flat', rate: 0.025 },

    // Progressive states (with simplified representative brackets)
    NY: {
      name: 'New York',
      type: 'progressive',
      brackets: {
        Single: [
          { limit: 17150, rate: 0.04 },
          { limit: 23600, rate: 0.045 },
          { limit: 80650, rate: 0.0525 },
          { limit: 215400, rate: 0.0585 },
          { limit: 1077550, rate: 0.0625 },
          { limit: Infinity, rate: 0.0685 },
        ],
        MFJ: [
          { limit: 34300, rate: 0.04 },
          { limit: 47200, rate: 0.045 },
          { limit: 161300, rate: 0.0525 },
          { limit: 430800, rate: 0.0585 },
          { limit: 2155100, rate: 0.0625 },
          { limit: Infinity, rate: 0.0685 },
        ],
      },
    },
    CA: {
      name: 'California',
      type: 'progressive',
      brackets: {
        Single: [
          { limit: 10412, rate: 0.01 },
          { limit: 24684, rate: 0.02 },
          { limit: 38959, rate: 0.04 },
          { limit: 54081, rate: 0.06 },
          { limit: 68350, rate: 0.08 },
          { limit: 349137, rate: 0.093 },
          { limit: 418961, rate: 0.103 },
          { limit: 698271, rate: 0.113 },
          { limit: Infinity, rate: 0.123 },
        ],
        MFJ: [
          { limit: 20824, rate: 0.01 },
          { limit: 49368, rate: 0.02 },
          { limit: 77918, rate: 0.04 },
          { limit: 108162, rate: 0.06 },
          { limit: 136700, rate: 0.08 },
          { limit: 698274, rate: 0.093 },
          { limit: 837922, rate: 0.103 },
          { limit: 1396542, rate: 0.113 },
          { limit: Infinity, rate: 0.123 },
        ],
      },
    },
    GA: {
      name: 'Georgia',
      type: 'flat', // GA is moving to flat 5.49% for 2026
      rate: 0.0539,
    },
    OH: {
      name: 'Ohio',
      type: 'progressive',
      brackets: {
        Single: [
          { limit: 26050, rate: 0.00 },
          { limit: 46100, rate: 0.0275 },
          { limit: 100000, rate: 0.03226 },
          { limit: Infinity, rate: 0.0350 },
        ],
        MFJ: [
          { limit: 26050, rate: 0.00 },
          { limit: 46100, rate: 0.0275 },
          { limit: 100000, rate: 0.03226 },
          { limit: Infinity, rate: 0.0350 },
        ],
      },
    },
    VA: {
      name: 'Virginia',
      type: 'progressive',
      brackets: {
        Single: [
          { limit: 3000, rate: 0.02 },
          { limit: 5000, rate: 0.03 },
          { limit: 17000, rate: 0.05 },
          { limit: Infinity, rate: 0.0575 },
        ],
        MFJ: [
          { limit: 3000, rate: 0.02 },
          { limit: 5000, rate: 0.03 },
          { limit: 17000, rate: 0.05 },
          { limit: Infinity, rate: 0.0575 },
        ],
      },
    },
    NJ: {
      name: 'New Jersey',
      type: 'progressive',
      brackets: {
        Single: [
          { limit: 20000, rate: 0.014 },
          { limit: 35000, rate: 0.0175 },
          { limit: 40000, rate: 0.035 },
          { limit: 75000, rate: 0.05525 },
          { limit: 500000, rate: 0.0637 },
          { limit: 1000000, rate: 0.0897 },
          { limit: Infinity, rate: 0.1075 },
        ],
        MFJ: [
          { limit: 20000, rate: 0.014 },
          { limit: 50000, rate: 0.0175 },
          { limit: 70000, rate: 0.0245 },
          { limit: 80000, rate: 0.035 },
          { limit: 150000, rate: 0.05525 },
          { limit: 500000, rate: 0.0637 },
          { limit: 1000000, rate: 0.0897 },
          { limit: Infinity, rate: 0.1075 },
        ],
      },
    },
  } as Record<string, { name: string; type: 'none' | 'flat' | 'progressive'; rate?: number; brackets?: Record<string, Array<{ limit: number; rate: number }>> }>,
};
