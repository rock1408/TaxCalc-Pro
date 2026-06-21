/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Country, TabId, IndiaIncomeInputs, IndiaDeductions, UsaIncomeInputs, UsaAdjustments, UsaDeductions, UsaCredits, CryptoTransaction, CostBasisMethod } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import IncomeSection from './components/IncomeSection';
import CryptoSection from './components/CryptoSection';
import ComparisonSection from './components/ComparisonSection';
import InsightsSection from './components/InsightsSection';
import {
  defaultIndiaIncome,
  defaultIndiaDeductions,
  defaultUsaIncome,
  defaultUsaAdjustments,
  defaultUsaDeductions,
  defaultUsaCredits,
  defaultCryptoTransactions,
} from './utils/sampleData';
import { ShieldCheck, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Global States
  const [country, setCountry] = useState<Country>(() => {
    const saved = localStorage.getItem('taxcalc_country');
    return (saved as Country) || 'INDIA';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('taxcalc_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light';
  });

  const [activeTab, setActiveTab] = useState<TabId>('income');

  // --- MODEL INPUT STATES ---
  const [indiaIncome, setIndiaIncome] = useState<IndiaIncomeInputs>(() => {
    const saved = localStorage.getItem('taxcalc_india_income');
    return saved ? JSON.parse(saved) : { ...defaultIndiaIncome };
  });

  const [indiaDeductions, setIndiaDeductions] = useState<IndiaDeductions>(() => {
    const saved = localStorage.getItem('taxcalc_india_deductions');
    return saved ? JSON.parse(saved) : { ...defaultIndiaDeductions };
  });

  const [usaIncome, setUsaIncome] = useState<UsaIncomeInputs>(() => {
    const saved = localStorage.getItem('taxcalc_usa_income');
    return saved ? JSON.parse(saved) : { ...defaultUsaIncome };
  });

  const [usaAdjustments, setUsaAdjustments] = useState<UsaAdjustments>(() => {
    const saved = localStorage.getItem('taxcalc_usa_adjustments');
    return saved ? JSON.parse(saved) : { ...defaultUsaAdjustments };
  });

  const [usaDeductions, setUsaDeductions] = useState<UsaDeductions>(() => {
    const saved = localStorage.getItem('taxcalc_usa_deductions');
    return saved ? JSON.parse(saved) : { ...defaultUsaDeductions };
  });

  const [usaCredits, setUsaCredits] = useState<UsaCredits>(() => {
    const saved = localStorage.getItem('taxcalc_usa_credits');
    return saved ? JSON.parse(saved) : { ...defaultUsaCredits };
  });

  const [usaSelectedState, setUsaSelectedState] = useState<string>(() => {
    const saved = localStorage.getItem('taxcalc_usa_selected_state');
    return saved || 'CA';
  });

  const [transactions, setTransactions] = useState<CryptoTransaction[]>(() => {
    const saved = localStorage.getItem('taxcalc_crypto_txs');
    if (saved) return JSON.parse(saved);
    // Initialise based on current country context
    return defaultCryptoTransactions(country === 'INDIA');
  });

  const [costBasisMethod, setCostBasisMethod] = useState<CostBasisMethod>(() => {
    const saved = localStorage.getItem('taxcalc_cost_basis_method');
    return (saved as CostBasisMethod) || 'FIFO';
  });

  // --- SYNC LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem('taxcalc_country', country);
  }, [country]);

  useEffect(() => {
    localStorage.setItem('taxcalc_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('taxcalc_india_income', JSON.stringify(indiaIncome));
  }, [indiaIncome]);

  useEffect(() => {
    localStorage.setItem('taxcalc_india_deductions', JSON.stringify(indiaDeductions));
  }, [indiaDeductions]);

  useEffect(() => {
    localStorage.setItem('taxcalc_usa_income', JSON.stringify(usaIncome));
  }, [usaIncome]);

  useEffect(() => {
    localStorage.setItem('taxcalc_usa_adjustments', JSON.stringify(usaAdjustments));
  }, [usaAdjustments]);

  useEffect(() => {
    localStorage.setItem('taxcalc_usa_deductions', JSON.stringify(usaDeductions));
  }, [usaDeductions]);

  useEffect(() => {
    localStorage.setItem('taxcalc_usa_credits', JSON.stringify(usaCredits));
  }, [usaCredits]);

  useEffect(() => {
    localStorage.setItem('taxcalc_usa_selected_state', usaSelectedState);
  }, [usaSelectedState]);

  useEffect(() => {
    localStorage.setItem('taxcalc_crypto_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('taxcalc_cost_basis_method', costBasisMethod);
  }, [costBasisMethod]);

  // Adjust cost basis or initial defaults on country swap
  const handleCountryChange = (c: Country) => {
    setCountry(c);
  };

  const handleResetAllData = () => {
    setIndiaIncome({ ...defaultIndiaIncome });
    setIndiaDeductions({ ...defaultIndiaDeductions });
    setUsaIncome({ ...defaultUsaIncome });
    setUsaAdjustments({ ...defaultUsaAdjustments });
    setUsaDeductions({ ...defaultUsaDeductions });
    setUsaCredits({ ...defaultUsaCredits });
    setUsaSelectedState('CA');
    setCostBasisMethod('FIFO');
    setTransactions(defaultCryptoTransactions(country === 'INDIA'));
    localStorage.clear();
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100" id="main_app_wrapper">
      
      {/* Header element */}
      <Header
        country={country}
        setCountry={handleCountryChange}
        theme={theme}
        toggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetAllData}
      />

      {/* Main viewport Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8" id="viewport_main_wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${country}_${activeTab}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {activeTab === 'income' && (
              <IncomeSection
                country={country}
                indiaIncome={indiaIncome}
                setIndiaIncome={setIndiaIncome}
                indiaDeductions={indiaDeductions}
                setIndiaDeductions={setIndiaDeductions}
                usaIncome={usaIncome}
                setUsaIncome={setUsaIncome}
                usaAdjustments={usaAdjustments}
                setUsaAdjustments={setUsaAdjustments}
                usaDeductions={usaDeductions}
                setUsaDeductions={setUsaDeductions}
                usaCredits={usaCredits}
                setUsaCredits={setUsaCredits}
                usaSelectedState={usaSelectedState}
                setUsaSelectedState={setUsaSelectedState}
              />
            )}

            {activeTab === 'crypto' && (
              <CryptoSection
                country={country}
                transactions={transactions}
                setTransactions={setTransactions}
                costBasisMethod={costBasisMethod}
                setCostBasisMethod={setCostBasisMethod}
              />
            )}

            {activeTab === 'compare' && (
              <ComparisonSection
                country={country}
                indiaIncome={indiaIncome}
                indiaDeductions={indiaDeductions}
                usaIncome={usaIncome}
                usaAdjustments={usaAdjustments}
                usaDeductions={usaDeductions}
                usaCredits={usaCredits}
                usaSelectedState={usaSelectedState}
              />
            )}

            {activeTab === 'insights' && (
              <InsightsSection
                country={country}
                indiaIncome={indiaIncome}
                indiaDeductions={indiaDeductions}
                usaIncome={usaIncome}
                usaAdjustments={usaAdjustments}
                usaDeductions={usaDeductions}
                usaCredits={usaCredits}
                transactions={transactions}
                costBasisMethod={costBasisMethod}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Element */}
      <Footer country={country} />
    </div>
  );
}
