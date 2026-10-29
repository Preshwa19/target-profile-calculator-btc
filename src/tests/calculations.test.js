import { describe, it, expect } from 'vitest';
import { calculateTargetPrice, calculateLadder, LADDER_PERCENTS } from '../utils/calculations.js';
import { parseNumeric } from '../utils/validation.js';
import { formatMoney, formatPercent } from '../utils/formatting.js';

const base = {
  quantity: '0.5',
  purchasePrice: '80000',
  buyFeePct: '0.1',
  sellFeePct: '0.2',
  targetMode: 'fixed',
  targetValue: '2000',
};

const calc = (overrides = {}) => calculateTargetPrice({ ...base, ...overrides });

describe('mandatory example: 0.5 BTC @ 80,000, fees 0.1% / 0.2%, target 2,000', () => {
  const { ok, result } = calc();

  it('is valid', () => expect(ok).toBe(true));
  it('principal cost', () => expect(result.principalCost).toBeCloseTo(40000, 8));
  it('buying fee', () => expect(result.buyingFee).toBeCloseTo(40, 8));
  it('total investment cost', () => expect(result.totalCost).toBeCloseTo(40040, 8));
  it('target profit', () => expect(result.targetProfit).toBeCloseTo(2000, 8));
  it('required gross proceeds', () => expect(result.grossProceeds).toBeCloseTo(42124.24849699, 5));
  it('required selling price', () => expect(result.requiredSellingPrice).toBeCloseTo(84248.496994, 4));
  it('selling fee', () => expect(result.sellingFee).toBeCloseTo(84.24849699, 5));
  it('net proceeds', () => expect(result.netProceeds).toBeCloseTo(42040, 6));
  it('net profit', () => expect(result.netProfit).toBeCloseTo(2000, 6));
  it('profit percentage = net profit / total cost', () =>
    expect(result.profitPct).toBeCloseTo((2000 / 40040) * 100, 8));
});

describe('target modes', () => {
  it('fixed profit amount', () => {
    const { result } = calc({ targetMode: 'fixed', targetValue: '1000' });
    expect(result.targetProfit).toBeCloseTo(1000, 8);
    expect(result.netProfit).toBeCloseTo(1000, 6);
  });

  it('percentage profit is calculated on total cost including the buying fee', () => {
    const { result } = calc({
      quantity: '2',
      purchasePrice: '1000',
      targetMode: 'percent',
      targetValue: '10',
    });
    expect(result.totalCost).toBeCloseTo(2002, 8);
    expect(result.targetProfit).toBeCloseTo(200.2, 8);
    expect(result.requiredSellingPrice).toBeCloseTo(2202.2 / (2 * 0.998), 8);
    expect(result.netProfit).toBeCloseTo(200.2, 6);
    expect(result.profitPct).toBeCloseTo(10, 8);
  });

  it('zero target profit gives the break-even price', () => {
    const { ok, result } = calc({ targetValue: '0' });
    expect(ok).toBe(true);
    expect(result.requiredSellingPrice).toBeCloseTo(40040 / (0.5 * 0.998), 6);
    expect(result.netProfit).toBe(0);
    expect(result.profitPct).toBe(0);
  });

  it('zero percentage target also gives break-even', () => {
    const { ok, result } = calc({ targetMode: 'percent', targetValue: '0' });
    expect(ok).toBe(true);
    expect(result.netProfit).toBe(0);
    expect(result.netProceeds).toBeCloseTo(result.totalCost, 8);
  });
});

describe('fee handling', () => {
  it('zero buying fee', () => {
    const { result } = calc({ quantity: '1', purchasePrice: '100', buyFeePct: '0', sellFeePct: '0.5', targetValue: '50' });
    expect(result.buyingFee).toBe(0);
    expect(result.totalCost).toBeCloseTo(100, 10);
    expect(result.requiredSellingPrice).toBeCloseTo(150 / 0.995, 8);
    expect(result.netProfit).toBeCloseTo(50, 6);
  });

  it('zero selling fee', () => {
    const { result } = calc({ quantity: '1', purchasePrice: '100', buyFeePct: '1', sellFeePct: '0', targetValue: '10' });
    expect(result.totalCost).toBeCloseTo(101, 10);
    expect(result.requiredSellingPrice).toBeCloseTo(111, 10);
    expect(result.sellingFee).toBe(0);
    expect(result.netProceeds).toBeCloseTo(result.grossProceeds, 10);
    expect(result.netProfit).toBeCloseTo(10, 8);
  });

  it('no fees at all: price = purchase price + target / quantity', () => {
    const { result } = calc({ quantity: '4', purchasePrice: '25', buyFeePct: '0', sellFeePct: '0', targetValue: '20' });
    expect(result.requiredSellingPrice).toBeCloseTo(30, 10);
    expect(result.netProfit).toBeCloseTo(20, 8);
  });

  it('both fees together still meet the target', () => {
    const { result } = calc({ buyFeePct: '1.5', sellFeePct: '2.5', targetValue: '3500' });
    expect(result.netProfit).toBeCloseTo(3500, 5);
    expect(result.grossProceeds - result.sellingFee).toBeCloseTo(result.netProceeds, 8);
  });
});

describe('numeric ranges', () => {
  it('decimal quantities', () => {
    const { ok, result } = calc({ quantity: '0.00012345', purchasePrice: '6500000', targetValue: '50' });
    expect(ok).toBe(true);
    expect(result.netProfit).toBeCloseTo(50, 6);
  });

  it('extremely small prices', () => {
    const { ok, result } = calc({ quantity: '1000000', purchasePrice: '0.000000012', targetValue: '0.5' });
    expect(ok).toBe(true);
    expect(Number.isFinite(result.requiredSellingPrice)).toBe(true);
    expect(result.netProfit).toBeCloseTo(0.5, 6);
  });

  it('very large numbers stay finite', () => {
    const { ok, result } = calc({ quantity: '1000000000', purchasePrice: '1000000000', targetValue: '1000000' });
    expect(ok).toBe(true);
    for (const v of Object.values(result)) {
      if (typeof v === 'number') expect(Number.isFinite(v)).toBe(true);
    }
  });

  it('accepts thousands separators', () => {
    const { ok, result } = calc({ purchasePrice: '80,000' });
    expect(ok).toBe(true);
    expect(result.purchasePrice).toBe(80000);
  });

  it('is currency independent: extra currency field changes nothing', () => {
    const a = calc();
    const b = calculateTargetPrice({ ...base, currency: 'USD' });
    expect(b.result).toEqual(a.result);
  });
});

describe('invalid inputs', () => {
  const invalid = (overrides, field) => {
    const out = calc(overrides);
    expect(out.ok).toBe(false);
    expect(out.result).toBeNull();
    expect(out.errors[field]).toBeTruthy();
  };

  it('empty fields', () => {
    for (const f of ['quantity', 'purchasePrice', 'targetValue', 'buyFeePct', 'sellFeePct']) {
      invalid({ [f]: '' }, f);
      invalid({ [f]: '   ' }, f);
    }
  });

  it('zero quantity', () => invalid({ quantity: '0' }, 'quantity'));
  it('negative quantity', () => invalid({ quantity: '-1' }, 'quantity'));
  it('zero purchase price', () => invalid({ purchasePrice: '0' }, 'purchasePrice'));
  it('negative purchase price', () => invalid({ purchasePrice: '-5' }, 'purchasePrice'));
  it('negative profit target', () => invalid({ targetValue: '-10' }, 'targetValue'));
  it('negative buying fee', () => invalid({ buyFeePct: '-0.1' }, 'buyFeePct'));
  it('negative selling fee', () => invalid({ sellFeePct: '-0.1' }, 'sellFeePct'));
  it('buying fee at 100%', () => invalid({ buyFeePct: '100' }, 'buyFeePct'));
  it('buying fee above 100%', () => invalid({ buyFeePct: '250' }, 'buyFeePct'));
  it('selling fee above 100%', () => invalid({ sellFeePct: '101' }, 'sellFeePct'));

  it('selling fee equal to 100% produces no price', () => {
    const out = calc({ sellFeePct: '100' });
    expect(out.ok).toBe(false);
    expect(out.result).toBeNull();
    expect(out.errors.sellFeePct).toMatch(/100%/);
  });

  it('text and malformed numbers', () => {
    for (const bad of ['abc', '12abc', '1.2.3', '--5', 'NaN', 'Infinity', '1e999', '$100']) {
      invalid({ quantity: bad }, 'quantity');
    }
  });

  it('numbers beyond the supported maximum', () => invalid({ quantity: '1e20' }, 'quantity'));
  it('non-finite numeric inputs', () => {
    invalid({ quantity: NaN }, 'quantity');
    invalid({ purchasePrice: Infinity }, 'purchasePrice');
  });

  it('unknown target mode', () => invalid({ targetMode: 'bogus' }, 'targetMode'));

  it('missing input object does not throw', () => {
    const out = calculateTargetPrice(undefined);
    expect(out.ok).toBe(false);
  });

  it('never returns NaN or Infinity in a successful result', () => {
    const combos = [
      { quantity: '1e-9', purchasePrice: '1e-9' },
      { quantity: '1e14', purchasePrice: '1e14' },
      { sellFeePct: '99.9999' },
    ];
    for (const c of combos) {
      const out = calc(c);
      if (out.ok) {
        for (const v of Object.values(out.result)) {
          if (typeof v === 'number') expect(Number.isFinite(v)).toBe(true);
        }
      } else {
        expect(Object.keys(out.errors).length).toBeGreaterThan(0);
      }
    }
  });
});

describe('profit target is always met', () => {
  const quantities = ['0.001', '0.5', '3', '1200'];
  const prices = ['0.02', '80', '80000'];
  const fees = [['0', '0'], ['0.1', '0.2'], ['1', '2.5'], ['0.5', '0']];

  it('fixed targets across many inputs', () => {
    for (const q of quantities)
      for (const p of prices)
        for (const [b, s] of fees) {
          const { ok, result } = calc({ quantity: q, purchasePrice: p, buyFeePct: b, sellFeePct: s, targetValue: '123.45' });
          expect(ok).toBe(true);
          expect(Math.abs(result.netProfit - 123.45)).toBeLessThan(1e-6 * Math.max(1, result.totalCost));
        }
  });

  it('percentage targets across many inputs', () => {
    for (const q of quantities)
      for (const p of prices)
        for (const [b, s] of fees) {
          const { ok, result } = calc({ quantity: q, purchasePrice: p, buyFeePct: b, sellFeePct: s, targetMode: 'percent', targetValue: '12.5' });
          expect(ok).toBe(true);
          expect(result.profitPct).toBeCloseTo(12.5, 6);
        }
  });
});

describe('parseNumeric', () => {
  it('parses valid values', () => {
    expect(parseNumeric('1.5')).toBe(1.5);
    expect(parseNumeric(' .5 ')).toBe(0.5);
    expect(parseNumeric('1e3')).toBe(1000);
    expect(parseNumeric(7)).toBe(7);
  });
  it('returns null for empty and NaN for invalid', () => {
    expect(parseNumeric('')).toBeNull();
    expect(parseNumeric(null)).toBeNull();
    expect(parseNumeric('x')).toBeNaN();
  });
});

describe('formatting', () => {
  it('formats INR and USD', () => {
    expect(formatMoney(40040, 'INR')).toBe('₹40,040.00');
    expect(formatMoney(1234.5, 'USD')).toBe('$1,234.50');
  });
  it('shows small prices with extra precision', () => {
    expect(formatMoney(0.000123, 'USD')).toBe('$0.000123');
  });
  it('never prints NaN or Infinity', () => {
    expect(formatMoney(NaN)).toBe('—');
    expect(formatMoney(Infinity)).toBe('—');
    expect(formatPercent(NaN)).toBe('—');
  });
  it('does not print negative zero', () => {
    expect(formatMoney(-0, 'USD')).toBe('$0.00');
  });
});

describe('take-profit ladder', () => {
  it('has one row per percentage, rising in price', () => {
    const rows = calculateLadder(base);
    expect(rows.map((r) => r.percent)).toEqual(LADDER_PERCENTS);
    for (let i = 1; i < rows.length; i++) expect(rows[i].price).toBeGreaterThan(rows[i - 1].price);
  });

  it('each row meets its own target', () => {
    for (const r of calculateLadder(base)) {
      const { result } = calc({ targetMode: 'percent', targetValue: String(r.percent) });
      expect(r.price).toBeCloseTo(result.requiredSellingPrice, 8);
      expect(r.netProfit).toBeCloseTo((result.totalCost * r.percent) / 100, 6);
    }
  });

  it('ignores the fixed target the user entered', () => {
    expect(calculateLadder({ ...base, targetMode: 'fixed', targetValue: '' })).toHaveLength(5);
  });

  it('is empty for invalid inputs', () => {
    expect(calculateLadder({ ...base, quantity: '0' })).toEqual([]);
    expect(calculateLadder({ ...base, sellFeePct: '100' })).toEqual([]);
  });

  it('+100% row needs a move above double the purchase price once fees apply', () => {
    const rows = calculateLadder(base);
    expect(rows[4].moveVsPurchasePct).toBeGreaterThan(100);
  });
});
