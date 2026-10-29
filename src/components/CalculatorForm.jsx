import { CircleAlert, FlaskConical, RotateCcw } from 'lucide-react';
import { CURRENCIES } from '../utils/formatting.js';
import { COIN_CHIPS, FEE_TIERS, SCENARIOS } from '../utils/presets.js';

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  onBlur,
  error,
  suffix,
  placeholder,
  inputMode = 'decimal',
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ');
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy || undefined}
        />
        {suffix ? <span className="suffix">{suffix}</span> : null}
      </div>
      {hint ? (
        <p className="hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="error-text" id={`${id}-error`} role="alert">
          <CircleAlert size={14} aria-hidden="true" /> {error}
        </p>
      ) : null}
    </div>
  );
}

export default function CalculatorForm({
  inputs,
  errors,
  currency,
  onChange,
  onBlurField,
  onReset,
  onLoadSample,
  onScenario,
  onFeeTier,
  onCoin,
}) {
  const c = CURRENCIES[currency];
  const symbolLabel = inputs.symbol.trim() || 'coin';
  const isPercent = inputs.targetMode === 'percent';

  return (
    <section className="panel form-panel no-print" aria-labelledby="form-title">
      <div className="panel-head">
        <h2 id="form-title">Your trade details</h2>
        <div className="panel-actions">
          <button type="button" className="btn btn-ghost" onClick={onLoadSample}>
            <FlaskConical size={16} aria-hidden="true" /> Load sample
          </button>
          <button type="button" className="btn btn-ghost" onClick={onReset}>
            <RotateCcw size={16} aria-hidden="true" /> Reset
          </button>
        </div>
      </div>

      {errors.general ? (
        <p className="error-text banner" role="alert">
          <CircleAlert size={16} aria-hidden="true" /> {errors.general}
        </p>
      ) : null}

      <fieldset className="group">
        <legend>Start from a real-world situation</legend>
        <div className="chips">
          {SCENARIOS.map((sc) => (
            <button key={sc.id} type="button" className="chip" onClick={() => onScenario(sc)}>
              {sc.label}
            </button>
          ))}
        </div>
        <p className="hint">Illustrative numbers in INR. They are not market prices. Edit any field afterwards.</p>
      </fieldset>

      <fieldset className="group">
        <legend>Cryptocurrency</legend>
        <div className="field">
          <label htmlFor="symbol">Name or symbol</label>
          <div className="input-wrap">
            <input
              id="symbol"
              type="text"
              autoComplete="off"
              maxLength={12}
              value={inputs.symbol}
              placeholder="BTC, ETH, SOL…"
              onChange={(e) => onChange('symbol', e.target.value)}
              aria-describedby="symbol-hint"
            />
          </div>
          <div className="chips" aria-label="Common coin symbols">
            {COIN_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip small ${inputs.symbol === c ? 'active' : ''}`}
                onClick={() => onCoin(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="hint" id="symbol-hint">
            A label only. No live market prices are looked up.
          </p>
        </div>

        <NumberField
          id="quantity"
          label="Number of coins owned"
          hint="Decimals are allowed, e.g. 0.5 or 0.00012."
          value={inputs.quantity}
          onChange={(v) => onChange('quantity', v)}
          onBlur={() => onBlurField('quantity')}
          error={errors.quantity}
          suffix={symbolLabel}
          placeholder="e.g. 0.5"
        />

        <NumberField
          id="purchasePrice"
          label={`Average purchase price per ${symbolLabel}`}
          hint={`In ${c.code} (${c.symbol}). Changing currency only changes formatting; amounts are not converted.`}
          value={inputs.purchasePrice}
          onChange={(v) => onChange('purchasePrice', v)}
          onBlur={() => onBlurField('purchasePrice')}
          error={errors.purchasePrice}
          suffix={c.symbol}
          placeholder="e.g. 80000"
        />
      </fieldset>

      <fieldset className="group">
        <legend>Profit target</legend>
        <div className="segmented" role="radiogroup" aria-label="Profit target type">
          {[
            { value: 'fixed', label: 'Fixed amount' },
            { value: 'percent', label: 'Percentage' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={inputs.targetMode === opt.value}
              className={inputs.targetMode === opt.value ? 'active' : ''}
              onClick={() => onChange('targetMode', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <NumberField
          id="targetValue"
          label={isPercent ? 'Target profit (%)' : `Target profit amount (${c.symbol})`}
          hint={
            isPercent
              ? 'Calculated on total investment cost, including the buying fee.'
              : 'The net profit you want after both fees. Use 0 for the break-even price.'
          }
          value={inputs.targetValue}
          onChange={(v) => onChange('targetValue', v)}
          onBlur={() => onBlurField('targetValue')}
          error={errors.targetValue}
          suffix={isPercent ? '%' : c.symbol}
          placeholder={isPercent ? 'e.g. 10' : 'e.g. 2000'}
        />
      </fieldset>

      <fieldset className="group">
        <legend>Trading fees</legend>
        <div className="field-row">
          <NumberField
            id="buyFeePct"
            label="Buying fee"
            value={inputs.buyFeePct}
            onChange={(v) => onChange('buyFeePct', v)}
            onBlur={() => onBlurField('buyFeePct')}
            error={errors.buyFeePct}
            suffix="%"
            placeholder="0.1"
          />
          <NumberField
            id="sellFeePct"
            label="Selling fee"
            value={inputs.sellFeePct}
            onChange={(v) => onChange('sellFeePct', v)}
            onBlur={() => onBlurField('sellFeePct')}
            error={errors.sellFeePct}
            suffix="%"
            placeholder="0.2"
          />
        </div>
        <div className="chips" aria-label="Illustrative fee tiers">
          {FEE_TIERS.map((t) => (
            <button key={t.key} type="button" className="chip small" onClick={() => onFeeTier(t)} title={t.note}>
              {t.label} {t.buy}% / {t.sell}%
            </button>
          ))}
        </div>
        <p className="hint">
          Illustrative tiers and estimates only. Your exchange&rsquo;s actual fees may differ, so check its fee
          schedule.
        </p>
      </fieldset>
    </section>
  );
}
