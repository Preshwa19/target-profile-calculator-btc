/**
 * Real-world starting points. Everything here only fills in form fields.
 * The numbers are illustrative, not market prices or any exchange's actual fees.
 */

export const COIN_CHIPS = ['BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'DOGE'];

/** Illustrative fee tiers (percent per side). Always check your own exchange's fee schedule. */
export const FEE_TIERS = [
  { key: 'low', label: 'Low', buy: 0.1, sell: 0.1, note: 'High-volume or discounted accounts' },
  { key: 'medium', label: 'Medium', buy: 0.5, sell: 0.5, note: 'Typical retail pricing' },
  { key: 'high', label: 'High', buy: 1, sell: 1, note: 'Instant-buy or card purchases' },
];

/** Illustrative scenarios (INR). */
export const SCENARIOS = [
  {
    id: 'btc-swing',
    label: 'BTC swing trade, +15%',
    symbol: 'BTC',
    quantity: '0.05',
    purchasePrice: '6500000',
    buyFeePct: '0.1',
    sellFeePct: '0.2',
    targetMode: 'percent',
    targetValue: '15',
  },
  {
    id: 'eth-goal',
    label: 'ETH, earn a fixed amount',
    symbol: 'ETH',
    quantity: '2',
    purchasePrice: '250000',
    buyFeePct: '0.5',
    sellFeePct: '0.5',
    targetMode: 'fixed',
    targetValue: '50000',
  },
  {
    id: 'sol-double',
    label: 'Small SOL position, +30%',
    symbol: 'SOL',
    quantity: '25',
    purchasePrice: '12000',
    buyFeePct: '1',
    sellFeePct: '1',
    targetMode: 'percent',
    targetValue: '30',
  },
];
