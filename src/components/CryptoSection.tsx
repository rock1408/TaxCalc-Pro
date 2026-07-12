/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Country, CryptoTransaction, CryptoTxType, CostBasisMethod } from '../types';
import { Trash2, Plus, Download, Upload, Info, AlertTriangle, Coins, RefreshCw, FileSpreadsheet, Calculator, Calendar, ArrowRight, ShieldCheck, BarChart3 } from 'lucide-react';
import React, { useState, useRef, useMemo } from 'react';
import { calculateCryptoGains } from '../utils/cryptoCalculator';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface CryptoSectionProps {
  country: Country;
  transactions: CryptoTransaction[];
  setTransactions: (txs: CryptoTransaction[]) => void;
  costBasisMethod: CostBasisMethod;
  setCostBasisMethod: (method: CostBasisMethod) => void;
}

export default function CryptoSection({
  country,
  transactions,
  setTransactions,
  costBasisMethod,
  setCostBasisMethod,
}: CryptoSectionProps) {
  // Manual transaction inputs for Raw ledger logger
  const [currency, setCurrency] = useState('BTC');
  const [type, setType] = useState<CryptoTxType>('BUY');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [fee, setFee] = useState('0');
  const [platform, setPlatform] = useState('Binance');
  const [details, setDetails] = useState('');

  // Manual Purchase and Sale Maturation Calculator inputs (starts empty - NO fake data!)
  const [calcToken, setCalcToken] = useState('');
  const [calcQty, setCalcQty] = useState('');
  const [calcBuyDate, setCalcBuyDate] = useState('');
  const [calcBuyPrice, setCalcBuyPrice] = useState('');
  const [calcSellDate, setCalcSellDate] = useState('');
  const [calcSellPrice, setCalcSellPrice] = useState('');
  const [calcBuyFee, setCalcBuyFee] = useState('0');
  const [calcSellFee, setCalcSellFee] = useState('0');

  // Manual calculation result state (null by default, only shown when pressed)
  const [manualCalcResult, setManualCalcResult] = useState<{
    token: string;
    quantity: number;
    buyDate: string;
    buyPrice: number;
    buyFee: number;
    sellDate: string;
    sellPrice: number;
    sellFee: number;
    holdingDays: number;
    proceeds: number;
    costBasis: number;
    gainOrLoss: number;
    classification: 'STCG' | 'LTCG';
    taxRatePercent: number;
    estimatedTax: number;
  } | null>(null);

  const [isCalculating, setIsCalculating] = useState(false);
  
  // File upload backup ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currencySymbol = country === 'INDIA' ? '₹' : '$';
  const ordinaryRate = country === 'INDIA' ? 30 : 22; // India normal slab, USA mid-bracket

  // --- HANDLERS FOR LEDGER ---
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseFloat(quantity) || 0;
    const priceNum = parseFloat(unitPrice) || 0;
    const feeNum = parseFloat(fee) || 0;

    if (qtyNum <= 0 || priceNum <= 0) {
      alert('Please enter a valid quantity and unit price greater than 0.');
      return;
    }

    const newTx: CryptoTransaction = {
      id: `tx_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      currency: currency.trim().toUpperCase(),
      quantity: qtyNum,
      unitPrice: priceNum,
      fee: feeNum,
      platform: platform.trim(),
      details: details.trim(),
    };

    setTransactions([...transactions, newTx]);
    setQuantity('');
    setUnitPrice('');
    setFee('0');
    setDetails('');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Delete all crypto transactions in ledger? This is irreversible.')) {
      setTransactions([]);
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions logged to export.');
      return;
    }

    const fiatCurrency = country === 'INDIA' ? 'INR' : 'USD';

    // Format dates as YYYY-MM-DD HH:mm:ss UTC for universal tax software compatibility
    const formatCsvDate = (isoString: string): string => {
      try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        const hours = String(d.getUTCHours()).padStart(2, '0');
        const minutes = String(d.getUTCMinutes()).padStart(2, '0');
        const seconds = String(d.getUTCSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
      } catch (e) {
        return isoString;
      }
    };

    const csvRows: string[][] = [];
    
    // Add standard accounting headers compatible with Koinly, CoinTracker, TurboTax, etc.
    csvRows.push([
      'Date',
      'Type',
      'Sent Amount',
      'Sent Currency',
      'Received Amount',
      'Received Currency',
      'Fee Amount',
      'Fee Currency',
      'Unit Price',
      'Exchange',
      'Label',
      'Description',
      'TxHash'
    ]);

    transactions.forEach(t => {
      const formattedDate = formatCsvDate(t.timestamp);
      let sentQty = '';
      let sentCur = '';
      let receivedQty = '';
      let receivedCur = '';
      const feeAmt = t.fee > 0 ? String(t.fee) : '';
      const feeCur = t.fee > 0 ? fiatCurrency : '';
      let label = '';

      switch (t.type) {
        case 'BUY':
        case 'NFT_BUY':
          sentQty = String(t.quantity * t.unitPrice);
          sentCur = fiatCurrency;
          receivedQty = String(t.quantity);
          receivedCur = t.currency;
          label = t.type === 'NFT_BUY' ? 'nft purchase' : 'buy';
          break;
        case 'SELL':
        case 'NFT_SELL':
          sentQty = String(t.quantity);
          sentCur = t.currency;
          receivedQty = String(t.quantity * t.unitPrice);
          receivedCur = fiatCurrency;
          label = t.type === 'NFT_SELL' ? 'nft sale' : 'sell';
          break;
        case 'MINING':
          receivedQty = String(t.quantity);
          receivedCur = t.currency;
          label = 'mining';
          break;
        case 'STAKING':
          receivedQty = String(t.quantity);
          receivedCur = t.currency;
          label = 'staking';
          break;
        case 'AIRDROP':
          receivedQty = String(t.quantity);
          receivedCur = t.currency;
          label = 'airdrop';
          break;
        case 'GIFT_IN':
          receivedQty = String(t.quantity);
          receivedCur = t.currency;
          label = 'gift';
          break;
        case 'GIFT_OUT':
          sentQty = String(t.quantity);
          sentCur = t.currency;
          label = 'gift';
          break;
        default:
          receivedQty = String(t.quantity);
          receivedCur = t.currency;
          break;
      }

      csvRows.push([
        formattedDate,
        t.type,
        sentQty,
        sentCur,
        receivedQty,
        receivedCur,
        feeAmt,
        feeCur,
        String(t.unitPrice),
        t.platform,
        label,
        t.details || '',
        t.id
      ]);
    });

    const csvString = csvRows
      .map(row => row.map(cell => {
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(','))
      .join('\n');

    // Safe download using blob and Object URL to handle large datasets perfectly without limit issues
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TaxCalcPro_CryptoLedger_${country}_Accounting.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // JSON backup exporter
  const handleBackupExport = () => {
    const backupStr = JSON.stringify(transactions, null, 2);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(backupStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'TaxCalcPro_CryptoBackup.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON backup importer
  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setTransactions(parsed);
          alert('Crypto ledger successfully restored from backup.');
        } else {
          alert('Invalid backup file layout.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  // --- MANUAL CALCULATOR FUNCTION ---
  const handleManualCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(calcQty);
    const buyPrice = parseFloat(calcBuyPrice);
    const sellPrice = parseFloat(calcSellPrice);
    const buyFee = parseFloat(calcBuyFee) || 0;
    const sellFee = parseFloat(calcSellFee) || 0;

    if (!calcToken) {
      alert('Please enter a token asset name.');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity greater than 0.');
      return;
    }
    if (isNaN(buyPrice) || buyPrice < 0) {
      alert('Please enter a valid purchase price.');
      return;
    }
    if (isNaN(sellPrice) || sellPrice < 0) {
      alert('Please enter a valid sale price.');
      return;
    }
    if (!calcBuyDate || !calcSellDate) {
      alert('Please select both purchase date and sale date.');
      return;
    }

    const buyTime = new Date(calcBuyDate).getTime();
    const sellTime = new Date(calcSellDate).getTime();

    if (sellTime < buyTime) {
      alert('Sale date cannot be earlier than the purchase date.');
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      setIsCalculating(false);
      // Days calculation
      const diffTime = Math.abs(sellTime - buyTime);
      const holdingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Proceeds and cost basis
      const costBasis = (qty * buyPrice) + buyFee;
      const proceeds = (qty * sellPrice) - sellFee;
      const gainOrLoss = proceeds - costBasis;

      // Classification
      let classification: 'STCG' | 'LTCG' = 'STCG';
      if (country === 'INDIA') {
        classification = holdingDays > 365 ? 'LTCG' : 'STCG';
      } else {
        classification = holdingDays >= 365 ? 'LTCG' : 'STCG';
      }

      // Tax rate calculation
      let taxRatePercent = ordinaryRate;
      if (country === 'INDIA') {
        taxRatePercent = classification === 'LTCG' ? 20 : 30; // standard India VDA rates
      } else {
        taxRatePercent = classification === 'LTCG' ? 15 : ordinaryRate; // USA rates
      }

      const estimatedTax = gainOrLoss > 0 ? Math.round(gainOrLoss * (taxRatePercent / 100)) : 0;

      setManualCalcResult({
        token: calcToken.toUpperCase().trim(),
        quantity: qty,
        buyDate: calcBuyDate,
        buyPrice,
        buyFee,
        sellDate: calcSellDate,
        sellPrice,
        sellFee,
        holdingDays,
        proceeds,
        costBasis,
        gainOrLoss,
        classification,
        taxRatePercent,
        estimatedTax,
      });
    }, 450);
  };

  const handleResetCalculator = () => {
    setCalcToken('');
    setCalcQty('');
    setCalcBuyDate('');
    setCalcBuyPrice('');
    setCalcSellDate('');
    setCalcSellPrice('');
    setCalcBuyFee('0');
    setCalcSellFee('0');
    setManualCalcResult(null);
  };

  // --- YEARLY PORTFOLIO GAINS/LOSSES CALCULATION FOR RECHARTS ---
  const ledgerAnalysis = useMemo(() => {
    return calculateCryptoGains(transactions, costBasisMethod, country as 'INDIA' | 'USA', ordinaryRate);
  }, [transactions, costBasisMethod, country, ordinaryRate]);

  const yearlyChartData = useMemo(() => {
    const yearlyMap: Record<string, { year: string; gains: number; losses: number }> = {};

    ledgerAnalysis.gainsList.forEach((item) => {
      try {
        const date = new Date(item.timestamp);
        const year = date.getFullYear();
        if (isNaN(year)) return;
        const yearStr = String(year);

        if (!yearlyMap[yearStr]) {
          yearlyMap[yearStr] = { year: yearStr, gains: 0, losses: 0 };
        }

        if (item.gainOrLoss > 0) {
          yearlyMap[yearStr].gains += item.gainOrLoss;
        } else if (item.gainOrLoss < 0) {
          yearlyMap[yearStr].losses += Math.abs(item.gainOrLoss);
        }
      } catch (e) {
        // Skip
      }
    });

    return Object.values(yearlyMap).sort((a, b) => a.year.localeCompare(b.year));
  }, [ledgerAnalysis]);

  const handleSeedDemoPortfolio = () => {
    const isIndia = country === 'INDIA';
    const rateMultiplier = isIndia ? 85 : 1;

    const demoTxs: CryptoTransaction[] = [
      {
        id: 'tx_demo_1',
        timestamp: '2024-03-10T10:00:00.000Z',
        type: 'BUY',
        currency: 'BTC',
        quantity: 0.5,
        unitPrice: 42000 * rateMultiplier,
        fee: 25 * rateMultiplier,
        platform: 'Coinbase',
        details: 'Initial position buy',
      },
      {
        id: 'tx_demo_2',
        timestamp: '2024-08-15T14:30:00.000Z',
        type: 'SELL',
        currency: 'BTC',
        quantity: 0.2,
        unitPrice: 64000 * rateMultiplier,
        fee: 30 * rateMultiplier,
        platform: 'Coinbase',
        details: 'Partial profit taking',
      },
      {
        id: 'tx_demo_3',
        timestamp: '2025-02-18T09:15:00.000Z',
        type: 'BUY',
        currency: 'ETH',
        quantity: 5,
        unitPrice: 2200 * rateMultiplier,
        fee: 15 * rateMultiplier,
        platform: 'Binance',
        details: 'Ethereum accumulation',
      },
      {
        id: 'tx_demo_4',
        timestamp: '2025-09-22T16:45:00.000Z',
        type: 'SELL',
        currency: 'ETH',
        quantity: 3,
        unitPrice: 3400 * rateMultiplier,
        fee: 20 * rateMultiplier,
        platform: 'Binance',
        details: 'Sold for rent/expenses',
      },
      {
        id: 'tx_demo_5',
        timestamp: '2026-01-05T11:00:00.000Z',
        type: 'BUY',
        currency: 'SOL',
        quantity: 80,
        unitPrice: 90 * rateMultiplier,
        fee: 5 * rateMultiplier,
        platform: 'Kraken',
        details: 'Solana position',
      },
      {
        id: 'tx_demo_6',
        timestamp: '2026-03-28T13:10:00.000Z',
        type: 'SELL',
        currency: 'SOL',
        quantity: 50,
        unitPrice: 180 * rateMultiplier,
        fee: 10 * rateMultiplier,
        platform: 'Kraken',
        details: 'Profit realization near peak',
      },
      {
        id: 'tx_demo_7',
        timestamp: '2026-05-12T10:00:00.000Z',
        type: 'SELL',
        currency: 'BTC',
        quantity: 0.1,
        unitPrice: 32000 * rateMultiplier,
        fee: 15 * rateMultiplier,
        platform: 'Coinbase',
        details: 'Cut loss during correction',
      },
    ];

    setTransactions(demoTxs);
  };

  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1.5 font-sans">
          <p className="font-extrabold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
            Year: {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 justify-between min-w-[140px]">
              <span className="font-medium text-gray-600 dark:text-slate-300 flex items-center">
                <span 
                  className="w-2.5 h-2.5 rounded-full mr-1.5 inline-block" 
                  style={{ backgroundColor: entry.color }} 
                />
                {entry.name}
              </span>
              <span className="font-bold font-mono text-gray-900 dark:text-white">
                {currencySymbol} {Math.round(entry.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 font-sans" id="crypto_section_wrapper">
      
      {/* Metrics Banner (driven by manual calculator results or empty default to avoid fake prepopulations) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="crypto_metric_banner">
        <div className="p-4 rounded-2xl border transition-colors bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800">
          <span className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Total Purchase Cost</span>
          <span className={`text-xl font-bold tracking-tight mt-1 block ${manualCalcResult ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-600'}`}>
            {manualCalcResult ? `${currencySymbol} ${Math.round(manualCalcResult.costBasis).toLocaleString()}` : '—'}
          </span>
        </div>
        <div className="p-4 rounded-2xl border transition-colors bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800">
          <span className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Realised Capital Gain/Loss</span>
          <span className={`text-xl font-bold tracking-tight mt-1 block ${manualCalcResult ? (manualCalcResult.gainOrLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500') : 'text-gray-400 dark:text-slate-600'}`}>
            {manualCalcResult ? `${manualCalcResult.gainOrLoss >= 0 ? '+' : ''}${Math.round(manualCalcResult.gainOrLoss).toLocaleString()} ${currencySymbol}` : '—'}
          </span>
        </div>
        <div className="p-4 rounded-2xl border transition-colors bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800">
          <span className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Estimated Crypto Tax</span>
          <span className={`text-xl font-bold tracking-tight mt-1 block ${manualCalcResult && manualCalcResult.gainOrLoss > 0 ? 'text-rose-500' : 'text-gray-400 dark:text-slate-600'}`}>
            {manualCalcResult && manualCalcResult.gainOrLoss > 0 ? `${currencySymbol} ${manualCalcResult.estimatedTax.toLocaleString()}` : '—'}
          </span>
          <span className="text-[10px] text-gray-400 mt-1 font-mono uppercase block">Sect 87A rebate exempts HP, not VDA/Crypto</span>
        </div>
        <div className="p-4 rounded-2xl border transition-colors bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800">
          <span className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Target Regulation Profile</span>
          <span className="text-xs font-black tracking-tight mt-2 block uppercase text-blue-600 dark:text-blue-400 flex items-center">
            {country === 'INDIA' ? '🇮🇳 India Tax Code' : '🇺🇸 United States IRS Code'}
          </span>
          <span className="text-[10px] text-gray-400 mt-1 font-mono uppercase block">Schedules updated for FY 2026-27</span>
        </div>
      </div>

      {/* Portfolio Yearly Performance Visualizer Chart */}
      <div className="p-6 rounded-2xl border bg-white border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800" id="crypto_yearly_chart_card">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-6 gap-4">
          <div>
            <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-gray-900 dark:text-white flex items-center">
              <BarChart3 size={18} className="text-blue-500 mr-2 animate-pulse" />
              <span>Yearly Capital Performance Analytics</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Dynamic realized gains and losses by year, computed under the active <span className="font-bold text-blue-500 font-mono text-[10px]">{costBasisMethod}</span> accounting engine.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Cost Basis Method Selector directly on the chart card for quick toggling! */}
            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
              {(['FIFO', 'LIFO', 'HIFO', 'AVG'] as CostBasisMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setCostBasisMethod(method)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    costBasisMethod === method
                      ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-gray-400 hover:text-gray-700 dark:hover:text-slate-300'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        {yearlyChartData.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <div className="max-w-md">
              <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 font-sans">No Realized Performance Data</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Add buy and sell transactions using the "Log Transaction" tool to compute holding-period tax results, or load our pre-packaged dual-regime demonstration ledger.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSeedDemoPortfolio}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/10 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>Seed Demo Portfolio</span>
            </button>
          </div>
        ) : (
          <div className="h-[280px] w-full" id="recharts_performance_container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearlyChartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false}
                  className="text-gray-200 dark:text-slate-800/60"
                  stroke="currentColor"
                />
                <XAxis 
                  dataKey="year" 
                  tickLine={false}
                  axisLine={false}
                  className="text-gray-400 dark:text-slate-500 font-mono text-[10px]"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currencySymbol}${val.toLocaleString()}`}
                  className="text-gray-400 dark:text-slate-500 font-mono text-[10px]"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip 
                  content={renderTooltip}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-[11px] font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider font-sans">
                      {value}
                    </span>
                  )}
                />
                <Bar 
                  name="Realized Gains" 
                  dataKey="gains" 
                  fill="#10b981" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
                <Bar 
                  name="Realized Losses" 
                  dataKey="losses" 
                  fill="#f43f5e" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Main Layout: Forms on left, Calculations & Ledger on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form for RAW transactions log entries */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl border bg-white border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <h3 className="font-sans font-bold text-gray-900 dark:text-gray-100 text-sm flex items-center mb-5 uppercase tracking-wide">
              <Coins size={18} className="mr-2 text-blue-500" />
              <span>Log Transaction</span>
            </h3>

            <form onSubmit={handleAddTransaction} className="space-y-4" id="add_crypto_form">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Transaction Category</label>
                <select
                  id="crypto_tx_type"
                  value={type}
                  onChange={(e) => setType(e.target.value as CryptoTxType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border bg-white text-gray-900 border-gray-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:bg-slate-900 outline-none"
                >
                  <option value="BUY" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Buy Asset (Increase)</option>
                  <option value="SELL" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Sell Asset (Gains matching)</option>
                  <option value="MINING" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Mining Receipt (Ordinary Income)</option>
                  <option value="STAKING" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Staking Reward (Ordinary Income)</option>
                  <option value="AIRDROP" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Airdrop Received (Ordinary Income)</option>
                  <option value="NFT_BUY" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Mint/Purchase NFT</option>
                  <option value="NFT_SELL" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Sell NFT</option>
                  <option value="GIFT_IN" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Gift Received (In)</option>
                  <option value="GIFT_OUT" className="text-gray-900 bg-white dark:bg-slate-800 dark:text-slate-100">Gift Transferred (Out)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Asset (e.g. BTC)</label>
                  <input
                    type="text"
                    id="crypto_symbol"
                    required
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="BTC, ETH, SOL"
                    className="w-full px-3 py-2 text-sm rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:bg-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    id="crypto_qty"
                    required
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Price per unit ({currencySymbol})</label>
                  <input
                    type="number"
                    id="crypto_unit_price"
                    required
                    step="any"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:bg-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Fees Paid ({currencySymbol})</label>
                  <input
                    type="number"
                    id="crypto_fee"
                    step="any"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Platform/Broker Exchange</label>
                <input
                  type="text"
                  id="crypto_exchange"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="Binance, Coinbase, Kepler"
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:bg-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Transaction Memo (Optional)</label>
                <input
                  type="text"
                  id="crypto_memo"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Notes, TxHash"
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:bg-slate-900 outline-none"
                />
              </div>

              <button
                type="submit"
                id="btn_add_crypto"
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-500/10"
              >
                <Plus size={16} />
                <span>Append to Active Ledger</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Direct Purchase & Sale Maturation Tax Calculator tab content */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="p-6 rounded-2xl border bg-white border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800" id="calculation_tab_panel">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-6">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 dark:text-white flex items-center">
                  <Calculator size={18} className="text-blue-500 mr-2" />
                  <span>Maturation Tax Calculator</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">Specify custom buy & sell parameters to view exact holding-period gains without automated lot inaccuracies.</p>
              </div>
              <button
                type="button"
                onClick={handleResetCalculator}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white mt-2 md:mt-0"
              >
                Reset Fields
              </button>
            </div>

            {/* Form inputs */}
            <form onSubmit={handleManualCalculate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Buy Information Block */}
                <div className="space-y-4 p-4 rounded-xl bg-gray-50/50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                    <span>1. Purchase (Buy) Leg</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-1">Asset Token Name</label>
                      <input
                        type="text"
                        placeholder="e.g. BTC, ETH"
                        required
                        value={calcToken}
                        onChange={(e) => setCalcToken(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border bg-white text-gray-900 border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-1">Asset Quantity</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 0.25"
                        required
                        value={calcQty}
                        onChange={(e) => setCalcQty(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border bg-white text-gray-900 border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-1">Purchase Date</label>
                      <input
                        type="date"
                        required
                        value={calcBuyDate}
                        onChange={(e) => setCalcBuyDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border bg-white text-gray-900 border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-1">Price per unit ({currencySymbol})</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 60000"
                        required
                        value={calcBuyPrice}
                        onChange={(e) => setCalcBuyPrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border bg-white text-gray-900 border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-1">Purchase Gas / Broker Fee ({currencySymbol})</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 10"
                      value={calcBuyFee}
                      onChange={(e) => setCalcBuyFee(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-white text-gray-900 border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>

                {/* Sell Information Block */}
                <div className="space-y-4 p-4 rounded-xl bg-gray-50/50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                    <span>2. Liquidation (Sell) Leg</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-1">Sale Date</label>
                      <input
                        type="date"
                        required
                        value={calcSellDate}
                        onChange={(e) => setCalcSellDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border bg-white text-gray-900 border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-1">Price per unit ({currencySymbol})</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 74000"
                        required
                        value={calcSellPrice}
                        onChange={(e) => setCalcSellPrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border bg-white text-gray-900 border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 mb-1">Sale Gas / Broker Fee ({currencySymbol})</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 15"
                      value={calcSellFee}
                      onChange={(e) => setCalcSellFee(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-white text-gray-900 border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 outline-none"
                    />
                  </div>

                  <div className="pt-3.5">
                    <span className="block text-[10px] uppercase font-bold text-gray-400">Rules applied:</span>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                      {country === 'INDIA' 
                        ? 'India rules: Flat 30% tax on gains from virtual digital assets. 1% TDS. Loss set-offs strictly forbidden.' 
                        : 'US rules: Preferential 0/15/20% rates for LTCG holding of flat >= 365 Days. Ordinary bracket for STCG.'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Submit button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  id="btn_calculate_maturation"
                  disabled={isCalculating}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-lg hover:shadow-blue-500/10 active:scale-95 transition-all cursor-pointer disabled:opacity-75"
                >
                  {isCalculating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Computing Maturation Leg...</span>
                    </>
                  ) : (
                    <>
                      <Calculator size={14} />
                      <span>Calculate Gains Result</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Results display panel: STRICTLY GIVEN ONLY WHEN CALC RESULTS DATA IS PRESENT */}
            {manualCalcResult && (
              <div 
                className="mt-6 p-5 rounded-xl border border-blue-100 bg-blue-50/10 dark:border-slate-800 dark:bg-slate-950/50 space-y-4 animate-fadeIn"
                id="maturation_results_card"
              >
                <div className="flex items-center justify-between border-b border-blue-50/10 dark:border-slate-800 pb-2">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Calculation Computed! ({manualCalcResult.token})
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    Buy: {new Date(manualCalcResult.buyDate).toLocaleDateString()} → Sell: {new Date(manualCalcResult.sellDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="block text-gray-400 text-[10px] uppercase font-bold">Matched Quantity</span>
                    <span className="font-mono text-gray-900 dark:text-white font-bold text-sm block mt-1">
                      {manualCalcResult.quantity.toLocaleString(undefined, { maximumFractionDigits: 5 })} {manualCalcResult.token}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 text-[10px] uppercase font-bold">Total Cost Basis</span>
                    <span className="font-mono text-gray-900 dark:text-white font-bold text-sm block mt-1">
                      {currencySymbol} {Math.round(manualCalcResult.costBasis).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 text-[10px] uppercase font-bold">Total Proceeds</span>
                    <span className="font-mono text-gray-900 dark:text-white font-bold text-sm block mt-1">
                      {currencySymbol} {Math.round(manualCalcResult.proceeds).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 text-[10px] uppercase font-bold">Holding Duration</span>
                    <span className="font-mono text-blue-500 font-bold text-sm block mt-1">
                      {manualCalcResult.holdingDays} Days
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-dashed border-gray-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
                    <ShieldCheck className="text-emerald-500" size={24} />
                    <div>
                      <span className="block text-gray-400 text-[10px] uppercase font-medium">Cap Gains Class</span>
                      <span className="font-black text-xs text-gray-900 dark:text-white uppercase tracking-wider block mt-0.5">
                        {manualCalcResult.classification === 'STCG' ? 'Short-Term Capital Gain (STCG)' : 'Long-Term Capital Gain (LTCG)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xs">
                      %
                    </div>
                    <div>
                      <span className="block text-gray-400 text-[10px] uppercase font-medium">Applied Rate & Tax</span>
                      <span className="font-black text-xs text-rose-500 block mt-0.5">
                        {manualCalcResult.taxRatePercent}% Tax Rate • {currencySymbol} {manualCalcResult.estimatedTax.toLocaleString()} Est. Tax
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700 dark:text-slate-300">Final Calculated Gain / Loss:</span>
                  <span className={`font-black font-mono text-sm ${manualCalcResult.gainOrLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {manualCalcResult.gainOrLoss >= 0 ? '+' : ''}{Math.round(manualCalcResult.gainOrLoss).toLocaleString()} {currencySymbol}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Raw transactions history list */}
          <div className="p-5 rounded-2xl border bg-white border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
            <h3 className="font-bold text-xs uppercase tracking-widest text-[#1e293b] dark:text-[#f1f5f9] mb-4">
              Master Ledger Records ({transactions.length})
            </h3>
            <div className="overflow-x-auto max-h-[300px]" id="raw_history_table">
              {transactions.length === 0 ? (
                <div className="py-8 text-center text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
                  No active transactions logged. Create one using the "Log Transaction" form.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wide">
                      <th className="py-2 px-3">Datetime</th>
                      <th className="py-2 px-3">Tx Type</th>
                      <th className="py-2 px-3">Token</th>
                      <th className="py-2 px-3 text-right">Quantity</th>
                      <th className="py-2 px-3 text-right">Price per item</th>
                      <th className="py-2 px-3">Broker</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 font-mono text-slate-700 dark:text-slate-300">
                    {transactions.slice().reverse().map(t => {
                      return (
                        <tr key={t.id} className="hover:bg-gray-50/40 dark:hover:bg-slate-800/10 transition-all text-[11px]">
                          <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="py-2 px-3 font-bold font-sans">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              ['BUY', 'NFT_BUY'].includes(t.type)
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : ['SELL', 'NFT_SELL'].includes(t.type)
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
                            }`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold font-sans text-slate-900 dark:text-white">{t.currency}</td>
                          <td className="py-2 px-3 text-right font-semibold text-slate-800 dark:text-slate-200">{t.quantity.toLocaleString(undefined, { maximumFractionDigits: 5 })}</td>
                          <td className="py-2 px-3 text-right text-slate-800 dark:text-slate-200">{currencySymbol} {t.unitPrice.toLocaleString()}</td>
                          <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">{t.platform}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              id={`del_crypto_${t.id}`}
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="p-1 rounded text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Backup Panel */}
          <div className="p-4 rounded-2xl border transition-colors bg-gray-50 border-gray-200 dark:bg-slate-900/60 dark:border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Ledger Utilities</h4>
              <span className="text-[10px] text-gray-400 font-medium">CSV follows standard tax software accounting formats (CoinTracker, Koinly, etc.)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2" id="util_btn_grid">
              <button
                id="btn_export_csv"
                onClick={handleExportCSV}
                className="flex items-center justify-center space-x-1 px-3 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
              >
                <FileSpreadsheet size={13} />
                <span>Export Tax CSV</span>
              </button>
              <button
                id="btn_export_backup"
                onClick={handleBackupExport}
                className="flex items-center justify-center space-x-1 px-3 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>JSON Backup</span>
              </button>
              <button
                id="btn_import_backup"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-1 px-3 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
              >
                <Upload size={13} />
                <span>Restore JSON</span>
              </button>
              <button
                id="btn_seed_demo_ledger"
                onClick={handleSeedDemoPortfolio}
                className="flex items-center justify-center space-x-1 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/10 dark:hover:bg-blue-500/20 transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span>Seed Demo Ledger</span>
              </button>
              <button
                id="btn_clear_ledger"
                onClick={handleClearAll}
                className="flex items-center justify-center space-x-1 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-thin border-rose-200 rounded-xl dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/10 dark:hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Empty Ledger</span>
              </button>
            </div>
            {/* Hidden Input for JSON file reading */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleBackupImport}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
