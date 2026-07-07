import PanelRow from '@/ui/components/PanelRow.jsx';
import { ArrowRight } from '@deemlol/next-icons';

export default function SimulationPanel({
  controls,
  onChange,
  onReset,
  stats,
  setSliding
}) {

  return (
    <aside className="simulation-panel">
      <div
        style={{ display: 'flex', justifyContent: 'end', cursor: 'pointer' }}
        onClick={() => setSliding(false)}
      >
        <ArrowRight />
      </div>
      <h1 className="panel-title">لوحة التحكّم الفيزيائية</h1>

      {/* ================= ball attributes ================= */}
      <h2 className="panel-section-title">خصائص الكرة</h2>

      <PanelRow
        label="كتلة الكرة"
        en="Ball Mass"
        formula="p = m·v"
        value={controls.ballMass.toFixed(3)}
      >
        <input
          className="panel-input"
          type="range"
          min="0.14"
          max="0.22"
          step="0.001"
          value={controls.ballMass}
          onChange={(e) => onChange({ ballMass: Number(e.target.value) })}
        />
      </PanelRow>

      <PanelRow
        label="نصف قطر الكرة"
        en="Ball Radius"
        formula="v_slip = v + ω × r"
        value={controls.ballRadius.toFixed(4)}
      >
        <input
          className="panel-input"
          type="range"
          min="0.025"
          max="0.032"
          step="0.0005"
          value={controls.ballRadius}
          onChange={(e) => onChange({ ballRadius: Number(e.target.value) })}
        />
      </PanelRow>

      {/* ================= table friction ================= */}
      <h2 className="panel-section-title">الاحتكاك مع سطح الطاولة</h2>

      <PanelRow
        label="احتكاك الانزلاق"
        en="Sliding Friction μ_slide"
        formula="F_f = μ_slide · m · g"
        value={controls.muSliding.toFixed(3)}
      >
        <input
          className="panel-input"
          type="range"
          min="0.05"
          max="0.35"
          step="0.001"
          value={controls.muSliding}
          onChange={(e) => onChange({ muSliding: Number(e.target.value) })}
        />
      </PanelRow>

      <PanelRow
        label="مقاومة التدحرج"
        en="Rolling Resistance μ_roll"
        formula="a_roll = μ_roll · g"
        value={controls.muRolling.toFixed(4)}
      >
        <input
          className="panel-input"
          type="range"
          min="0.001"
          max="0.02"
          step="0.0005"
          value={controls.muRolling}
          onChange={(e) => onChange({ muRolling: Number(e.target.value) })}
        />
      </PanelRow>

      <PanelRow
        label="تخميد الدوران الجانبي"
        en="Side-Spin Damping"
        formula="ω_side × (1 − k·dt)"
        value={controls.spinDamping.toFixed(3)}
      >
        <input
          className="panel-input"
          type="range"
          min="0"
          max="0.15"
          step="0.001"
          value={controls.spinDamping}
          onChange={(e) => onChange({ spinDamping: Number(e.target.value) })}
        />
      </PanelRow>

      {/* ================= collisions ================= */}
      <h2 className="panel-section-title">معاملات التصادم (الارتداد)</h2>

      <PanelRow
        label="ارتداد كرة-كرة"
        en="Ball-Ball Restitution e_ball"
        formula="v'₂-v'₁ = -e·(v₂-v₁)"
        value={controls.eBall.toFixed(3)}
      >
        <input
          className="panel-input"
          type="range"
          min="0.85"
          max="0.98"
          step="0.005"
          value={controls.eBall}
          onChange={(e) => onChange({ eBall: Number(e.target.value) })}
        />
      </PanelRow>

      <PanelRow
        label="ارتداد الكرة-الحافة"
        en="Cushion Restitution e_cushion"
        formula="v'_n = -e_c · v_n"
        value={controls.eCushion.toFixed(3)}
      >
        <input
          className="panel-input"
          type="range"
          min="0.6"
          max="0.9"
          step="0.005"
          value={controls.eCushion}
          onChange={(e) => onChange({ eCushion: Number(e.target.value) })}
        />
      </PanelRow>

      {/* ================= enviroment ================= */}
      <h2 className="panel-section-title">البيئة</h2>

      <PanelRow
        label="تسارع الجاذبية"
        en="Gravity g"
        formula="W = m·g"
        value={controls.gravity.toFixed(2)}
      >
        <input
          className="panel-input"
          type="range"
          min="5"
          max="10"
          step="0.1"
          value={controls.gravity}
          onChange={(e) => onChange({ gravity: Number(e.target.value) })}
        />
      </PanelRow>

      <div className="panel-actions">
        <button className="panel-button" onClick={onReset}>
          إعادة التعيين
        </button>
      </div>

      {/* ================= metrics ================= */}
      <section className="panel-stats">
        <h2 className="panel-stats-title">مقاييس المحاكاة</h2>
        <div className="panel-stats-grid">
          <div className="panel-stat-item">
            الموقع X: {stats.position.x.toFixed(4)} m
          </div>
          <div className="panel-stat-item">
            الموقع Y: {stats.position.y.toFixed(4)} m
          </div>
          <div className="panel-stat-item">
            السرعة الخطية |v|: {stats.speed.toFixed(4)} m/s
          </div>
          <div className="panel-stat-item">
            السرعة الدورانية |ω|: {stats.spin.toFixed(4)} rad/s
          </div>
          <div className="panel-stat-item">
            انزلاق نقطة التماس: {stats.slipSpeed.toFixed(4)} m/s
          </div>
          <div className="panel-stat-item">
            الزخم الخطي p: {stats.momentum.toFixed(4)} kg·m/s
          </div>
          <div className="panel-stat-item">
            الطاقة الحركية الانتقالية: {stats.translationalEnergy.toFixed(4)} J
          </div>
          <div className="panel-stat-item">
            الطاقة الحركية الدورانية: {stats.rotationalEnergy.toFixed(4)} J
          </div>
          <div className="panel-stat-item">
            الطاقة الكلية: {stats.totalEnergy.toFixed(4)} J
          </div>
          <div className="panel-stat-item">
            قوة الاحتكاك اللحظية: {stats.frictionForce.toFixed(4)} N
          </div>
          <div className="panel-stat-item">
            التسارع: {stats.acceleration?.toFixed(4) || '0.0000'} m/s²
          </div>
          <div className="panel-stat-item">
            حالة الحركة: {stats.isRolling ? 'تدحرج نقي' : 'انزلاق'}
          </div>
          <div className="panel-stat-item">
            المسافة المقطوعة: {stats.distanceTraveled.toFixed(4)} m
          </div>
          <div className="panel-stat-item">
            الزمن: {stats.simulationTime.toFixed(2)} s
          </div>
        </div>
      </section>
    </aside>
  );
}