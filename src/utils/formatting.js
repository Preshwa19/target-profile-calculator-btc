export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN', label: 'INR (₹)' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', label: 'USD ($)' },
};

const getCurrency = (code) => CURRENCIES[code] ?? CURRENCIES.INR;

/** Format a monetary value for the selected currency. */
export function formatMoney(value, currencyCode = 'INR') {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const c = getCurrency(currencyCode);
  const v = value === 0 ? 0 : value; // normalise -0
  const abs = Math.abs(v);

  if (abs > 0 && abs < 1e-8) {
    return `${v < 0 ? '-' : ''}${c.symbol}${abs.toExponential(4)}`;
  }

  let minimumFractionDigits = 2;
  let maximumFractionDigits = 2;
  if (abs > 0 && abs < 1) maximumFractionDigits = 8;

  return new Intl.NumberFormat(c.locale, {
    style: 'currency',
    currency: c.code,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(v);
}

/** Format a plain number, e.g. a coin quantity. */
export function formatNumber(value, maximumFractionDigits = 8) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value === 0 ? 0 : value);
}

/** Format a percentage value (e.g. 10 -> "10%"). */
export function formatPercent(value, maximumFractionDigits = 4) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value === 0 ? 0 : value)}%`;
}

/** Build a readable plain-text summary for the clipboard. */
export function buildSummary({ symbol, result, currency }) {
  const label = symbol && symbol.trim() ? symbol.trim() : 'Coin';
  const m = (v) => formatMoney(v, currency);
  const targetText =
    result.targetMode === 'percent'
      ? `${formatPercent(result.targetValue)} of total investment cost`
      : 'fixed amount';

  return [
    'Crypto Target Profit Price Calculator',
    '--------------------------------------',
    `Asset: ${label}`,
    `Quantity: ${formatNumber(result.quantity)}`,
    `Average purchase price: ${m(result.purchasePrice)}`,
    `Buying fee: ${formatPercent(result.buyFeePct)} | Selling fee: ${formatPercent(result.sellFeePct)}`,
    `Profit target: ${m(result.targetProfit)} (${targetText})`,
    '',
    `Required selling price per ${label}: ${m(result.requiredSellingPrice)}`,
    `Original investment cost: ${m(result.principalCost)}`,
    `Estimated buying fee: ${m(result.buyingFee)}`,
    `Total investment cost: ${m(result.totalCost)}`,
    `Gross selling proceeds (before selling fee): ${m(result.grossProceeds)}`,
    `Estimated selling fee: ${m(result.sellingFee)}`,
    `Net proceeds (after selling fee): ${m(result.netProceeds)}`,
    `Expected net profit: ${m(result.netProfit)}`,
    `Expected profit percentage: ${formatPercent(result.profitPct)}`,
    '',
    'Estimates for educational purposes only. Not financial advice. Taxes, slippage, spreads and other charges are excluded.',
  ].join('\n');
}
