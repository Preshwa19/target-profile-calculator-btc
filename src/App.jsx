import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import CalculatorForm from './components/CalculatorForm.jsx';
import ResultsDashboard from './components/ResultsDashboard.jsx';
import CalculationBreakdown from './components/CalculationBreakdown.jsx';
import LadderTable from './components/LadderTable.jsx';
import Education from './components/Education.jsx';
import Disclaimer from './components/Disclaimer.jsx';
import { calculateTargetPrice } from './utils/calculations.js';
import { buildSummary } from './utils/formatting.js';

const DEFAULT_INPUTS = {
  symbol: 'BTC',
  quantity: '',
  purchasePrice: '',
  targetMode: 'fixed',
  targetValue: '',
  buyFeePct: '0.1',
  sellFeePct: '0.2',
};

const SAMPLE_INPUTS = {
  symbol: 'BTC',
  quantity: '0.5',
  purchasePrice: '80000',
  targetMode: 'fixed',
  targetValue: '2000',
  buyFeePct: '0.1',
  sellFeePct: '0.2',
};

const THEME_KEY = 'cptp-theme';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* storage unavailable: fall back to default */
  }
  return 'dark';
}

export default function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [touched, setTouched] = useState({});
  const [currency, setCurrency] = useState('INR');
  const [theme, setTheme] = useState(getInitialTheme);
  const [copyStatus, setCopyStatus] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    if (!copyStatus) return undefined;
    const id = setTimeout(() => setCopyStatus(null), 4000);
    return () => clearTimeout(id);
  }, [copyStatus]);

  const calc = useMemo(() => calculateTargetPrice(inputs), [inputs]);

  // Show an error once the field has been touched or contains something.
  const visibleErrors = useMemo(() => {
    const out = {};
    for (const [field, message] of Object.entries(calc.errors)) {
      const hasValue = String(inputs[field] ?? '').trim() !== '';
      if (field === 'general' || touched[field] || hasValue) out[field] = message;
    }
    return out;
  }, [calc.errors, inputs, touched]);

  const errorCount = Object.keys(visibleErrors).length;
  const anyEntered = ['quantity', 'purchasePrice', 'targetValue'].some(
    (f) => String(inputs[f] ?? '').trim() !== '',
  );
  const status = calc.ok ? 'ready' : errorCount > 0 ? 'invalid' : anyEntered ? 'incomplete' : 'empty';

  const handleChange = (field, value) => {
    const next = field === 'symbol' ? value.toUpperCase().replace(/[^A-Z0-9._-]/g, '').slice(0, 12) : value;
    setInputs((prev) => ({ ...prev, [field]: next }));
    setCopyStatus(null);
  };

  const handleBlurField = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setTouched({});
    setCurrency('INR');
    setCopyStatus(null);
  };

  const handleLoadSample = () => {
    setInputs(SAMPLE_INPUTS);
    setTouched({});
    setCurrency('INR');
    setCopyStatus(null);
  };

  const handleScenario = (sc) => {
    setInputs({
      symbol: sc.symbol,
      quantity: sc.quantity,
      purchasePrice: sc.purchasePrice,
      targetMode: sc.targetMode,
      targetValue: sc.targetValue,
      buyFeePct: sc.buyFeePct,
      sellFeePct: sc.sellFeePct,
    });
    setTouched({});
    setCopyStatus(null);
  };

  const handleFeeTier = (tier) => {
    setInputs((prev) => ({ ...prev, buyFeePct: String(tier.buy), sellFeePct: String(tier.sell) }));
    setCopyStatus(null);
  };

  const handleCoin = (symbol) => setInputs((prev) => ({ ...prev, symbol }));

  const handleCopy = async () => {
    if (!calc.ok) return;
    const text = buildSummary({ symbol: inputs.symbol, result: calc.result, currency });
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(text);
      setCopyStatus({ type: 'success', message: 'Results copied to the clipboard.' });
    } catch {
      setCopyStatus({
        type: 'error',
        message: 'Could not copy. Your browser may have blocked clipboard access.',
      });
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="app">
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      <main className="layout">
        <CalculatorForm
          inputs={inputs}
          errors={visibleErrors}
          currency={currency}
          onChange={handleChange}
          onBlurField={handleBlurField}
          onReset={handleReset}
          onLoadSample={handleLoadSample}
          onScenario={handleScenario}
          onFeeTier={handleFeeTier}
          onCoin={handleCoin}
        />

        <div className="results-column">
          <ResultsDashboard
            status={status}
            result={calc.result}
            currency={currency}
            symbol={inputs.symbol}
            errorCount={errorCount}
            copyStatus={copyStatus}
            onCopy={handleCopy}
            onPrint={handlePrint}
          />
          {status === 'ready' && (
            <>
              <LadderTable inputs={inputs} currency={currency} symbol={inputs.symbol} />
              <CalculationBreakdown result={calc.result} currency={currency} symbol={inputs.symbol} />
            </>
          )}
        </div>
      </main>

      <div className="below">
        <Education />
        <Disclaimer />
      </div>
    </div>
  );
}
