import React, { useState } from 'react';
import ValidatedNumberInput from '../components/ValidatedNumberInput';
import HowWeCalculate from '../components/HowWeCalculate';
import { Percent, ShieldAlert, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HraCalculator() {
  const [basic, setBasic] = useState(600000);
  const [da, setDa] = useState(50000);
  const [hraReceived, setHraReceived] = useState(250000);
  const [rentPaid, setRentPaid] = useState(180000);
  const [isMetro, setIsMetro] = useState(true);

  const basicPlusDa = basic + da;
  const opt1 = hraReceived;
  const opt2 = Math.max(0, rentPaid - 0.1 * basicPlusDa);
  const opt3 = (isMetro ? 0.5 : 0.4) * basicPlusDa;

  const exemptHra = Math.round(Math.min(opt1, opt2, opt3));
  const taxableHra = Math.round(Math.max(0, hraReceived - exemptHra));

  const breakdowns = [
    {
      range: 'Actual HRA Received',
      rate: 'HRA received from employer',
      taxableAmountInSlab: hraReceived,
      taxForSlab: opt1,
    },
    {
      range: 'Rent Paid minus 10% of Basic+DA',
      rate: `Rent (${rentPaid.toLocaleString()}) - 10% of (${basicPlusDa.toLocaleString()})`,
      taxableAmountInSlab: Math.max(0, rentPaid - 0.1 * basicPlusDa),
      taxForSlab: opt2,
    },
    {
      range: isMetro ? '50% of Basic+DA (Metro)' : '40% of Basic+DA (Non-Metro)',
      rate: isMetro ? '50% of wage base' : '40% of wage base',
      taxableAmountInSlab: basicPlusDa,
      taxForSlab: opt3,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="hra_page_wrapper">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 text-gray-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">India House Rent Allowance (HRA) Calculator</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Calculate tax-exempt and taxable elements of your HRA under Section 10(13A).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 rounded-2xl space-y-4">
          <h2 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Percent size={14} className="text-blue-500" />
            Salary & Rent Parameters
          </h2>

          <div className="space-y-4">
            <ValidatedNumberInput
              id="hra_basic"
              label="Annual Basic Salary"
              value={basic}
              onChange={setBasic}
              prefix="₹"
              tooltip="Primary salary element excluding bonuses."
            />
            <ValidatedNumberInput
              id="hra_da"
              label="Annual Dearness Allowance (DA)"
              value={da}
              onChange={setDa}
              prefix="₹"
              tooltip="Typically applies to government or specific salary contracts."
            />
            <ValidatedNumberInput
              id="hra_received"
              label="Annual HRA Received"
              value={hraReceived}
              onChange={setHraReceived}
              prefix="₹"
              tooltip="The total HRA component component provided in your CTC salary package."
            />
            <ValidatedNumberInput
              id="hra_rent_paid"
              label="Annual Rent Paid"
              value={rentPaid}
              onChange={setRentPaid}
              prefix="₹"
              tooltip="Total cash rent paid to your landlord during the fiscal year."
            />

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                City Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsMetro(true)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    isMetro
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                      : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  Metro (Mumbai, Delhi, Kolkata, Chennai)
                </button>
                <button
                  onClick={() => setIsMetro(false)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    !isMetro
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                      : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  Non-Metro City
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 rounded-2xl space-y-6">
            <h2 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">HRA Estimation Summary</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-950/30 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-green-600 dark:text-green-400 tracking-wider">Exempt HRA (Tax-Free)</span>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">₹ {exemptHra.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-950/30 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-500 dark:text-blue-400 tracking-wider">Taxable HRA</span>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">₹ {taxableHra.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs border-b border-slate-50 dark:border-slate-850 pb-2">
                <span className="text-gray-500 dark:text-slate-400 font-medium">HRA component:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-white">₹ {hraReceived.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-slate-50 dark:border-slate-850 pb-2">
                <span className="text-gray-500 dark:text-slate-400 font-medium">Total Rent Paid:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-white">₹ {rentPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs pb-1">
                <span className="text-gray-500 dark:text-slate-400 font-medium">Wage Base (Basic + DA):</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-white">₹ {basicPlusDa.toLocaleString()}</span>
              </div>
            </div>

            {taxableHra > 0 && (
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-950/30 text-[11px] text-amber-850 dark:text-amber-400 rounded-lg flex items-start gap-2 leading-relaxed">
                <ShieldAlert size={15} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> You can increase your exempt HRA to the maximum limit by allocating more salary or paying optimal rent up to 10% above basic.
                </span>
              </div>
            )}
          </div>

          <HowWeCalculate
            id="hra_calc"
            taxableIncome={hraReceived}
            totalTax={exemptHra}
            currency="₹"
            breakdowns={breakdowns}
          />
        </div>
      </div>
    </div>
  );
}
