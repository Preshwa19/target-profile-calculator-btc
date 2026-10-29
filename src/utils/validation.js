/**
 * Input parsing and validation. Pure functions, no UI or browser dependencies.
 */

export const MAX_VALUE = 1e15;
export const MAX_VALUE_LABEL = '1,000,000,000,000,000';

/**
 * Parse a user-entered value into a finite number.
 * Returns:
 *   - null  when the value is empty
 *   - NaN   when the value is not a valid finite number
 *   - number otherwise
 */
export function parseNumeric(raw) {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : NaN;
  }
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim().replace(/,/g, '');
  if (text === '') return null;
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(text)) return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
}

/**
 * Validate the raw calculator inputs.
 * Returns { errors, values }. `errors` maps field name -> message; `values`
 * holds parsed numbers for fields that passed validation.
 */
export function validateInputs(inputs) {
  const errors = {};
  const values = {};

  const read = (field, label) => {
    const n = parseNumeric(inputs[field]);
    if (n === null) {
      errors[field] = `${label} is required.`;
      return undefined;
    }
    if (Number.isNaN(n)) {
      errors[field] = `${label} must be a valid number.`;
      return undefined;
    }
    if (Math.abs(n) > MAX_VALUE) {
      errors[field] = `${label} is too large (maximum ${MAX_VALUE_LABEL}).`;
      return undefined;
    }
    return n;
  };

  const quantity = read('quantity', 'Quantity');
  if (quantity !== undefined) {
    if (quantity < 0) errors.quantity = 'Quantity cannot be negative.';
    else if (quantity === 0) errors.quantity = 'Quantity must be greater than zero.';
    else values.quantity = quantity;
  }

  const purchasePrice = read('purchasePrice', 'Purchase price');
  if (purchasePrice !== undefined) {
    if (purchasePrice < 0) errors.purchasePrice = 'Purchase price cannot be negative.';
    else if (purchasePrice === 0) errors.purchasePrice = 'Purchase price must be greater than zero.';
    else values.purchasePrice = purchasePrice;
  }

  const buyFeePct = read('buyFeePct', 'Buying fee');
  if (buyFeePct !== undefined) {
    if (buyFeePct < 0) errors.buyFeePct = 'Buying fee cannot be negative.';
    else if (buyFeePct >= 100) errors.buyFeePct = 'Buying fee must be below 100%.';
    else values.buyFeePct = buyFeePct;
  }

  const sellFeePct = read('sellFeePct', 'Selling fee');
  if (sellFeePct !== undefined) {
    if (sellFeePct < 0) errors.sellFeePct = 'Selling fee cannot be negative.';
    else if (sellFeePct === 100)
      errors.sellFeePct = 'A 100% selling fee leaves no proceeds, so no selling price exists.';
    else if (sellFeePct > 100) errors.sellFeePct = 'Selling fee cannot exceed 100%.';
    else values.sellFeePct = sellFeePct;
  }

  if (inputs.targetMode !== 'fixed' && inputs.targetMode !== 'percent') {
    errors.targetMode = 'Choose a fixed amount or a percentage target.';
  } else {
    const label = inputs.targetMode === 'percent' ? 'Target profit percentage' : 'Target profit amount';
    const targetValue = read('targetValue', label);
    if (targetValue !== undefined) {
      if (targetValue < 0) errors.targetValue = `${label} cannot be negative.`;
      else {
        values.targetValue = targetValue;
        values.targetMode = inputs.targetMode;
      }
    }
  }

  return { errors, values };
}
