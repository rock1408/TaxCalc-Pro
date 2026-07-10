import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('taxcalc_disclaimer_dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('taxcalc_disclaimer_dismissed', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-950/40 text-amber-800 dark:text-amber-400 py-3 px-4 sm:px-6 lg:px-8 relative z-50 shadow-sm"
          id="disclaimer_banner_wrapper"
        >
          <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Info size={16} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-xs font-semibold leading-normal">
                This tool provides tax estimation models for informational purposes only and is not a substitute for professional tax, legal, or financial advice.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-amber-500 hover:text-amber-800 dark:hover:text-amber-300 rounded-full hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors shrink-0"
              title="Dismiss disclaimer"
              id="disclaimer_dismiss_btn"
            >
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
