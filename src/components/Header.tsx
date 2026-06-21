/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Country, TabId } from '../types';
import { Sun, Moon, DollarSign, Wallet, ShieldAlert, Award, FileText, BarChart3, HelpCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  country: Country;
  setCountry: (c: Country) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;
  onResetData: () => void;
}

export default function Header({
  country,
  setCountry,
  theme,
  toggleTheme,
  activeTab,
  setActiveTab,
  onResetData,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'income', label: 'Income Tax', icon: FileText },
    { id: 'crypto', label: 'Crypto Tax', icon: Wallet },
    { id: 'compare', label: 'Comparison Tools', icon: BarChart3 },
    { id: 'insights', label: 'Tax Insights Hub', icon: Award },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 bg-white/95 border-gray-200 text-gray-900 dark:bg-slate-900/95 dark:border-slate-800 dark:text-slate-100" id="app_header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('income')} id="logo_container">
            <span className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-center">
              <DollarSign size={20} className="stroke-[2.5]" />
            </span>
            <div>
              <h1 className="font-sans font-extrabold text-lg tracking-tight select-none">
                TaxCalc<span className="text-blue-500">Pro</span>
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium tracking-wide -mt-1 uppercase">
                Dual-Country Optimiser
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" id="desktop_nav">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav_tab_${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl font-sans text-sm font-semibold transition-all duration-200 outline-none ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-gray-100/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls Box (Country, Theme, Reset, Mobile Menu) */}
          <div className="flex items-center space-x-3" id="controls_box">
            {/* Country Selector */}
            <div className="relative flex items-center p-1 rounded-xl border bg-gray-50/50 border-gray-200 dark:bg-slate-800/40 dark:border-slate-800" id="country_selector">
              <button
                id="btn_country_india"
                onClick={() => setCountry('INDIA')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  country === 'INDIA'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>🇮🇳</span>
                <span className="hidden sm:inline">India</span>
              </button>
              <button
                id="btn_country_usa"
                onClick={() => setCountry('USA')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  country === 'USA'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>🇺🇸</span>
                <span className="hidden sm:inline">USA</span>
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              id="theme_toggle_btn"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-slate-800/80 dark:border-slate-800 dark:hover:bg-slate-700/80 transition-all text-gray-600 dark:text-slate-300 outline-none"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Reset Button (Wipe Form Cache) */}
            <button
              id="btn_reset_data"
              onClick={() => {
                if (window.confirm('Wipe cached inputs? All fields will reset to standard default templates.')) {
                  onResetData();
                }
              }}
              className="hidden lg:inline-flex items-center space-x-1 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-thin border-rose-200 rounded-xl"
            >
              <span>Wipe Cache</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              id="mobile_hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white md:hidden"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Collapsible) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1"
            id="mobile_drawer"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`mobile_tab_${tab.id}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-sans text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center px-4">
              <span className="text-[10px] text-gray-400">Security: Client-side Calculations Only</span>
              <button
                id="mobile_reset_btn"
                onClick={() => {
                  if (window.confirm('Wipe cached inputs? All fields will reset to standard default templates.')) {
                    onResetData();
                    setMobileMenuOpen(false);
                  }
                }}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 font-sans"
              >
                Wipe Local Store
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
