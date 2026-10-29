import { BookOpen } from 'lucide-react';

const TOPICS = [
  {
    title: 'What is a target profit price?',
    body: 'It is the selling price per coin at which your sale would leave you with the profit you chose, after the fees you entered. It is simple arithmetic based on your inputs, not a forecast.',
  },
  {
    title: 'Why do fees change the required price?',
    body: 'The buying fee raises your total cost, and the selling fee is taken out of what you receive. To still end up with your target, the sale price has to cover both, so it is higher than just your purchase price plus the profit.',
  },
  {
    title: 'Gross proceeds vs. net profit',
    body: 'Gross proceeds are the total sale value before the selling fee. Net proceeds are what remains after that fee. Net profit is net proceeds minus everything you paid to buy, including the buying fee.',
  },
  {
    title: 'A target price is not a prediction',
    body: 'Knowing the price you need does not mean the market will reach it. Prices can move in either direction, and this calculator says nothing about whether or when that will happen.',
  },
];

export default function Education() {
  return (
    <section className="panel no-print" aria-labelledby="learn-title">
      <div className="panel-head">
        <h2 id="learn-title">
          <BookOpen size={18} aria-hidden="true" /> Understanding the numbers
        </h2>
      </div>
      <div className="edu-grid">
        {TOPICS.map((t) => (
          <article key={t.title}>
            <h3>{t.title}</h3>
            <p>{t.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
