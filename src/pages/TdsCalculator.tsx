import React, { useState } from 'react';
import ValidatedNumberInput from '../components/ValidatedNumberInput';
import HowWeCalculate from '../components/HowWeCalculate';
import { ShieldCheck, AlertCircle, ArrowLeft, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';

type TdsType = 'individual' | 'commercial_property' | 'commercial_machinery';

export default function TdsCalculator() {
  const [rent, setRent] = useState(65000); // monthly rent
  const [rentType, setRentType] = useState<TdsType>('individual');
  const [hasPan, setHasPan] = useState(true);

  const annualRent = rent * 12;
  let applies = false;
  let rate = 0;
  let ruleText = '';
  let section = '';

  if (rentType === 'individual') {
    section = 'Section 194-IB';
    // Individual tenant: applies if monthly rent exceeds Rs. 50,000
    if (rent > 50000) {
      applies = true;
      rate = hasPan ? 0.05 : 0.20; // 5% if PAN present, 20% if not
      ruleText = 'Individual tenant paying rent exceeding ₹50,000 per month is subject to TDS.';
    } else {
      ruleText = 'Monthly rent is under ₹50,000. Individual tenants are exempt from TDS.';
    }
  } else {
    section = 'Section 194-I';
    // Commercial tenant: applies if annual rent exceeds Rs. 2,400,000
    if (annualRent > 240000) {
      applies = true;
      if (rentType === 'commercial_property') {
        rate = hasPan ? 0.10 : 0.20; // 10% on land/building/furniture
        ruleText = 'Commercial rent for land or building exceeding ₹2,40,000 annually is subject to 10% TDS.';
      } else {
        rate = hasPan ? 0.02 : 0.20; // 2% on plant & machinery
        ruleText = 'Commercial rent for plant & machinery leasing exceeding ₹2,40,000 annually is subject to 2% TDS.';
      }
    } else {
      ruleText = 'Annual commercial rent is under ₹2,40,000. Commercial tenants are exempt from TDS.';
    }
  }

  const monthlyTds = applies ? Math.round(rent * rate) : 0;
  const annualTds = monthlyTds * 12;
  const netRentPaid = rent - monthlyTds;

  const breakdowns = [
    {
      range: 'Monthly Rent Amount',
      rate: `₹ ${rent.toLocaleString()}`,
      taxableAmountInSlab: rent,
      taxForSlab: rent,
    },
    {
      range: 'Applicable TDS Rate',
      rate: `${(rate * 100).toFixed(1)}%`,
      taxableAmountInSlab: applies ? rent : 0,
      taxForSlab: monthlyTds,
    },
    {
      range: 'Annual Projection',
      rate: '12 months accrued',
      taxableAmountInSlab: annualRent,
      taxForSlab: annualTds,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="tds_page_wrapper">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 text-gray-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">India TDS on Rent Calculator</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Estimate withholding tax rules for home or office rent payments under Section 194-I & 194-IB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Parameters */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 rounded-2xl space-y-4">
          <h2 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Percent size={14} className="text-blue-500" />
            TDS Parameters
          </h2>

          <div className="space-y-4">
            <ValidatedNumberInput
              id="tds_monthly_rent"
              label="Monthly Rent Amount"
              value={rent}
              onChange={setRent}
              prefix="₹"
              tooltip="The rent paid to your landlord every month."
            />

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                Tenant & Rent Category
              </label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setRentType('individual')}
                  className={`w-full py-2 px-3 text-left text-xs font-semibold rounded-lg border transition-all ${
                    rentType === 'individual'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                      : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold">Individual / HUF Tenant (Residential)</p>
                  <p className="text-[10px] text-gray-400 font-normal">Section 194-IB. Exemption up to ₹50,000/month.</p>
                </button>
                <button
                  onClick={() => setRentType('commercial_property')}
                  className={`w-full py-2 px-3 text-left text-xs font-semibold rounded-lg border transition-all ${
                    rentType === 'commercial_property'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                      : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold">Corporate / Commercial Property Tenant</p>
                  <p className="text-[10px] text-gray-400 font-normal">Section 194-I. Exemption up to ₹2,40,000/year (10% rate).</p>
                </button>
                <button
                  onClick={() => setRentType('commercial_machinery')}
                  className={`w-full py-2 px-3 text-left text-xs font-semibold rounded-lg border transition-all ${
                    rentType === 'commercial_machinery'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                      : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold">Plant & Machinery Lease / Rental</p>
                  <p className="text-[10px] text-gray-400 font-normal">Section 194-I. Exemption up to ₹2,40,000/year (2% rate).</p>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                Does Landlord have PAN Card?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setHasPan(true)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    hasPan
                      ? 'border-green-500 bg-green-50/50 text-green-600 dark:bg-green-950/20 dark:text-green-450'
                      : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  Yes (Standard Rate)
                </button>
                <button
                  onClick={() => setHasPan(false)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    !hasPan
                      ? 'border-red-500 bg-red-50/50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                      : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  No PAN (Flat 20% TDS Penalty)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 rounded-2xl space-y-6">
            <h2 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">TDS Assessment Status</h2>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed text-xs leading-relaxed font-semibold bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850">
              {applies ? (
                <>
                  <AlertCircle size={20} className="text-red-500 shrink-0" />
                  <span className="text-red-800 dark:text-red-400">
                    TDS is APPLICABLE under {section}. Deduct tax before paying your landlord.
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck size={20} className="text-green-500 shrink-0" />
                  <span className="text-green-800 dark:text-green-400">
                    No TDS is required. Payments are within exemption thresholds.
                  </span>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-950/30 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-500 dark:text-blue-450 tracking-wider">Monthly TDS To Deduct</span>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">₹ {monthlyTds.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/30 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 tracking-wider">Annual TDS Accumulated</span>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">₹ {annualTds.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs border-b border-slate-50 dark:border-slate-850 pb-2">
                <span className="text-gray-500 dark:text-slate-400 font-medium">Monthly Gross Rent:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-white">₹ {rent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-slate-50 dark:border-slate-850 pb-2">
                <span className="text-gray-500 dark:text-slate-400 font-medium">TDS Rate:</span>
                <span className="font-mono font-bold text-blue-500">{(rate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs pb-1">
                <span className="text-gray-500 dark:text-slate-400 font-medium">Net Monthly Rent To Pay Landlord:</span>
                <span className="font-mono font-bold text-green-600">₹ {netRentPaid.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 text-[10px] text-slate-500 font-medium rounded-lg leading-relaxed">
              <strong>Statutory Note:</strong> {ruleText} TDS must be deposited with the Indian Income Tax Department within the specified due dates to prevent penalty interest charges (normally 1.5% per month).
            </div>
          </div>

          <HowWeCalculate
            id="tds_calc"
            taxableIncome={rent}
            totalTax={monthlyTds}
            currency="₹"
            breakdowns={breakdowns}
          />
        </div>
      </div>
    </div>
  );
}
