/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CryptoTransaction, CryptoGainResult, CryptoPortfolioSummary, CostBasisMethod } from '../types';

interface HoldingLot {
  txId: string;
  timestamp: Date;
  quantity: number;
  remainingQuantity: number;
  unitPrice: number; // Cost basis per token
}

export function calculateCryptoGains(
  transactions: CryptoTransaction[],
  method: CostBasisMethod,
  country: 'INDIA' | 'USA',
  ordinaryTaxRatePercent: number = 30
): CryptoPortfolioSummary {
  // Sort transactions chronologically
  const sortedTxs = [...transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Group holdings by currency token symbol
  const holdings: Record<string, HoldingLot[]> = {};
  const gainsList: CryptoGainResult[] = [];

  let totalInvestment = 0;
  let totalProceeds = 0;

  // Track income events as direct tax events with FMV as income (Mining, Staking, Airdrop)
  let ordinaryIncomeFromCrypto = 0;

  for (const tx of sortedTxs) {
    const symbol = tx.currency.toUpperCase();
    const isIncomeEvent = ['MINING', 'STAKING', 'AIRDROP', 'GIFT_IN'].includes(tx.type);
    const isHoldingIncrease = tx.type === 'BUY' || tx.type === 'NFT_BUY' || isIncomeEvent;
    
    if (isIncomeEvent) {
      // FMV acts as standard ordinary income immediately
      ordinaryIncomeFromCrypto += tx.quantity * tx.unitPrice;
    }

    if (isHoldingIncrease) {
      // Add a new lot of holding
      if (!holdings[symbol]) {
        holdings[symbol] = [];
      }
      holdings[symbol].push({
        txId: tx.id,
        timestamp: new Date(tx.timestamp),
        quantity: tx.quantity,
        remainingQuantity: tx.quantity,
        unitPrice: tx.unitPrice,
      });

      totalInvestment += tx.quantity * tx.unitPrice + tx.fee;
    } else if (tx.type === 'SELL' || tx.type === 'GIFT_OUT' || tx.type === 'NFT_SELL') {
      // Sale or transfer out
      const soldQty = tx.quantity;
      let remainingToSell = soldQty;

      totalProceeds += tx.quantity * tx.unitPrice - tx.fee;

      const lots = holdings[symbol] || [];
      if (lots.length === 0) {
        // Selling with no recorded buying. Assume cost basis is 0 as conservative default.
        const gain = tx.quantity * tx.unitPrice;
        gainsList.push({
          txId: tx.id,
          timestamp: tx.timestamp,
          currency: symbol,
          quantity: tx.quantity,
          saleProceeds: gain,
          costBasis: 0,
          gainOrLoss: gain,
          holdingPeriodDays: 0,
          classification: 'STCG',
          taxRatePercent: ordinaryTaxRatePercent,
          estimatedTax: Math.round(gain * (ordinaryTaxRatePercent / 100)),
        });
        continue;
      }

      // Sort lots based on chosen cost basis algorithm
      let tempGainsForTx: { costBasis: number; matchedQty: number; buyDate: Date; buyPrice: number }[] = [];

      if (method === 'AVG') {
        // Average Cost Method
        const totalUnits = lots.reduce((sum, lot) => sum + lot.remainingQuantity, 0);
        const totalCostSum = lots.reduce((sum, lot) => sum + lot.remainingQuantity * lot.unitPrice, 0);
        const avgPrice = totalUnits > 0 ? totalCostSum / totalUnits : 0;

        // Reduce from original lots chronologically
        let spent = 0;
        let oldestBuyDate = new Date(tx.timestamp);
        let updatedLots = [...lots];

        for (const lot of updatedLots) {
          if (remainingToSell <= 0) break;
          if (lot.remainingQuantity > 0) {
            const deduct = Math.min(lot.remainingQuantity, remainingToSell);
            lot.remainingQuantity -= deduct;
            remainingToSell -= deduct;
            spent += deduct * avgPrice;
            if (lot.timestamp < oldestBuyDate) oldestBuyDate = lot.timestamp;
          }
        }

        tempGainsForTx.push({
          costBasis: spent,
          matchedQty: soldQty - remainingToSell,
          buyDate: oldestBuyDate,
          buyPrice: avgPrice,
        });
      } else {
        // Queue/Specific sorting: FIFO, LIFO, HIFO
        const sortedLots = [...lots].filter(l => l.remainingQuantity > 0);
        if (method === 'FIFO') {
          // Oldest first
          sortedLots.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        } else if (method === 'LIFO') {
          // Newest first
          sortedLots.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        } else if (method === 'HIFO') {
          // Highest purchase price first
          sortedLots.sort((a, b) => b.unitPrice - a.unitPrice);
        }

        for (const lot of sortedLots) {
          if (remainingToSell <= 0) break;
          
          const matchedLotInHoldings = lots.find(l => l.txId === lot.txId);
          if (matchedLotInHoldings && matchedLotInHoldings.remainingQuantity > 0) {
            const deduct = Math.min(matchedLotInHoldings.remainingQuantity, remainingToSell);
            matchedLotInHoldings.remainingQuantity -= deduct;
            remainingToSell -= deduct;

            tempGainsForTx.push({
              costBasis: deduct * matchedLotInHoldings.unitPrice,
              matchedQty: deduct,
              buyDate: matchedLotInHoldings.timestamp,
              buyPrice: matchedLotInHoldings.unitPrice,
            });
          }
        }
      }

      // Compute consolidated results for this sale event
      for (const segment of tempGainsForTx) {
        const saleSegmentProceeds = segment.matchedQty * tx.unitPrice;
        const gainOrLoss = saleSegmentProceeds - segment.costBasis;
        
        // Calculate holding period
        const diffTime = Math.abs(new Date(tx.timestamp).getTime() - segment.buyDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let classification: 'STCG' | 'LTCG' = 'STCG';
        if (country === 'INDIA') {
          // India: STCG <= 365 days, LTCG > 1 year
          classification = diffDays > 365 ? 'LTCG' : 'STCG';
        } else {
          // USA: STCG < 365 days, LTCG >= 365 days
          classification = diffDays >= 365 ? 'LTCG' : 'STCG';
        }

        // Determine tax rates
        let rate = ordinaryTaxRatePercent;
        if (country === 'INDIA') {
          // User request spec: India LTCG flat 20% with indexation (represented here as flat 20%).
          // STCG taxed at slab rate (ordinaryTaxRatePercent).
          rate = classification === 'LTCG' ? 20 : ordinaryTaxRatePercent;
        } else {
          // USA: LTCG has preferential rates (0/15/20), we map typical default to 15%.
          // STCG is ordinary income bracket rate.
          rate = classification === 'LTCG' ? 15 : ordinaryTaxRatePercent;
        }

        const estimatedTax = gainOrLoss > 0 ? Math.round(gainOrLoss * (rate / 100)) : 0;

        gainsList.push({
          txId: tx.id,
          timestamp: tx.timestamp,
          currency: symbol,
          quantity: segment.matchedQty,
          saleProceeds: saleSegmentProceeds,
          costBasis: segment.costBasis,
          gainOrLoss,
          holdingPeriodDays: diffDays,
          classification,
          taxRatePercent: rate,
          estimatedTax,
        });
      }

      // If we couldn't match all sold capacity, create a 0-basis entry for the rest
      if (remainingToSell > 0) {
        const restProceeds = remainingToSell * tx.unitPrice;
        gainsList.push({
          txId: tx.id,
          timestamp: tx.timestamp,
          currency: symbol,
          quantity: remainingToSell,
          saleProceeds: restProceeds,
          costBasis: 0,
          gainOrLoss: restProceeds,
          holdingPeriodDays: 0,
          classification: 'STCG',
          taxRatePercent: ordinaryTaxRatePercent,
          estimatedTax: Math.round(restProceeds * (ordinaryTaxRatePercent / 100)),
        });
      }
    }
  }

  // Aggregate results
  let stcgGains = 0;
  let ltcgGains = 0;
  let stcgTax = 0;
  let ltcgTax = 0;

  for (const gain of gainsList) {
    if (gain.gainOrLoss > 0) {
      if (gain.classification === 'STCG') {
        stcgGains += gain.gainOrLoss;
        stcgTax += gain.estimatedTax;
      } else {
        ltcgGains += gain.gainOrLoss;
        ltcgTax += gain.estimatedTax;
      }
    } else {
      // Net losses - can offset gains in USA usually, but let's keep separate tally as India doesn't allow offset.
      // We keep strict standard addition with optional offsets if USA.
      if (country === 'USA') {
        if (gain.classification === 'STCG') {
          stcgGains += gain.gainOrLoss; // decrease total stcg
        } else {
          ltcgGains += gain.gainOrLoss; // decrease total ltcg
        }
      } else {
        // India: losses from VDA cannot be setoff against other VDA gains!
        // So we do not offset, we keep losses at 0 impact for gains aggregation.
      }
    }
  }

  // Ensure gains don't drop below 0 if offset drops them there
  stcgGains = Math.max(0, stcgGains);
  ltcgGains = Math.max(0, ltcgGains);

  // Recount taxes
  stcgTax = Math.round(stcgGains * (ordinaryTaxRatePercent / 100));
  ltcgTax = Math.round(ltcgGains * ((country === 'INDIA' ? 20 : 15) / 100));

  let totalCryptoTax = stcgTax + ltcgTax;
  
  // Add 4% cess on India tax
  if (country === 'INDIA') {
    totalCryptoTax = Math.round(totalCryptoTax * 1.04);
  }

  return {
    totalInvestment: Math.round(totalInvestment),
    totalProceeds: Math.round(totalProceeds),
    stcgGains: Math.round(stcgGains),
    ltcgGains: Math.round(ltcgGains),
    totalGains: Math.round(stcgGains + ltcgGains),
    stcgTax,
    ltcgTax,
    totalCryptoTax,
    gainsList,
  };
}
