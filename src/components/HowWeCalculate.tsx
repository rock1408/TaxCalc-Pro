import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SlabBreakdown {
  range: string;
  rate: string;
  taxableAmountInSlab: number;
  taxForSlab: number;
}

interface HowWeCalculateProps {
  id: string;
  title?: string;
  taxableIncome: number;
  totalTax: number;
  currency: string;
  breakdowns: SlabBreakdown[];
}

export default function HowWeCalculate({
  id,
  title = 'How we calculate this',
  taxableIncome,
  totalTax,
  currency,
  breakdowns,
}: HowWeCalculateProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-150 dark:border-slate-800/80 rounded-xl overflow-hidden bg-white dark:bg-slate-900/40" id={`how_calc_${id}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all focus:outline-none"
        id={`how_calc_trigger_${id}`}
      >
        <span className="flex items-center gap-2">
          <HelpCircle size={15} className="text-blue-500" />
          {title}
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg flex justify-between items-center text-[11px] font-mono border border-slate-100 dark:border-slate-900">
                <div>
                  <span className="text-slate-400">Taxable Base:</span>{' '}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {currency} {taxableIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Total Slab Tax:</span>{' '}
                  <strong className="text-blue-600 dark:text-blue-400">
                    {currency} {totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Slab-by-Slab Calculation Breakdown:</p>
                <div className="border border-slate-100 dark:border-slate-800/60 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead>
                      <tr className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-500">
                        <th className="py-2 px-3">Slab Range ({currency})</th>
                        <th className="py-2 px-3">Rate</th>
                        <th className="py-2 px-3 text-right">Income in Slab</th>
                        <th className="py-2 px-3 text-right">Tax Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {breakdowns.map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                          <td className="py-2 px-3 text-slate-750 dark:text-slate-300">{b.range}</td>
                          <td className="py-2 px-3 text-blue-500">{b.rate}</td>
                          <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400">
                            {currency} {b.taxableAmountInSlab.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </td>
                          <td className={`py-2 px-3 text-right font-bold ${b.taxForSlab > 0 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                            {currency} {b.taxForSlab.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-[10px] italic text-slate-400">
                Note: Standard standard deductions, Section 87A rebates, surcharges, and secondary education cesses (where applicable) are layered on top of these basic slabs to determine the final tax liability.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
