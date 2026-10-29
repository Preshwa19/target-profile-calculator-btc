export default function ResultCard({ label, value, hint, icon: Icon, tone = 'default', hero = false }) {
  const classes = ['result-card', `tone-${tone}`, hero ? 'hero' : ''].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <div className="result-label">
        {Icon ? <Icon size={16} aria-hidden="true" /> : null}
        <span>{label}</span>
      </div>
      <div className="result-value">{value}</div>
      {hint ? <div className="result-hint">{hint}</div> : null}
    </div>
  );
}
