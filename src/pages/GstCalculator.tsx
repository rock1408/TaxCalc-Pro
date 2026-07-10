import React, { useState } from 'react';
import ValidatedNumberInput from '../components/ValidatedNumberInput';
import HowWeCalculate from '../components/HowWeCalculate';
import { Percent, ArrowLeft, RefreshCw, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

type GstMode = 'add' | 'remove';

export default function GstCalculator() {
  const [amount, setAmount] = useState(10000);
  const [gstRate, setGstRate] = useState(18); // 5%, 12%, 18%, 28%
  const [mode, setMode] = useState<GstMode>('add');
  const [isInterState, setIsInterState] = useState(false);

  let baseAmount = 0;
  let gstAmount = 0;
  let totalAmount = 0;

  if (mode === 'add') {
    // Add GST (Exclusive of tax)
    baseAmount = amount;
    gstAmount = amount * (gstRate / 100);
    totalAmount = amount + gstAmount;
  } else {
    // Remove GST (Inclusive of tax)
    totalAmount = amount;
    baseAmount = amount / (1 + gstRate / 100);
    gstAmount = totalAmount - baseAmount;
  }

  // Split into CGST + SGST (Intra-state) or IGST (Inter-state)
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const igst = gstAmount;

  const breakdowns = [
    {
      range: 'Original Gross Amount',
      rate: `Base amount`,
      taxableAmountInSlab: baseAmount,
      taxForSlab: baseAmount,
    },
    {
      range: `GST Rate (${gstRate}%)`,
      rate: `${gstRate}% total`,
      taxableAmountInSlab: baseAmount,
      taxForSlab: gstAmount,
    },
    {
      range: isInterState ? 'IGST Component' : 'CGST + SGST Splits',
      rate: isInterState ? '100% Integrated' : '50% Central + 50% State',
      taxableAmountInSlab: isInterState ? igst : cgst,
      taxForSlab: sgst,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="gst_page_wrapper">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 text-gray-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">India GST Slab Calculator</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Perform quick exclusive (add) or inclusive (remove) Goods and Services Tax computations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GST Input card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 rounded-2xl space-y-4">
          <h2 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Percent size={14} className="text-blue-500" />
            GST parameters
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                Calculation Direction
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('add')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    mode === 'add'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                      : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  Add GST (Exclusive)
                </button>
                <button
                  onClick={() => setMode('remove')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    mode === 'remove'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                      : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  Remove GST (Inclusive)
                </button>
              </div>
            </div>

            <ValidatedNumberInput
              id="gst_input_amount"
              label={mode === 'add' ? 'Net Base Amount (Excluding GST)' : 'Gross Bill Amount (Including GST)'}
              value={amount}
              onChange={setAmount}
              prefix="₹"
              tooltip="The numerical currency sum to perform tax computations on."
            />

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                GST Rate slab
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 12, 18, 28].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setGstRate(rate)}
                    className={`py-2 px-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                      gstRate === rate
                        ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                        : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                Supply Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsInterState(false)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    !isInterState
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                      : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  Intra-State (CGST + SGST)
                </button>
                <button
                  onClick={() => setIsInterState(true)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    isInterState
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                      : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-slate-50'
                  }`}
                >
                  Inter-State (IGST)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results layout */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 rounded-2xl space-y-6">
            <h2 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">GST Breakdown Summary</h2>

            <div className="p-4 bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-950/30 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-500 dark:text-blue-400 tracking-wider">GST Tax Amount due</span>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">₹ {gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Base Net Price</span>
                <p className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">₹ {baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Gross Price</span>
                <p className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">₹ {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3">
              <h3 className="font-bold text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Layers size={13} className="text-blue-500" />
                Slab Distribution Splits
              </h3>

              {isInterState ? (
                <div className="flex justify-between text-xs p-2.5 bg-slate-50/50 dark:bg-slate-950/30 rounded-lg">
                  <span className="text-gray-500 dark:text-slate-400 font-medium">IGST (Integrated GST - 100%):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">₹ {igst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50/50 dark:bg-slate-950/30 rounded-lg space-y-1">
                    <span className="text-[10px] text-gray-400 font-semibold block">CGST (Central - 50%)</span>
                    <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">₹ {cgst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50/50 dark:bg-slate-950/30 rounded-lg space-y-1">
                    <span className="text-[10px] text-gray-400 font-semibold block">SGST (State - 50%)</span>
                    <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">₹ {sgst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <HowWeCalculate
            id="gst_calc"
            taxableIncome={baseAmount}
            totalTax={gstAmount}
            currency="₹"
            breakdowns={breakdowns}
          />
        </div>
      </div>
    </div>
  );
}
