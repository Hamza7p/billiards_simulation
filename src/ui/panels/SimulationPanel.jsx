import PanelRow from '@/ui/components/PanelRow.jsx';

export default function SimulationPanel({
  controls,
  onChange,
  onShoot,
  onReset,
  stats,
}) {
  return (
    <aside className="simulation-panel">
      <h1 className="panel-title">لوحة التحكّم الفيزيائية</h1>

      <PanelRow
        label="قوة الضربة"
        en="Shot Impulse"
        formula="Δv = J / m"
        value={controls.shotImpulse.toFixed(3)}
      >
        <input
          className="panel-input"
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={controls.shotImpulse}
          onChange={(e) =>
            onChange({ shotImpulse: Number(e.target.value) })
          }
        />
      </PanelRow>

      <PanelRow
        label="زاوية التصويب"
        en="Aim Direction"
        formula="x = cos(θ), y = sin(θ)"
        value={controls.aimDeg.toFixed(1)}
      >
        <input
          className="panel-input"
          type="range"
          min="-180"
          max="180"
          step="1"
          value={controls.aimDeg}
          onChange={(e) =>
            onChange({ aimDeg: Number(e.target.value) })
          }
        />
      </PanelRow>

      <PanelRow
        label="معامل احتكاك القماش"
        en="Sliding Friction μ"
        formula="Ff = μmg"
        value={controls.muSliding.toFixed(3)}
      >
        <input
          className="panel-input"
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={controls.muSliding}
          onChange={(e) =>
            onChange({ muSliding: Number(e.target.value) })
          }
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
          onChange={(e) =>
            onChange({ ballMass: Number(e.target.value) })
          }
        />
      </PanelRow>

      <PanelRow
        label="نصف قطر الكرة"
        en="Ball Radius"
        formula="v = ωr"
        value={controls.ballRadius.toFixed(4)}
      >
        <input
          className="panel-input"
          type="range"
          min="0.01"
          max="0.08"
          step="0.001"
          value={controls.ballRadius}
          onChange={(e) =>
            onChange({ ballRadius: Number(e.target.value) })
          }
        />
      </PanelRow>

      <div className="panel-actions">
        <button className="panel-button" onClick={onShoot}>
          تنفيذ الضربة
        </button>
        <button className="panel-button" onClick={onReset}>
          إعادة التعيين
        </button>
      </div>

        {/* metrics states section  */}
      <section className="panel-stats">
        <h2 className="panel-stats-title">مقياس المحاكاة</h2>
        <div className="panel-stats-grid">
          <div className="panel-stat-item">
            السرعة: {stats.speed.toFixed(4)} m/s
          </div>
          <div className="panel-stat-item">
            الموقع X: {stats.position.x.toFixed(4)}
          </div>
          <div className="panel-stat-item">
            الموقع Y: {stats.position.y.toFixed(4)}
          </div>
          <div className="panel-stat-item">
            الزخم : { stats.momentum.toFixed(4) } kg.m/s
          </div>
          <div className="panel-stat-item">
            الطاقة الحركية : { stats.kineticEnergy.toFixed(4) } J
          </div>
          <div className="panel-stat-item">
            قوة الاحتكاك : {stats.frictionForce.toFixed(4)} N
          </div>
          <div className="panel-stat-item">
            التسارع : {stats.acceleration.toFixed(4)} m/s²
          </div>
          <div className="panel-stat-item">
            الزمن المستغرق: {stats.simulationTime.toFixed(2)} s
          </div>
          <div className="panel-stat-item">
            المسافة المقطوعة : {stats.distanceTraveled.toFixed(4)} m
          </div>

        </div>
      </section>
    </aside>
  );
}
