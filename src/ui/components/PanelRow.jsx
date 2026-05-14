export default function PanelRow({
  label,
  en,
  formula,
  value,
  children,
}) {
  return (
    <section className="panel-row">
      <div className="panel-row-header">
        <div className="panel-row-title">{label}</div>
        <div className="panel-row-subtitle">{en}</div>
        <div className="panel-row-formula">{formula}</div>
        <div className="panel-row-value">Current value: {value}</div>
      </div>
      {children}
    </section>
  );
}
