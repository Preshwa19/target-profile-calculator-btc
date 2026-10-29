import { formatMoney, formatNumber, formatPercent } from '../utils/formatting.js';

export default function CalculationBreakdown({ result, currency, symbol }) {
  if (!result) return null;
  const m = (v) => formatMoney(v, currency);
  const label = symbol.trim() || 'coin';
  const q = formatNumber(result.quantity);
  const keep = 1 - result.sellFeePct / 100;

  const steps = [
    {
      title: 'Original investment cost',
      formula: 'Q × P',
      working: `${q} × ${m(result.purchasePrice)}`,
      value: m(result.principalCost),
    },
    {
      title: 'Buying fee',
      formula: 'Original cost × buying fee %',
      working: `${m(result.principalCost)} × ${formatPercent(result.buyFeePct)}`,
      value: m(result.buyingFee),
    },
    {
      title: 'Total investment cost',
      formula: 'Original cost + buying fee',
      working: `${m(result.principalCost)} + ${m(result.buyingFee)}`,
      value: m(result.totalCost),
    },
    {
      title: 'Target profit',
      formula:
        result.targetMode === 'percent' ? 'Total cost × target % ÷ 100' : 'Fixed amount you entered',
      working:
        result.targetMode === 'percent'
          ? `${m(result.totalCost)} × ${formatPercent(result.targetValue)}`
          : m(result.targetValue),
      value: m(result.targetProfit),
    },
    {
      title: 'Net proceeds needed',
      formula: 'Total cost + target profit',
      working: `${m(result.totalCost)} + ${m(result.targetProfit)}`,
      value: m(result.totalCost + result.targetProfit),
    },
    {
      title: `Required selling price per ${label}`,
      formula: '(Total cost + target profit) ÷ (Q × (1 − selling fee %))',
      working: `${m(result.totalCost + result.targetProfit)} ÷ (${q} × ${formatNumber(keep, 8)})`,
      value: m(result.requiredSellingPrice),
      highlight: true,
    },
    {
      title: 'Gross proceeds, selling fee and net proceeds',
      formula: 'Gross = Q × price; fee = gross × selling fee %; net = gross − fee',
      working: `${m(result.grossProceeds)} − ${m(result.sellingFee)}`,
      value: m(result.netProceeds),
    },
    {
      title: 'Check: net profit',
      formula: 'Net proceeds − total cost',
      working: `${m(result.netProceeds)} − ${m(result.totalCost)}`,
      value: `${m(result.netProfit)} (${formatPercent(result.profitPct)})`,
    },
  ];

  return (
    <section className="panel" aria-labelledby="breakdown-title">
      <div className="panel-head">
        <h2 id="breakdown-title">How the selling price was calculated</h2>
      </div>
      <ol className="steps">
        {steps.map((s) => (
          <li key={s.title} className={s.highlight ? 'highlight' : ''}>
            <div className="step-main">
              <strong>{s.title}</strong>
              <code>{s.formula}</code>
              <span className="working">{s.working}</span>
            </div>
            <div className="step-value">{s.value}</div>
          </li>
        ))}
      </ol>
      <p className="hint">
        Q = number of coins, P = average purchase price. Selling price is divided by (1 − selling fee) because the
        selling fee is taken from the gross proceeds.
      </p>
    </section>
  );
}
