/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import { FileText, Wallet, BarChart3, Award } from 'lucide-react';

// New Routing Pages
import Home from './pages/Home';
import HraCalculator from './pages/HraCalculator';
import TdsCalculator from './pages/TdsCalculator';
import GstCalculator from './pages/GstCalculator';
import UsaPaycheckCalculator from './pages/UsaPaycheckCalculator';
import GuidesHub from './pages/GuidesHub';
import GuideArticle from './pages/GuideArticle';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// New Components
import Breadcrumbs from './components/Breadcrumbs';
import DisclaimerBanner from './components/DisclaimerBanner';
import ErrorBoundary from './components/ErrorBoundary';
import JsonLd from './components/JsonLd';

import { motion, AnimatePresence } from 'motion/react';

// Wrapper to handle automatic state synchronization with route location
function AppContent() {
  const location = useLocation();

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

  // Sync country state based on current route path prefix
  useEffect(() => {
    if (location.pathname.startsWith('/india')) {
      setCountry('INDIA');
    } else if (location.pathname.startsWith('/usa')) {
      setCountry('USA');
    }
    // Automatically scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

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

  // Helper to render the interactive calculator pages
  const renderCalculatorDashboard = () => {
    return (
      <div className="space-y-6">
        {/* Tab Selection */}
        <div className="border-b border-gray-150 dark:border-slate-850 flex items-center justify-between pb-1 gap-4 overflow-x-auto">
          <div className="flex items-center space-x-1 shrink-0">
            {[
              { id: 'income', label: 'Income Slabs', icon: FileText },
              { id: 'crypto', label: 'Crypto Assets', icon: Wallet },
              { id: 'compare', label: 'Compare Regimes', icon: BarChart3 },
              { id: 'insights', label: 'AI Advisory', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all border ${
                    isActive
                      ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider hidden sm:block shrink-0">
            Active Country: {country}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${country}_${activeTab}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
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
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100" id="main_app_wrapper">
      
      {/* 1. Global Persistent Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 2. Global Sticky Header */}
      <Header
        country={country}
        setCountry={handleCountryChange}
        theme={theme}
        toggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetAllData}
      />

      {/* 3. Main Viewport Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-4" id="viewport_main_wrapper">
        
        {/* Dynamic breadcrumbs display */}
        <Breadcrumbs />

        <ErrorBoundary>
          <Routes>
            <Route path="/" element={
              <>
                <JsonLd
                  type="WebApplication"
                  data={{
                    name: 'TaxCalc Pro',
                    url: 'https://taxcalcpro.vercel.app/',
                    description: 'Dual-country salary and capital gains tax planning simulator for India and the USA.',
                    applicationCategory: 'FinanceApplication',
                    operatingSystem: 'All',
                  }}
                />
                <Home />
              </>
            } />
            <Route path="/india" element={renderCalculatorDashboard()} />
            <Route path="/usa" element={renderCalculatorDashboard()} />
            <Route path="/india/hra-calculator" element={<HraCalculator />} />
            <Route path="/india/tds-calculator" element={<TdsCalculator />} />
            <Route path="/india/gst-calculator" element={<GstCalculator />} />
            <Route path="/usa/paycheck-calculator" element={<UsaPaycheckCalculator />} />
            <Route path="/guides" element={<GuidesHub />} />
            <Route path="/guides/:slug" element={<GuideArticle />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* 4. Global Footer */}
      <Footer country={country} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
