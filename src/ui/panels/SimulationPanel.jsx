import PanelRow from '@/ui/components/PanelRow.jsx';
import { ArrowRight } from '@deemlol/next-icons';

export default function SimulationPanel({
  controls,
  onChange,
  onShoot,
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
 

      <PanelRow
        label="قوة الضربة"
        en="Shot Impulse"
        formula="Δv = J/m, Δω = (r×J)/I"
        value={controls.shotImpulse.toFixed(3)}
      >
        <input
          className="panel-input"
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={controls.shotImpulse}
          onChange={(e) => onChange({ shotImpulse: Number(e.target.value) })}
        />
      </PanelRow>

      <PanelRow
        label="زاوية التصويب"
        en="Aim Direction"
        formula="اتجاه أفقي للضربة (°)"
        value={controls.aimDeg.toFixed(1)}
      >
        <input
          className="panel-input"
          type="range"
          min="-180"
          max="180"
          step="1"
          value={controls.aimDeg}
          onChange={(e) => onChange({ aimDeg: Number(e.target.value) })}
        />
      </PanelRow>

      <PanelRow
        label="ميل العصا"
        en="Cue Elevation"
        formula="زاوية ميلان العصا (°)"
        value={controls.cueElevDeg.toFixed(1)}
      >
        <input
          className="panel-input"
          type="range"
          min="0"
          max="45"
          step="1"
          value={controls.cueElevDeg}
          onChange={(e) => onChange({ cueElevDeg: Number(e.target.value) })}
        />
      </PanelRow>

      <h2 className="panel-section-title">نقطة التماس على الكرة</h2>

      <PanelRow
        label="يمين / يسار"
        en="Contact X"
        formula="English (جانبي)"
        value={controls.contactX.toFixed(2)}
      >
        <input
          className="panel-input"
          type="range"
          min="-1"
          max="1"
          step="0.05"
          value={controls.contactX}
          onChange={(e) => onChange({ contactX: Number(e.target.value) })}
        />
      </PanelRow>

      <PanelRow
        label="أمام / خلف"
        en="Contact Y"
        formula="Follow / Draw"
        value={controls.contactY.toFixed(2)}
      >
        <input
          className="panel-input"
          type="range"
          min="-1"
          max="1"
          step="0.05"
          value={controls.contactY}
          onChange={(e) => onChange({ contactY: Number(e.target.value) })}
        />
      </PanelRow>

      <PanelRow
        label="أعلى / أسفل"
        en="Contact Z"
        formula="ارتفاع نقطة التماس"
        value={controls.contactZ.toFixed(2)}
      >
        <input
          className="panel-input"
          type="range"
          min="-1"
          max="1"
          step="0.05"
          value={controls.contactZ}
          onChange={(e) => onChange({ contactZ: Number(e.target.value) })}
        />
      </PanelRow>

      <h2 className="panel-section-title">الاحتكاك والسطح</h2>

      <PanelRow
        label="احتكاك حركي"
        en="Kinetic Friction μ_k"
        formula="Ff = μ_k m g"
        value={controls.muSliding.toFixed(3)}
      >
        <input
          className="panel-input"
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={controls.muSliding}
          onChange={(e) => onChange({ muSliding: Number(e.target.value) })}
        />
      </PanelRow>

      <PanelRow
        label="مقاومة التدحرج"
        en="Rolling Resistance μ_r"
        formula="a = μ_r g"
        value={controls.muRolling.toFixed(3)}
      >
        <input
          className="panel-input"
          type="range"
          min="0"
          max="0.1"
          step="0.001"
          value={controls.muRolling}
          onChange={(e) => onChange({ muRolling: Number(e.target.value) })}
        />
      </PanelRow>

      <PanelRow
        label="تخميد الدوران"
        en="Spin Damping"
        formula="ω × (1 − k·dt)"
        value={controls.spinDamping.toFixed(3)}
      >
        <input
          className="panel-input"
          type="range"
          min="0"
          max="0.2"
          step="0.001"
          value={controls.spinDamping}
          onChange={(e) => onChange({ spinDamping: Number(e.target.value) })}
        />
      </PanelRow>

      <PanelRow
        label="كتلة الكرة"
        en="Ball Mass"
        formula="p = mv"
        value={controls.ballMass.toFixed(3)}
      >
        <input
          className="panel-input"
          type="range"
          min="0.05"
          max="0.5"
          step="0.005"
          value={controls.ballMass}
          onChange={(e) => onChange({ ballMass: Number(e.target.value) })}
        />
      </PanelRow>

      <PanelRow
        label="نصف قطر الكرة"
        en="Ball Radius"
        formula="v_slip = v + ω×r"
        value={controls.ballRadius.toFixed(4)}
      >
        <input
          className="panel-input"
          type="range"
          min="0.01"
          max="0.08"
          step="0.001"
          value={controls.ballRadius}
          onChange={(e) => onChange({ ballRadius: Number(e.target.value) })}
        />
      </PanelRow>

      <div className="panel-actions">
        <button className="panel-button" onClick={onShoot}>
          تنفيذ الضربة
        </button>
        <button className="panel-button" onClick={onReset}>
          إعادة التعيين
        </button>
        <button
          className="panel-button"
          onClick={() =>
            onChange({
              cameraMode: controls.cameraMode === 'perspective' ? 'orthographic' : 'perspective',
            })
          }
        >
          {controls.cameraMode === 'perspective' ? 'عرض علوي' : 'عرض منظوري'}
        </button>
        {/* <button className="panel-button" onClick={onCameraReset}> */}
          {/* إعادة وضع الكاميرا */}
        {/* </button> */}
      </div>

      <section className="panel-stats">
        <h2 className="panel-stats-title">مقياس المحاكاة</h2>
        <div className="panel-stats-grid">
          <div className="panel-stat-item">
            السرعة: {stats.speed.toFixed(4)} m/s
          </div>
          <div className="panel-stat-item">
            الدوران |ω|: {stats.spin.toFixed(4)} rad/s
          </div>
          <div className="panel-stat-item">
            انزلاق التماس: {stats.slipSpeed.toFixed(4)} m/s
          </div>
          <div className="panel-stat-item">
            الموقع X: {stats.position.x.toFixed(4)}
          </div>
          <div className="panel-stat-item">
            الموقع Y: {stats.position.y.toFixed(4)}
          </div>
          <div className="panel-stat-item">
            الزخم: {stats.momentum.toFixed(4)} kg·m/s
          </div>
          <div className="panel-stat-item">
            الطاقة الحركية: {stats.kineticEnergy.toFixed(4)} J
          </div>
          <div className="panel-stat-item">
            الطاقة الدورانية: {stats.rotationalEnergy.toFixed(4)} J
          </div>
          <div className="panel-stat-item">
            قوة الاحتكاك: {stats.frictionForce.toFixed(4)} N
          </div>
          <div className="panel-stat-item">
            التسارع: {stats.acceleration.toFixed(4)} m/s²
          </div>
          <div className="panel-stat-item">
            الزمن: {stats.simulationTime.toFixed(2)} s
          </div>
          <div className="panel-stat-item">
            المسافة: {stats.distanceTraveled.toFixed(4)} m
          </div>
        </div>
      </section>
    </aside>
  );
}
