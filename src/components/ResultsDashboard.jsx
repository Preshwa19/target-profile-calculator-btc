import {
  Banknote,
  Check,
  CircleAlert,
  Copy,
  Percent,
  Printer,
  Receipt,
  Scale,
  Target,
  TrendingUp,
  Wallet,
  Calculator,
} from 'lucide-react';
import ResultCard from './ResultCard.jsx';
import { formatMoney, formatNumber, formatPercent } from '../utils/formatting.js';

function ProceedsSplit({ result, currency }) {
  const total = result.grossProceeds;
  const segments = [
    { key: 'cost', label: 'Total investment cost', value: result.totalCost, className: 'seg-cost' },
    { key: 'fee', label: 'Selling fee', value: result.sellingFee, className: 'seg-fee' },
    { key: 'profit', label: 'Net profit', value: result.netProfit, className: 'seg-profit' },
  ];
  const summary = segments
    .map((s) => `${s.label}: ${formatMoney(s.value, currency)} (${formatPercent((s.value / total) * 100, 2)})`)
    .join('; ');

  return (
    <div className="split">
      <h3>Where the gross proceeds go</h3>
      <div className="split-bar" role="img" aria-label={summary}>
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <span key={s.key} className={s.className} style={{ width: `${(s.value / total) * 100}%` }} />
          ))}
      </div>
      <ul className="split-legend">
        {segments.map((s) => (
          <li key={s.key}>
            <span className={`dot ${s.className}`} aria-hidden="true" />
            {s.label}: <strong>{formatMoney(s.value, currency)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResultsDashboard({
  status,
  result,
  currency,
  symbol,
  errorCount,
  copyStatus,
  onCopy,
  onPrint,
}) {
  const label = symbol.trim() || 'coin';
  const m = (v) => formatMoney(v, currency);
  const ready = status === 'ready';

  return (
    <section className="panel results-panel" aria-labelledby="results-title">
      <div className="panel-head">
        <h2 id="results-title">Results</h2>
        <div className="panel-actions no-print">
          <button type="button" className="btn btn-ghost" onClick={onCopy} disabled={!ready}>
            <Copy size={16} aria-hidden="true" /> Copy results
          </button>
          <button type="button" className="btn btn-ghost" onClick={onPrint} disabled={!ready}>
            <Printer size={16} aria-hidden="true" /> Print
          </button>
        </div>
      </div>

      <div className="copy-status no-print" role="status" aria-live="polite">
        {copyStatus ? (
          <span className={copyStatus.type === 'success' ? 'ok' : 'err'}>
            {copyStatus.type === 'success' ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <CircleAlert size={14} aria-hidden="true" />
            )}{' '}
            {copyStatus.message}
          </span>
        ) : null}
      </div>

      {status === 'empty' && (
        <div className="empty-state">
          <Calculator size={32} aria-hidden="true" />
          <h3>Enter your trade details to begin</h3>
          <p>
            Add the number of coins, your average purchase price and a profit target. Results update
            automatically as you type. Or press <strong>Load sample</strong> to see a worked example.
          </p>
        </div>
      )}

      {status === 'incomplete' && (
        <div className="empty-state">
          <Calculator size={32} aria-hidden="true" />
          <h3>Almost there</h3>
          <p>Fill in the remaining required fields (coins, purchase price and profit target) to see your results.</p>
        </div>
      )}

      {status === 'invalid' && (
        <div className="empty-state invalid" role="alert">
          <CircleAlert size={32} aria-hidden="true" />
          <h3>Some inputs need attention</h3>
          <p>
            {errorCount === 1 ? 'One input is' : `${errorCount} inputs are`} missing or invalid. Fix the
            highlighted field{errorCount === 1 ? '' : 's'} to see your results.
          </p>
        </div>
      )}

      {ready && (
        <>
          <p className="inputs-line">
            {formatNumber(result.quantity)} {label} bought at {m(result.purchasePrice)} &middot; fees{' '}
            {formatPercent(result.buyFeePct)} buy / {formatPercent(result.sellFeePct)} sell &middot; target{' '}
            {result.targetMode === 'percent'
              ? `${formatPercent(result.targetValue)} of total cost`
              : `${m(result.targetValue)} net profit`}
          </p>

          <ResultCard
            hero
            icon={Target}
            tone="profit"
            label={`Required selling price per ${label}`}
            value={m(result.requiredSellingPrice)}
            hint="Sell at or above this price to reach your target after both fees."
          />

          <div className="result-grid">
            <ResultCard
              icon={Wallet}
              label="Original investment cost"
              value={m(result.principalCost)}
              hint={`Total incl. buying fee: ${m(result.totalCost)}`}
            />
            <ResultCard icon={Receipt} label="Estimated buying fee" value={m(result.buyingFee)} />
            <ResultCard
              icon={Banknote}
              label="Gross selling proceeds"
              value={m(result.grossProceeds)}
              hint="Before the selling fee. Not profit."
            />
            <ResultCard icon={Receipt} label="Estimated selling fee" value={m(result.sellingFee)} />
            <ResultCard
              icon={Scale}
              label="Net proceeds"
              value={m(result.netProceeds)}
              hint="After the selling fee."
            />
            <ResultCard icon={Target} label="Target profit" value={m(result.targetProfit)} />
            <ResultCard
              icon={TrendingUp}
              tone={result.netProfit < 0 ? 'negative' : 'profit'}
              label="Expected net profit"
              value={m(result.netProfit)}
              hint="Net proceeds minus total investment cost."
            />
            <ResultCard
              icon={Percent}
              tone={result.profitPct < 0 ? 'negative' : 'profit'}
              label="Expected profit percentage"
              value={formatPercent(result.profitPct)}
              hint="Net profit ÷ total investment cost."
            />
          </div>

          <ProceedsSplit result={result} currency={currency} />
        </>
      )}
    </section>
  );
}
