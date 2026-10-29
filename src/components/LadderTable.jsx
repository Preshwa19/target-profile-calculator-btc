import { ListOrdered } from 'lucide-react';
import { calculateLadder } from '../utils/calculations.js';
import { formatMoney, formatPercent } from '../utils/formatting.js';

export default function LadderTable({ inputs, currency, symbol }) {
  const rows = calculateLadder(inputs);
  if (rows.length === 0) return null;
  const label = symbol.trim() || 'coin';

  return (
    <section className="panel" aria-labelledby="ladder-title">
      <div className="panel-head">
        <h2 id="ladder-title">
          <ListOrdered size={18} aria-hidden="true" /> Take-profit price ladder
        </h2>
      </div>
      <div className="table-wrap">
        <table className="ladder-table">
          <thead>
            <tr>
              <th scope="col">Profit goal</th>
              <th scope="col">Sell price per {label}</th>
              <th scope="col">Net profit</th>
              <th scope="col">Price move needed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.percent}>
                <th scope="row">+{formatPercent(r.percent)}</th>
                <td>{formatMoney(r.price, currency)}</td>
                <td className="up">{formatMoney(r.netProfit, currency)}</td>
                <td>+{formatPercent(r.moveVsPurchasePct, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hint">
        Uses your quantity, purchase price and fees. Profit goals are a percentage of total investment cost. The price
        move is measured against your purchase price, so it is larger than the goal once fees are included.
      </p>
    </section>
  );
}
