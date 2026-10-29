import { Moon, Sun, Target } from 'lucide-react';
import { CURRENCIES } from '../utils/formatting.js';

export default function Header({ currency, onCurrencyChange, theme, onToggleTheme }) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-icon" aria-hidden="true">
          <Target size={22} />
        </span>
        <div>
          <h1>Crypto Target Profit Price Calculator</h1>
          <p>Find the selling price needed to reach your target profit after estimated fees.</p>
        </div>
      </div>

      <div className="header-controls no-print">
        <label className="currency-select">
          <span>Currency</span>
          <select value={currency} onChange={(e) => onCurrencyChange(e.target.value)} aria-label="Currency">
            {Object.values(CURRENCIES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="icon-button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${nextTheme} theme`}
          title={`Switch to ${nextTheme} theme`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
