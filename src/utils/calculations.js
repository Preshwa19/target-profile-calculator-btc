import { validateInputs } from './validation.js';

/**
 * Core calculation. Pure and currency-independent: it only works with numbers.
 *
 * Accepts raw inputs (strings or numbers):
 *   { quantity, purchasePrice, buyFeePct, sellFeePct, targetMode, targetValue }
 * where targetMode is 'fixed' (amount) or 'percent' (of total investment cost).
 *
 * Returns { ok: true, errors: {}, result } or { ok: false, errors, result: null }.
 * Full precision is kept internally; round only when displaying.
 */
export function calculateTargetPrice(inputs) {
  const { errors, values } = validateInputs(inputs ?? {});
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, result: null };
  }

  const Q = values.quantity;
  const P = values.purchasePrice;
  const Fb = values.buyFeePct / 100;
  const Fs = values.sellFeePct / 100;

  const principalCost = Q * P;
  const buyingFee = principalCost * Fb;
  const totalCost = principalCost + buyingFee;

  const targetProfit =
    values.targetMode === 'fixed' ? values.targetValue : (totalCost * values.targetValue) / 100;

  const requiredSellingPrice = (totalCost + targetProfit) / (Q * (1 - Fs));
  const grossProceeds = Q * requiredSellingPrice;
  const sellingFee = grossProceeds * Fs;
  const netProceeds = grossProceeds - sellingFee;

  let netProfit = netProceeds - totalCost;
  // Remove floating-point residue (e.g. -1e-12 for a zero target) so the
  // reported profit matches the target when they agree to machine precision.
  if (Math.abs(netProfit - targetProfit) <= 1e-9 * Math.max(1, totalCost)) {
    netProfit = targetProfit;
  }
  const profitPct = totalCost > 0 ? (netProfit / totalCost) * 100 : NaN;

  const result = {
    quantity: Q,
    purchasePrice: P,
    buyFeePct: values.buyFeePct,
    sellFeePct: values.sellFeePct,
    targetMode: values.targetMode,
    targetValue: values.targetValue,
    principalCost,
    buyingFee,
    totalCost,
    targetProfit,
    requiredSellingPrice,
    grossProceeds,
    sellingFee,
    netProceeds,
    netProfit,
    profitPct,
  };

  const numericKeys = [
    'principalCost',
    'buyingFee',
    'totalCost',
    'targetProfit',
    'requiredSellingPrice',
    'grossProceeds',
    'sellingFee',
    'netProceeds',
    'netProfit',
    'profitPct',
  ];
  const allFinite = numericKeys.every((k) => Number.isFinite(result[k]));
  if (!allFinite || totalCost <= 0 || requiredSellingPrice <= 0) {
    return {
      ok: false,
      errors: {
        general:
          'These values are too large or too small to calculate reliably. Try more moderate numbers.',
      },
      result: null,
    };
  }

  return { ok: true, errors: {}, result };
}

export const LADDER_PERCENTS = [5, 10, 20, 50, 100];

/**
 * Take-profit ladder: the selling price needed for several profit percentages
 * (of total investment cost), using the user's quantity, price and fees.
 * Returns rows { percent, price, netProfit, moveVsPurchasePct }.
 */
export function calculateLadder(inputs, percents = LADDER_PERCENTS) {
  const rows = [];
  for (const percent of percents) {
    const out = calculateTargetPrice({ ...inputs, targetMode: 'percent', targetValue: percent });
    if (!out.ok) return [];
    rows.push({
      percent,
      price: out.result.requiredSellingPrice,
      netProfit: out.result.netProfit,
      moveVsPurchasePct: (out.result.requiredSellingPrice / out.result.purchasePrice - 1) * 100,
    });
  }
  return rows;
}
