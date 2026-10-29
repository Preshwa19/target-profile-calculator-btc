import { ShieldAlert } from 'lucide-react';

export default function Disclaimer() {
  return (
    <aside className="disclaimer" aria-label="Disclaimer">
      <ShieldAlert size={20} aria-hidden="true" />
      <p>
        This calculator provides estimates for educational purposes only. Results depend on the inputs and fee
        assumptions provided. It does not predict market prices or provide financial advice. Taxes, slippage,
        spreads, funding costs, and other charges are excluded unless explicitly included in the inputs.
      </p>
    </aside>
  );
}
