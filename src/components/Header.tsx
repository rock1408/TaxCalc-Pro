import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Country, TabId } from '../types';
import { Sun, Moon, DollarSign, Wallet, ShieldAlert, Award, FileText, BarChart3, HelpCircle, Menu, X, BookOpen, Compass, Mail } from 'lucide-react';
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
  const navigate = useNavigate();

  const handleHomeNavigate = () => {
    navigate('/');
  };

  const handleCountryToggle = (c: Country) => {
    setCountry(c);
    if (c === 'INDIA') {
      navigate('/india');
    } else {
      navigate('/usa');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 bg-white/95 border-gray-200 text-gray-900 dark:bg-slate-900/95 dark:border-slate-800 dark:text-slate-100" id="app_header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={handleHomeNavigate} id="logo_container">
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" id="desktop_nav">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`
              }
            >
              <Compass size={14} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to={country === 'INDIA' ? '/india' : '/usa'}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`
              }
            >
              <FileText size={14} />
              <span>Calculators</span>
            </NavLink>

            <NavLink
              to="/guides"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`
              }
            >
              <BookOpen size={14} />
              <span>Guides</span>
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`
              }
            >
              <Award size={14} />
              <span>About</span>
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`
              }
            >
              <Mail size={14} />
              <span>Contact</span>
            </NavLink>
          </nav>

          {/* Controls Box (Country, Theme, Reset, Mobile Menu) */}
          <div className="flex items-center space-x-3" id="controls_box">
            {/* Country Selector */}
            <div className="relative flex items-center p-1 rounded-xl border bg-gray-50/50 border-gray-200 dark:bg-slate-800/40 dark:border-slate-800" id="country_selector">
              <button
                id="btn_country_india"
                onClick={() => handleCountryToggle('INDIA')}
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
                onClick={() => handleCountryToggle('USA')}
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
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-350 dark:hover:bg-slate-800"
            >
              <Compass size={16} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to={country === 'INDIA' ? '/india' : '/usa'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-350 dark:hover:bg-slate-800"
            >
              <FileText size={16} />
              <span>Calculators</span>
            </NavLink>

            <NavLink
              to="/guides"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-350 dark:hover:bg-slate-800"
            >
              <BookOpen size={16} />
              <span>Guides</span>
            </NavLink>

            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-350 dark:hover:bg-slate-800"
            >
              <Award size={16} />
              <span>About</span>
            </NavLink>

            <NavLink
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-350 dark:hover:bg-slate-800"
            >
              <Mail size={16} />
              <span>Contact</span>
            </NavLink>

            <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center px-4">
              <span className="text-[10px] text-gray-400">Security: Client-side only</span>
              <button
                id="mobile_reset_btn"
                onClick={() => {
                  if (window.confirm('Wipe cached inputs? All fields will reset to standard default templates.')) {
                    onResetData();
                    setMobileMenuOpen(false);
                  }
                }}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 font-sans uppercase tracking-wider"
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
